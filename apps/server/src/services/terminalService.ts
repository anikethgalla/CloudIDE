import { spawn, ChildProcess } from 'child_process';
import os from 'os';
import { WebSocket } from 'ws';
import { SecurePathResolver } from '../utils/securePath';
import { EnvService } from './envService';
import { PortProxyService } from './portProxyService';

let pty: any = null;
try {
  pty = require('node-pty');
} catch (e) {
  console.warn('[TerminalService] node-pty not available, falling back to standard child_process spawn.');
}

interface TerminalSession {
  projectId: string;
  process?: ChildProcess;
  ptyProcess?: any;
  ws: WebSocket;
}

export class TerminalService {
  private static sessions: Map<string, TerminalSession> = new Map();

  static async handleConnection(ws: WebSocket, projectId: string) {
    let projectRoot: string;
    try {
      projectRoot = SecurePathResolver.getProjectRoot(projectId);
    } catch (err: any) {
      ws.send(`\r\n\x1b[31mError: ${err.message}\x1b[0m\r\n`);
      ws.close();
      return;
    }

    const envVars = await EnvService.getEnvVars(projectId);
    const customEnv = EnvService.getEnvObject(envVars);

    const isWindows = os.platform() === 'win32';
    const shell = isWindows
      ? 'powershell.exe'
      : process.env.SHELL || '/bin/bash';

    const sessionId = `${projectId}-${Date.now()}`;
    const portRegex = /(?:localhost|127\.0\.0\.1|port|listening on)[\s:]+(\d{2,5})/i;

    // Preferred: True PTY (ConPTY on Windows / PTY on Linux & macOS)
    if (pty) {
      try {
        const ptyProcess = pty.spawn(shell, isWindows ? ['-NoLogo'] : ['-i'], {
          name: 'xterm-256color',
          cols: 80,
          rows: 24,
          cwd: projectRoot,
          env: {
            ...process.env,
            ...customEnv,
            TERM: 'xterm-256color',
            COLORTERM: 'truecolor',
          },
        });

        this.sessions.set(sessionId, { projectId, ptyProcess, ws });

        ptyProcess.onData((data: string) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(data);
          }
          const match = data.match(portRegex);
          if (match && match[1]) {
            const port = parseInt(match[1], 10);
            if (port >= 1000 && port <= 65535) {
              PortProxyService.registerPort(projectId, port);
            }
          }
        });

        ptyProcess.onExit(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send('\r\n\x1b[33mSession ended.\x1b[0m\r\n');
            ws.close();
          }
          this.sessions.delete(sessionId);
        });

        ws.on('message', (message: string) => {
          try {
            const msg = JSON.parse(message.toString());
            if (msg.type === 'input' && msg.data) {
              ptyProcess.write(msg.data);
            } else if (msg.type === 'resize' && msg.cols && msg.rows) {
              try {
                ptyProcess.resize(Math.max(10, msg.cols), Math.max(5, msg.rows));
              } catch (_) {}
            }
          } catch (_) {
            ptyProcess.write(message.toString());
          }
        });

        ws.on('close', () => {
          try {
            ptyProcess.kill();
          } catch (_) {}
          this.sessions.delete(sessionId);
        });

        return;
      } catch (err) {
        console.error('[TerminalService] PTY spawn failed, falling back:', err);
      }
    }

    // Fallback: Standard child process spawn
    const shellArgs = isWindows ? [] : ['-i'];
    const proc = spawn(shell, shellArgs, {
      cwd: projectRoot,
      env: {
        ...process.env,
        TERM: 'xterm-256color',
        COLORTERM: 'truecolor',
      },
    });

    this.sessions.set(sessionId, { projectId, process: proc, ws });

    proc.stdout?.on('data', (data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data.toString());
      }
    });

    proc.stderr?.on('data', (data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data.toString());
      }
    });

    proc.on('close', () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send('\r\n\x1b[33mSession ended.\x1b[0m\r\n');
        ws.close();
      }
      this.sessions.delete(sessionId);
    });

    ws.on('message', (message: string) => {
      try {
        const msg = JSON.parse(message.toString());
        if (msg.type === 'input' && msg.data) {
          proc.stdin?.write(msg.data);
        }
      } catch (_) {
        proc.stdin?.write(message.toString());
      }
    });

    ws.on('close', () => {
      try {
        proc.kill();
      } catch (_) {}
      this.sessions.delete(sessionId);
    });
  }
}
