import path from 'path';
import { BaseRunner, RunnerCallbacks } from './BaseRunner';
import { Language } from '@cloud-ide/shared';

export class JavaRunner extends BaseRunner {
  constructor(projectId: string, entryFile = 'Main.java', callbacks: RunnerCallbacks) {
    super(projectId, entryFile, callbacks);
  }

  getLanguage(): Language {
    return 'java';
  }

  getExecutionCommand(): { command: string; args: string[] } {
    const className = path.basename(this.entryFile, '.java');
    return {
      command: `javac "${this.entryFile}" && java ${className}`,
      args: [],
    };
  }
}
