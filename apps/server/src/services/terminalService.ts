import { spawn, ChildProcess } from 'child_process';
import os from 'os';
import { WebSocket } from 'ws';
import { SecurePathResolver } from '../utils/securePath';
import { DockerSandboxService } from './sandboxService';

interface TerminalSession {
  projectId: string;
  process: ChildProcess;
  ws: WebSocket;
}

export class TerminalService {
  private static sessions: Map<string, TerminalSession> = new Map();

  static handleConnection(ws: WebSocket, projectId: string) {
    let projectRoot: string;
    try {
      projectRoot = SecurePathResolver.getProjectRoot(projectId);
    } catch (err: any) {
      ws.send(`\r\n\x1b[31mError: ${err.message}\x1b[0m\r\n`);
      ws.close();
      return;
    }

    const isWindows = os.platform() === 'win32';
    // Use powershell / cmd on windows, or bash on linux/mac
    const shell = isWindows
      ? process.env.COMSPEC || 'powershell.exe'
      : process.env.SHELL || '/bin/bash';

    const shellArgs = isWindows ? [] : ['-i'];

    const proc = spawn(shell, shellArgs, {
      cwd: projectRoot,
      env: {
        ...process.env,
        TERM: 'xterm-256color',
        COLORTERM: 'truecolor',
        PS1: '\\[\\033[01;32m\\]sandbox\\[\\033[00m\\]:\\[\\033[01;34m\\]\\w\\[\\033[00m\\]\\$ ',
      },
    });

    const sessionId = `${projectId}-${Date.now()}`;
    this.sessions.set(sessionId, { projectId, process: proc, ws });

    // Stream process output to WebSocket
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

    // Handle incoming messages from browser xterm.js
    ws.on('message', (message: string) => {
      try {
        const msg = JSON.parse(message.toString());
        if (msg.type === 'input' && msg.data) {
          proc.stdin?.write(msg.data);
        } else if (msg.type === 'resize') {
          // Resize signal (if supported by OS)
        }
      } catch (_) {
        // Raw text input fallback
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
