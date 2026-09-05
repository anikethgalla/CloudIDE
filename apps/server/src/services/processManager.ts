import { spawn, ChildProcess } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import { WorkspaceProcess } from '@cloud-ide/shared';
import { SecurePathResolver } from '../utils/securePath';
import { EnvService } from './envService';
import { PortProxyService } from './portProxyService';

interface ManagedProcess {
  info: WorkspaceProcess;
  child: ChildProcess;
  logs: string[];
}

export class ProcessManager {
  private static processes: Map<string, ManagedProcess> = new Map();

  static async startProcess(
    projectId: string,
    command: string,
    args: string[] = [],
    name?: string
  ): Promise<WorkspaceProcess> {
    const projectRoot = SecurePathResolver.getProjectRoot(projectId);
    const envVars = await EnvService.getEnvVars(projectId);
    const customEnv = EnvService.getEnvObject(envVars);

    const isWindows = process.platform === 'win32';
    const procId = uuidv4();
    const startTime = new Date().toISOString();

    const child = spawn(command, args, {
      cwd: projectRoot,
      shell: isWindows,
      env: {
        ...process.env,
        ...customEnv,
        PORT: customEnv.PORT || '3000',
      },
    });

    const info: WorkspaceProcess = {
      id: procId,
      projectId,
      name: name || `${command} ${args.join(' ')}`.trim(),
      command,
      args,
      pid: child.pid,
      status: 'running',
      startTime,
    };

    const managed: ManagedProcess = {
      info,
      child,
      logs: [],
    };

    this.processes.set(procId, managed);

    // Watch stdout for port announcements (e.g., localhost:3000, port 8080)
    const portRegex = /(?:localhost|127\.0\.0\.1|port|listening on)[\s:]+(\d{2,5})/i;

    child.stdout?.on('data', (data) => {
      const text = data.toString();
      managed.logs.push(text);
      if (managed.logs.length > 500) managed.logs.shift();

      const match = text.match(portRegex);
      if (match && match[1]) {
        const port = parseInt(match[1], 10);
        if (port >= 1000 && port <= 65535) {
          info.port = port;
          PortProxyService.registerPort(projectId, port);
        }
      }
    });

    child.stderr?.on('data', (data) => {
      managed.logs.push(data.toString());
      if (managed.logs.length > 500) managed.logs.shift();
    });

    child.on('close', (code) => {
      info.status = code === 0 ? 'completed' : 'failed';
      info.endTime = new Date().toISOString();
      info.exitCode = code;
      if (info.port) {
        PortProxyService.unregisterPort(projectId, info.port);
      }
    });

    return info;
  }

  static getProcesses(projectId: string): WorkspaceProcess[] {
    const list: WorkspaceProcess[] = [];
    for (const p of this.processes.values()) {
      if (p.info.projectId === projectId) {
        list.push(p.info);
      }
    }
    return list;
  }

  static getLogs(procId: string): string[] {
    return this.processes.get(procId)?.logs || [];
  }

  static stopProcess(procId: string): boolean {
    const managed = this.processes.get(procId);
    if (!managed) return false;

    try {
      if (process.platform === 'win32' && managed.child.pid) {
        spawn('taskkill', ['/pid', managed.child.pid.toString(), '/T', '/F']);
      } else {
        managed.child.kill('SIGTERM');
      }
      managed.info.status = 'stopped';
      managed.info.endTime = new Date().toISOString();
      if (managed.info.port) {
        PortProxyService.unregisterPort(managed.info.projectId, managed.info.port);
      }
      return true;
    } catch (_) {
      return false;
    }
  }

  static stopAllForProject(projectId: string) {
    for (const [id, p] of this.processes.entries()) {
      if (p.info.projectId === projectId) {
        this.stopProcess(id);
      }
    }
  }
}
