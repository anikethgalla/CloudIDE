import fs from 'fs';
import path from 'path';
import { WorkspaceEnvVar } from '@cloud-ide/shared';
import { SecurePathResolver } from '../utils/securePath';

export class EnvService {
  private static parseEnvFile(content: string): WorkspaceEnvVar[] {
    const lines = content.split('\n');
    const result: WorkspaceEnvVar[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.substring(0, idx).trim();
        let value = trimmed.substring(idx + 1).trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.substring(1, value.length - 1);
        }
        const isSecret = /key|secret|token|password|auth|private/i.test(key);
        result.push({ key, value, isSecret });
      }
    }
    return result;
  }

  static async getEnvVars(projectId: string): Promise<WorkspaceEnvVar[]> {
    const projectRoot = SecurePathResolver.getProjectRoot(projectId);
    const envFile = path.join(projectRoot, '.env');
    if (fs.existsSync(envFile)) {
      try {
        const content = fs.readFileSync(envFile, 'utf-8');
        return this.parseEnvFile(content);
      } catch (err) {
        console.error(`Failed to read .env for project ${projectId}:`, err);
      }
    }
    return [];
  }

  static async saveEnvVars(
    projectId: string,
    vars: WorkspaceEnvVar[]
  ): Promise<WorkspaceEnvVar[]> {
    const projectRoot = SecurePathResolver.getProjectRoot(projectId);
    if (!fs.existsSync(projectRoot)) {
      fs.mkdirSync(projectRoot, { recursive: true });
    }
    const envFile = path.join(projectRoot, '.env');
    const content = vars
      .map((v) => `${v.key}=${v.value.includes(' ') ? `"${v.value}"` : v.value}`)
      .join('\n');

    fs.writeFileSync(envFile, content, 'utf-8');
    return vars;
  }

  static getEnvObject(vars: WorkspaceEnvVar[]): Record<string, string> {
    const obj: Record<string, string> = {};
    for (const v of vars) {
      obj[v.key] = v.value;
    }
    return obj;
  }
}
