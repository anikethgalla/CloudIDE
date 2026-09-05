import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { ToolchainDiagnostics, ToolchainItem } from '@cloud-ide/shared';

export class DiagnosticsService {
  private static cachedDiagnostics: ToolchainDiagnostics | null = null;
  private static lastCheck = 0;

  static async getDiagnostics(forceRefresh = false): Promise<ToolchainDiagnostics> {
    const now = Date.now();
    if (!forceRefresh && this.cachedDiagnostics && now - this.lastCheck < 15000) {
      return this.cachedDiagnostics;
    }

    const portableGo = path.resolve(process.cwd(), 'tools/go/bin/go.exe');
    const hasPortableGo = fs.existsSync(portableGo);

    const probes: Array<{
      name: string;
      command: string;
      versionCmd: string;
      category: ToolchainItem['category'];
    }> = [
      { name: 'Node.js', command: 'node', versionCmd: 'node -v', category: 'runtime' },
      { name: 'npm', command: 'npm', versionCmd: 'npm -v', category: 'package_manager' },
      { name: 'Python', command: 'python', versionCmd: 'python --version', category: 'runtime' },
      { name: 'pip', command: 'pip', versionCmd: 'pip --version', category: 'package_manager' },
      { name: 'Go', command: 'go', versionCmd: hasPortableGo ? `"${portableGo}" version` : 'go version', category: 'compiler' },
      { name: 'Rust (rustc)', command: 'rustc', versionCmd: 'rustc --version', category: 'compiler' },
      { name: 'Cargo', command: 'cargo', versionCmd: 'cargo --version', category: 'package_manager' },
      { name: 'GCC (C/C++)', command: 'gcc', versionCmd: 'gcc --version', category: 'compiler' },
      { name: 'G++', command: 'g++', versionCmd: 'g++ --version', category: 'compiler' },
      { name: 'Java (javac)', command: 'javac', versionCmd: 'javac --version', category: 'compiler' },
      { name: 'Java Runtime', command: 'java', versionCmd: 'java -version', category: 'runtime' },
      { name: 'Git', command: 'git', versionCmd: 'git --version', category: 'vcs' },
      { name: 'Make', command: 'make', versionCmd: 'make --version', category: 'compiler' },
      { name: 'Docker', command: 'docker', versionCmd: 'docker --version', category: 'runtime' },
    ];

    const tools: ToolchainItem[] = probes.map((p) => {
      try {
        const raw = execSync(p.versionCmd, {
          timeout: 2500,
          encoding: 'utf-8',
          stdio: ['ignore', 'pipe', 'pipe'],
        });
        const firstLine = raw.trim().split('\n')[0].replace(/\r/g, '');
        return {
          name: p.name,
          command: p.command,
          version: firstLine,
          available: true,
          category: p.category,
        };
      } catch (err: any) {
        // Some tools print version to stderr (e.g. java -version)
        if (err.stderr) {
          const firstStderr = err.stderr.toString().trim().split('\n')[0].replace(/\r/g, '');
          if (firstStderr) {
            return {
              name: p.name,
              command: p.command,
              version: firstStderr,
              available: true,
              category: p.category,
            };
          }
        }
        return {
          name: p.name,
          command: p.command,
          version: null,
          available: false,
          category: p.category,
        };
      }
    });

    const result: ToolchainDiagnostics = {
      tools,
      timestamp: new Date().toISOString(),
    };

    this.cachedDiagnostics = result;
    this.lastCheck = now;
    return result;
  }
}
