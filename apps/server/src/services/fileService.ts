import fs from 'fs';
import path from 'path';
import { FileNode } from '@cloud-ide/shared';
import { SecurePathResolver } from '../utils/securePath';
import { Database } from '../db/db';

export class FileService {
  /**
   * Recursively reads a project's workspace directory and builds a nested FileNode tree.
   */
  static async getFileTree(projectId: string): Promise<FileNode[]> {
    const rootPath = SecurePathResolver.getProjectRoot(projectId);

    if (!fs.existsSync(rootPath)) {
      return [];
    }

    const buildTree = (currentDir: string, relativeDir = ''): FileNode[] => {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      const nodes: FileNode[] = [];

      for (const entry of entries) {
        // Skip hidden files or system folders like .git, node_modules (optional: can be shown if needed)
        if (entry.name === '.git') continue;

        const fullPath = path.join(currentDir, entry.name);
        const relPath = relativeDir ? `${relativeDir}/${entry.name}` : entry.name;
        const normalizedRelPath = relPath.replace(/\\/g, '/');

        if (entry.isDirectory()) {
          nodes.push({
            id: normalizedRelPath,
            name: entry.name,
            path: normalizedRelPath,
            type: 'directory',
            children: buildTree(fullPath, normalizedRelPath),
          });
        } else if (entry.isFile()) {
          const stats = fs.statSync(fullPath);
          nodes.push({
            id: normalizedRelPath,
            name: entry.name,
            path: normalizedRelPath,
            type: 'file',
            size: stats.size,
            updatedAt: stats.mtime.toISOString(),
          });
        }
      }

      return nodes;
    };

    return buildTree(rootPath);
  }

  /**
   * Reads file content as UTF-8 string with secure root verification.
   */
  static async readFile(projectId: string, relativePath: string): Promise<string> {
    const resolvedPath = SecurePathResolver.resolvePath(projectId, relativePath);

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`File not found: "${relativePath}"`);
    }

    const stats = fs.statSync(resolvedPath);
    if (stats.isDirectory()) {
      throw new Error(`Cannot read directory as file: "${relativePath}"`);
    }

    return fs.readFileSync(resolvedPath, 'utf-8');
  }

  /**
   * Writes file content to disk, automatically creating parent directories.
   */
  static async writeFile(projectId: string, relativePath: string, content: string): Promise<void> {
    const resolvedPath = SecurePathResolver.resolvePath(projectId, relativePath);
    const parentDir = path.dirname(resolvedPath);

    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    fs.writeFileSync(resolvedPath, content, 'utf-8');
    await Database.updateProjectTimestamp(projectId);
  }

  /**
   * Creates a new directory.
   */
  static async createDirectory(projectId: string, relativePath: string): Promise<void> {
    const resolvedPath = SecurePathResolver.resolvePath(projectId, relativePath);

    if (!fs.existsSync(resolvedPath)) {
      fs.mkdirSync(resolvedPath, { recursive: true });
      await Database.updateProjectTimestamp(projectId);
    }
  }

  /**
   * Renames or moves a file / directory.
   */
  static async renameResource(projectId: string, oldPath: string, newPath: string): Promise<void> {
    const resolvedOld = SecurePathResolver.resolvePath(projectId, oldPath);
    const resolvedNew = SecurePathResolver.resolvePath(projectId, newPath);

    if (!fs.existsSync(resolvedOld)) {
      throw new Error(`Source path not found: "${oldPath}"`);
    }

    const parentNew = path.dirname(resolvedNew);
    if (!fs.existsSync(parentNew)) {
      fs.mkdirSync(parentNew, { recursive: true });
    }

    fs.renameSync(resolvedOld, resolvedNew);
    await Database.updateProjectTimestamp(projectId);
  }

  /**
   * Deletes a file or directory recursively.
   */
  static async deleteResource(projectId: string, relativePath: string): Promise<void> {
    const resolvedPath = SecurePathResolver.resolvePath(projectId, relativePath);

    if (!fs.existsSync(resolvedPath)) {
      return;
    }

    const stats = fs.statSync(resolvedPath);
    if (stats.isDirectory()) {
      fs.rmSync(resolvedPath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(resolvedPath);
    }

    await Database.updateProjectTimestamp(projectId);
  }
}
