import { BaseRunner, RunnerCallbacks } from './BaseRunner';
import { NodeRunner } from './NodeRunner';
import { PythonRunner } from './PythonRunner';
import { CppRunner } from './CppRunner';
import { JavaRunner } from './JavaRunner';
import { GoRunner } from './GoRunner';
import { RustRunner } from './RustRunner';
import { ReactRunner } from './ReactRunner';
import { NextRunner } from './NextRunner';
import { Language } from '@cloud-ide/shared';

export class RunnerFactory {
  static createRunner(
    language: Language,
    projectId: string,
    entryFile: string,
    callbacks: RunnerCallbacks
  ): BaseRunner {
    switch (language) {
      case 'go':
        return new GoRunner(projectId, entryFile, callbacks);
      case 'rust':
        return new RustRunner(projectId, entryFile, callbacks);
      case 'python':
        return new PythonRunner(projectId, entryFile, callbacks);
      case 'cpp':
      case 'c':
        return new CppRunner(projectId, entryFile, callbacks);
      case 'java':
        return new JavaRunner(projectId, entryFile, callbacks);
      case 'react':
        return new ReactRunner(projectId, entryFile, callbacks);
      case 'nextjs':
        return new NextRunner(projectId, entryFile, callbacks);
      case 'javascript':
      case 'typescript':
      default:
        return new NodeRunner(projectId, entryFile, callbacks);
    }
  }
}

export * from './BaseRunner';
export * from './NodeRunner';
export * from './PythonRunner';
export * from './CppRunner';
export * from './JavaRunner';
export * from './GoRunner';
export * from './RustRunner';
export * from './ReactRunner';
export * from './NextRunner';
