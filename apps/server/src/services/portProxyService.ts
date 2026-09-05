import { Request, Response, NextFunction } from 'express';
import http from 'http';
import net from 'net';
import { WorkspacePort } from '@cloud-ide/shared';

export class PortProxyService {
  private static workspacePorts: Map<string, Set<number>> = new Map();

  static registerPort(projectId: string, port: number) {
    if (!this.workspacePorts.has(projectId)) {
      this.workspacePorts.set(projectId, new Set());
    }
    this.workspacePorts.get(projectId)!.add(port);
  }

  static unregisterPort(projectId: string, port: number) {
    this.workspacePorts.get(projectId)?.delete(port);
  }

  static async scanPort(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(400);

      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });

      socket.on('error', () => {
        resolve(false);
      });

      socket.connect(port, '127.0.0.1');
    });
  }

  static async getActivePorts(projectId: string): Promise<WorkspacePort[]> {
    const commonPorts = [3000, 3001, 5000, 5173, 8000, 8080, 8888, 4200, 8081];
    const known = Array.from(this.workspacePorts.get(projectId) || []);
    const candidates = Array.from(new Set([...known, ...commonPorts]));

    const results: WorkspacePort[] = [];

    await Promise.all(
      candidates.map(async (port) => {
        const isOpen = await this.scanPort(port);
        if (isOpen) {
          results.push({
            port,
            processName: `Port ${port} Server`,
            protocol: 'http',
            status: 'open',
            url: `/api/proxy/${projectId}/${port}`,
          });
        }
      })
    );

    return results.sort((a, b) => a.port - b.port);
  }

  /**
   * Proxies HTTP requests to the target port.
   */
  static handleProxyRequest(req: Request, res: Response) {
    const { projectId, port } = req.params;
    const targetPort = parseInt(port, 10);

    if (isNaN(targetPort) || targetPort <= 0 || targetPort > 65535) {
      return res.status(400).json({ error: 'Invalid port number specified.' });
    }

    // Rewrite path: strip prefix /api/proxy/:projectId/:port
    const prefix = `/api/proxy/${projectId}/${port}`;
    let targetPath = req.originalUrl.substring(prefix.length);
    if (!targetPath.startsWith('/')) {
      targetPath = '/' + targetPath;
    }

    const options: http.RequestOptions = {
      hostname: '127.0.0.1',
      port: targetPort,
      path: targetPath || '/',
      method: req.method,
      headers: {
        ...req.headers,
        host: `127.0.0.1:${targetPort}`,
        'x-forwarded-for': req.ip,
        'x-forwarded-proto': req.protocol,
        'x-forwarded-host': req.headers.host,
      },
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      if (!res.headersSent) {
        res.status(502).json({
          error: `Bad Gateway: Unable to reach server on port ${targetPort}. Is the application running?`,
          details: err.message,
          port: targetPort,
        });
      }
    });

    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      if (typeof req.body === 'object') {
        proxyReq.write(JSON.stringify(req.body));
      } else {
        proxyReq.write(req.body);
      }
    }

    req.pipe(proxyReq);
  }
}
