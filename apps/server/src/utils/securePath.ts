import path from 'path';
import { config } from '../config';

export class SecurePathResolver {
  /**
   * Returns the absolute path to a project's root workspace directory.
   */
  static getProjectRoot(projectId: string): string {
    // Sanitize projectId to only allow alphanumeric characters and dashes/underscores
    const sanitizedId = projectId.replace(/[^a-zA-Z0-9_-]/g, '');
    if (!sanitizedId || sanitizedId !== projectId) {
      throw new Error(`Invalid project ID format: "${projectId}"`);
    }

    const projectRoot = path.resolve(config.workspacesDir, sanitizedId);
    return projectRoot;
  }

  /**
   * Securely resolves a relative file or directory path within a project workspace.
   * Throws an error if any path traversal (e.g. "../../etc/passwd") is detected.
   */
  static resolvePath(projectId: string, relativePath: string): string {
    const projectRoot = this.getProjectRoot(projectId);

    // Strip leading slashes/backslashes to treat path as relative
    const cleanRelative = relativePath.replace(/^[/\\]+/, '');

    // Resolve full path
    const resolvedPath = path.resolve(projectRoot, cleanRelative);

    // Normalize both paths for consistent comparison across platforms (Windows & Linux)
    const normalizedRoot = path.normalize(projectRoot) + path.sep;
    const normalizedTarget = path.normalize(resolvedPath);

    // Check if target is equal to root or starts with root prefix
    if (
      normalizedTarget !== path.normalize(projectRoot) &&
      !normalizedTarget.startsWith(normalizedRoot)
    ) {
      throw new Error(
        `Security Error: Path traversal attempt detected. Target "${relativePath}" escapes project workspace.`
      );
    }

    return resolvedPath;
  }
}
