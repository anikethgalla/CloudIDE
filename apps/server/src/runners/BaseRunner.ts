import { ChildProcess, spawn, exec } from 'child_process';
import os from 'os';
import path from 'path';
import { ExecutionStatus, Language, EXECUTION_LIMITS } from '@cloud-ide/shared';
import { SecurePathResolver } from '../utils/securePath';

export interface RunnerCallbacks {
  onOutput: (chunk: { type: 'stdout' | 'stderr' | 'system'; data: string }) => void;
  onStatus: (status: ExecutionStatus) => void;
}

export abstract class BaseRunner {
  protected projectId: string;
  protected projectPath: string;
  protected entryFile: string;
  protected callbacks: RunnerCallbacks;
  protected childProcess: ChildProcess | null = null;
  protected isStopped = false;
  protected timeoutHandle: NodeJS.Timeout | null = null;

  constructor(
    projectId: string,
    entryFile: string,
    callbacks: RunnerCallbacks
  ) {
    this.projectId = projectId;
    this.projectPath = SecurePathResolver.getProjectRoot(projectId);
    this.entryFile = entryFile;
    this.callbacks = callbacks;
  }

  abstract getLanguage(): Language;
  abstract getExecutionCommand(): { command: string; args: string[] };

  public async run(): Promise<number | null> {
    return new Promise((resolve) => {
      try {
        const { command, args } = this.getExecutionCommand();

        this.callbacks.onStatus('RUNNING');
        this.callbacks.onOutput({
          type: 'system',
          data: `\x1b[38;5;244m[Runner] Starting ${this.getLanguage()} execution: ${command} ${args.join(' ')}\x1b[0m\r\n\r\n`,
        });

        // Set execution timeout limit
        this.timeoutHandle = setTimeout(() => {
          this.callbacks.onStatus('TIMEOUT');
          this.callbacks.onOutput({
            type: 'system',
            data: `\r\n\x1b[38;5;208m⚠ [Runner] Execution exceeded maximum timeout of ${
              EXECUTION_LIMITS.DEFAULT_TIMEOUT_MS / 1000
            }s. Process terminated.\x1b[0m\r\n`,
          });
          this.stop();
          resolve(null);
        }, EXECUTION_LIMITS.DEFAULT_TIMEOUT_MS);

        const isWindows = os.platform() === 'win32';

        // Spawn child process in project workspace
        this.childProcess = spawn(command, args, {
          cwd: this.projectPath,
          shell: isWindows, // on Windows, shell handles node/python/g++ in path
          env: {
            ...process.env,
            NODE_ENV: 'development',
            PYTHONUNBUFFERED: '1',
          },
        });

        this.childProcess.stdout?.on('data', (data) => {
          this.callbacks.onOutput({
            type: 'stdout',
            data: data.toString(),
          });
        });

        this.childProcess.stderr?.on('data', (data) => {
          this.callbacks.onOutput({
            type: 'stderr',
            data: data.toString(),
          });
        });

        this.childProcess.on('error', (err) => {
          this.clearTimer();
          this.callbacks.onStatus('FAILED');
          this.callbacks.onOutput({
            type: 'stderr',
            data: `\r\n\x1b[38;5;196m[Execution Error] ${err.message}\x1b[0m\r\n`,
          });
          resolve(null);
        });

        this.childProcess.on('close', (code) => {
          this.clearTimer();
          if (this.isStopped) {
            this.callbacks.onStatus('STOPPED');
            resolve(code);
            return;
          }

          if (code === 0) {
            this.callbacks.onStatus('SUCCESS');
            this.callbacks.onOutput({
              type: 'system',
              data: `\r\n\x1b[38;5;34m✔ Process finished with exit code 0\x1b[0m\r\n`,
            });
          } else {
            this.callbacks.onStatus('FAILED');
            this.callbacks.onOutput({
              type: 'system',
              data: `\r\n\x1b[38;5;196m✖ Process exited with error code ${code}\x1b[0m\r\n`,
            });
          }
          resolve(code);
        });
      } catch (err: any) {
        this.clearTimer();
        this.callbacks.onStatus('FAILED');
        this.callbacks.onOutput({
          type: 'stderr',
          data: `\r\n\x1b[38;5;196m[Fatal Error] ${err.message}\x1b[0m\r\n`,
        });
        resolve(null);
      }
    });
  }

  public stop() {
    this.isStopped = true;
    this.clearTimer();
    if (this.childProcess && this.childProcess.pid) {
      if (os.platform() === 'win32') {
        try {
          exec(`taskkill /pid ${this.childProcess.pid} /T /F`, () => {});
        } catch (_) {
          this.childProcess.kill('SIGKILL');
        }
      } else {
        this.childProcess.kill('SIGKILL');
      }
    }
  }

  private clearTimer() {
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = null;
    }
  }
}
