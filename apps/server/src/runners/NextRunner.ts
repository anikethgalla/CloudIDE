import { BaseRunner, RunnerCallbacks } from './BaseRunner';
import { Language } from '@cloud-ide/shared';

export class NextRunner extends BaseRunner {
  constructor(projectId: string, entryFile = 'app/page.tsx', callbacks: RunnerCallbacks) {
    super(projectId, entryFile, callbacks);
  }

  getLanguage(): Language {
    return 'nextjs';
  }

  getExecutionCommand(): { command: string; args: string[] } {
    return {
      command: 'npm',
      args: ['run', 'dev'],
    };
  }
}
