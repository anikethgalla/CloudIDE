import fs from 'fs';
import path from 'path';
import { DetectedProjectType } from '@cloud-ide/shared';
import { SecurePathResolver } from '../utils/securePath';

export class ProjectDetectorService {
  static async detect(projectId: string): Promise<DetectedProjectType | null> {
    const root = SecurePathResolver.getProjectRoot(projectId);

    // 1. Rust detection
    if (fs.existsSync(path.join(root, 'Cargo.toml'))) {
      return {
        type: 'rust-cargo',
        name: 'Rust (Cargo)',
        language: 'rust',
        buildTool: 'cargo',
        packageManager: 'cargo',
        suggestedRunCommands: [
          { label: 'Run (cargo run)', command: 'cargo run' },
          { label: 'Test (cargo test)', command: 'cargo test' },
          { label: 'Check (cargo check)', command: 'cargo check' },
          { label: 'Build (cargo build)', command: 'cargo build' },
        ],
      };
    }

    // 2. Go detection
    if (fs.existsSync(path.join(root, 'go.mod'))) {
      return {
        type: 'go-module',
        name: 'Go Module',
        language: 'go',
        buildTool: 'go',
        packageManager: 'go',
        suggestedRunCommands: [
          { label: 'Run (go run .)', command: 'go run .' },
          { label: 'Test (go test ./...)', command: 'go test ./...' },
          { label: 'Tidy (go mod tidy)', command: 'go mod tidy' },
          { label: 'Build (go build)', command: 'go build' },
        ],
      };
    }

    // 3. Node.js / Web Framework detection
    const pkgPath = path.join(root, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        const scripts = pkg.scripts || {};
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };

        let framework = 'Node.js';
        let language: any = 'javascript';
        if (deps.next) {
          framework = 'Next.js';
          language = 'nextjs';
        } else if (deps.react) {
          framework = 'React';
          language = 'react';
        }

        const suggested: Array<{ label: string; command: string }> = [];
        if (scripts.dev) suggested.push({ label: 'Dev Server (npm run dev)', command: 'npm run dev' });
        if (scripts.start) suggested.push({ label: 'Start (npm start)', command: 'npm start' });
        if (scripts.test) suggested.push({ label: 'Test (npm test)', command: 'npm test' });
        if (scripts.build) suggested.push({ label: 'Build (npm run build)', command: 'npm run build' });
        if (suggested.length === 0) {
          suggested.push({ label: 'Run (node index.js)', command: 'node index.js' });
        }

        return {
          type: 'nodejs',
          name: framework,
          language,
          framework,
          packageManager: 'npm',
          suggestedRunCommands: suggested,
        };
      } catch (_) {}
    }

    // 4. Python detection
    if (
      fs.existsSync(path.join(root, 'requirements.txt')) ||
      fs.existsSync(path.join(root, 'pyproject.toml')) ||
      fs.existsSync(path.join(root, 'main.py'))
    ) {
      return {
        type: 'python',
        name: 'Python',
        language: 'python',
        packageManager: 'pip',
        suggestedRunCommands: [
          { label: 'Run (python main.py)', command: 'python main.py' },
          { label: 'Install Dependencies (pip install -r requirements.txt)', command: 'pip install -r requirements.txt' },
        ],
      };
    }

    // 5. C / C++ detection
    if (fs.existsSync(path.join(root, 'Makefile'))) {
      return {
        type: 'cpp-make',
        name: 'C/C++ (Make)',
        language: 'cpp',
        buildTool: 'make',
        suggestedRunCommands: [
          { label: 'Make (make)', command: 'make' },
          { label: 'Run Binary (./main)', command: './main' },
        ],
      };
    }

    // Default fallback
    return null;
  }
}
