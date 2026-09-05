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
  isAlive: boolean;
  heartbeatInterval?: NodeJS.Timeout;
}

export class TerminalService {
  private static sessions: Map<string, TerminalSession> = new Map();

  static async handleConnection(ws: WebSocket, projectId: string) {
    let projectRoot: string;
    try {
      projectRoot = SecurePathResolver.getProjectRoot(projectId);
    } catch (err: any) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(`\r\n\x1b[31mError: ${err.message}\x1b[0m\r\n`);
        ws.close();
      }
      return;
    }

    const envVars = await EnvService.getEnvVars(projectId);
    const customEnv = EnvService.getEnvObject(envVars);

    const isWindows = os.platform() === 'win32';
    const shell = isWindows
      ? 'powershell.exe'
      : process.env.SHELL || '/bin/bash';

    const sessionId = `${projectId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const portRegex = /(?:localhost|127\.0\.0\.1|port|listening on)[\s:]+(\d{2,5})/i;

    let currentPty: any = null;
    let currentProc: ChildProcess | null = null;

    // Heartbeat ping/pong keepalive
    let isAlive = true;
    ws.on('pong', () => {
      isAlive = true;
    });

    const heartbeatInterval = setInterval(() => {
      if (!isAlive) {
        console.log(`[TerminalService] Socket inactive for session ${sessionId}, terminating.`);
        cleanup();
        ws.terminate();
        return;
      }
      isAlive = false;
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    }, 25000);

    const cleanup = () => {
      clearInterval(heartbeatInterval);
      if (currentPty) {
        try {
          currentPty.kill();
        } catch (_) {}
        currentPty = null;
      }
      if (currentProc) {
        try {
          currentProc.kill();
        } catch (_) {}
        currentProc = null;
      }
      TerminalService.sessions.delete(sessionId);
    };

    // Helper to spawn a shell process
    const spawnShell = () => {
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

          currentPty = ptyProcess;

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

          ptyProcess.onExit(({ exitCode, signal }: { exitCode: number; signal?: number }) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(`\r\n\x1b[33m[Process exited with code ${exitCode}. Press Enter to restart shell]\x1b[0m\r\n`);
            }
            currentPty = null;
          });

          return true;
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

      currentProc = proc;

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

      proc.on('close', (code) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(`\r\n\x1b[33m[Process exited with code ${code}. Press Enter to restart shell]\x1b[0m\r\n`);
        }
        currentProc = null;
      });

      return false;
    };

    // Initial spawn
    spawnShell();

    TerminalService.sessions.set(sessionId, {
      projectId,
      ptyProcess: currentPty,
      process: currentProc || undefined,
      ws,
      isAlive: true,
      heartbeatInterval,
    });

    ws.on('message', (message: string) => {
      isAlive = true;
      try {
        const msg = JSON.parse(message.toString());

        // Handle keepalive ping
        if (msg.type === 'ping') {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'pong' }));
          }
          return;
        }

        if (msg.type === 'input' && msg.data !== undefined) {
          // If no active process, restart on Enter or input
          if (!currentPty && !currentProc) {
            spawnShell();
          }

          if (currentPty) {
            currentPty.write(msg.data);
          } else {
            const proc = currentProc as ChildProcess | null;
            if (proc && proc.stdin) {
              proc.stdin.write(msg.data);
            }
          }
        } else if (msg.type === 'resize' && msg.cols && msg.rows) {
          if (currentPty) {
            try {
              currentPty.resize(Math.max(10, msg.cols), Math.max(5, msg.rows));
            } catch (_) {}
          }
        }
      } catch (_) {
        // Raw string input
        if (!currentPty && !currentProc) {
          spawnShell();
        }
        if (currentPty) {
          currentPty.write(message.toString());
        } else {
          const proc = currentProc as ChildProcess | null;
          if (proc && proc.stdin) {
            proc.stdin.write(message.toString());
          }
        }
      }
    });

    ws.on('close', () => {
      cleanup();
    });

    ws.on('error', (err) => {
      console.warn(`[TerminalService] WebSocket error on session ${sessionId}:`, err.message);
      cleanup();
    });
  }
}
