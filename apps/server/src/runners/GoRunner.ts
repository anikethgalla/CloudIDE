import fs from 'fs';
import path from 'path';
import { BaseRunner, RunnerCallbacks } from './BaseRunner';
import { Language } from '@cloud-ide/shared';

function getGoExecutable(): string {
  const candidates = [
    path.resolve(process.cwd(), 'tools/go/bin/go.exe'),
    path.resolve(process.cwd(), '../../tools/go/bin/go.exe'),
    'go'
  ];
  for (const candidate of candidates) {
    if (candidate === 'go' || fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return 'go';
}

export class GoRunner extends BaseRunner {
  constructor(projectId: string, entryFile = 'main.go', callbacks: RunnerCallbacks) {
    super(projectId, entryFile, callbacks);
  }

  getLanguage(): Language {
    return 'go';
  }

  getExecutionCommand(): { command: string; args: string[] } {
    const goModPath = path.join(this.projectPath, 'go.mod');
    const hasGoMod = fs.existsSync(goModPath);
    const goCmd = getGoExecutable();

    // If entry file is a test file, run go test
    if (this.entryFile.endsWith('_test.go')) {
      return {
        command: goCmd,
        args: ['test', '-v', './...'],
      };
    }

    // If go.mod exists and entryFile is standard main.go / package root, use 'go run .'
    if (hasGoMod && (this.entryFile === 'main.go' || this.entryFile === '.')) {
      return {
        command: goCmd,
        args: ['run', '.'],
      };
    }

    return {
      command: goCmd,
      args: ['run', this.entryFile],
    };
  }
}
