import { BaseRunner, RunnerCallbacks } from './BaseRunner';
import { Language } from '@cloud-ide/shared';

export class ReactRunner extends BaseRunner {
  constructor(projectId: string, entryFile = 'src/App.jsx', callbacks: RunnerCallbacks) {
    super(projectId, entryFile, callbacks);
  }

  getLanguage(): Language {
    return 'react';
  }

  getExecutionCommand(): { command: string; args: string[] } {
    return {
      command: 'npm',
      args: ['run', 'dev'],
    };
  }
}
