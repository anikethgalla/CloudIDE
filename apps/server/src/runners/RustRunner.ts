import fs from 'fs';
import path from 'path';
import { BaseRunner, RunnerCallbacks } from './BaseRunner';
import { Language } from '@cloud-ide/shared';

export class RustRunner extends BaseRunner {
  constructor(projectId: string, entryFile = 'src/main.rs', callbacks: RunnerCallbacks) {
    super(projectId, entryFile, callbacks);
  }

  getLanguage(): Language {
    return 'rust';
  }

  getExecutionCommand(): { command: string; args: string[] } {
    const cargoTomlPath = path.join(this.projectPath, 'Cargo.toml');
    const hasCargo = fs.existsSync(cargoTomlPath);

    if (this.entryFile.includes('test') || this.entryFile.endsWith('_test.rs')) {
      if (hasCargo) {
        return {
          command: 'cargo',
          args: ['test', '--', '--nocapture'],
        };
      }
    }

    if (hasCargo) {
      return {
        command: 'cargo',
        args: ['run', '--quiet'],
      };
    }

    // Direct rustc compilation fallback
    const isWindows = process.platform === 'win32';
    const outExe = isWindows ? 'main.exe' : './main';
    return {
      command: 'rustc',
      args: [this.entryFile, '-o', outExe],
    };
  }
}
