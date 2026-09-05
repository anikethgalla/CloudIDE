import { BaseRunner, RunnerCallbacks } from './BaseRunner';
import { Language } from '@cloud-ide/shared';

export class NodeRunner extends BaseRunner {
  constructor(projectId: string, entryFile = 'index.js', callbacks: RunnerCallbacks) {
    super(projectId, entryFile, callbacks);
  }

  getLanguage(): Language {
    return 'javascript';
  }

  getExecutionCommand(): { command: string; args: string[] } {
    return {
      command: 'node',
      args: [this.entryFile],
    };
  }
}
