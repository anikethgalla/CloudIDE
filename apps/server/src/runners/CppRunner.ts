import os from 'os';
import { BaseRunner, RunnerCallbacks } from './BaseRunner';
import { Language } from '@cloud-ide/shared';

export class CppRunner extends BaseRunner {
  constructor(projectId: string, entryFile = 'main.cpp', callbacks: RunnerCallbacks) {
    super(projectId, entryFile, callbacks);
  }

  getLanguage(): Language {
    return 'cpp';
  }

  getExecutionCommand(): { command: string; args: string[] } {
    const isWindows = os.platform() === 'win32';
    const binary = isWindows ? 'main.exe' : './main';

    return {
      command: `g++ -std=c++20 "${this.entryFile}" -o ${isWindows ? 'main.exe' : 'main'} && ${binary}`,
      args: [],
    };
  }
}
