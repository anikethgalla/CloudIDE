import { BaseRunner, RunnerCallbacks } from './BaseRunner';
import { Language } from '@cloud-ide/shared';

export class PythonRunner extends BaseRunner {
  constructor(projectId: string, entryFile = 'main.py', callbacks: RunnerCallbacks) {
    super(projectId, entryFile, callbacks);
  }

  getLanguage(): Language {
    return 'python';
  }

  getExecutionCommand(): { command: string; args: string[] } {
    return {
      command: 'python',
      args: ['-u', this.entryFile], // -u for unbuffered stdout
    };
  }
}
