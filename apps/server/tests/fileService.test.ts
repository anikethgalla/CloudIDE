import fs from 'fs';
import path from 'path';
import { FileService } from '../src/services/fileService';
import { ProjectService } from '../src/services/projectService';
import { SecurePathResolver } from '../src/utils/securePath';
import { Database } from '../src/db/db';

describe('FileService & Security Unit Tests', () => {
  const testProjectId = 'test-security-proj';

  beforeAll(async () => {
    await Database.init();
    // Create test project
    await ProjectService.createProject({
      name: 'Test Project',
      template: 'nodejs',
      description: 'Automated test workspace',
    });
  });

  afterAll(async () => {
    try {
      await ProjectService.deleteProject(testProjectId);
    } catch (_) {}
  });

  test('should create and read file successfully within project workspace', async () => {
    const filename = 'hello.txt';
    const content = 'Hello Cloud IDE Sandbox!';

    await FileService.writeFile(testProjectId, filename, content);
    const read = await FileService.readFile(testProjectId, filename);

    expect(read).toBe(content);
  });

  test('should create nested directories and files', async () => {
    const nestedFile = 'src/components/Header.tsx';
    const content = 'export const Header = () => <h1>Header</h1>;';

    await FileService.writeFile(testProjectId, nestedFile, content);
    const tree = await FileService.getFileTree(testProjectId);

    const srcDir = tree.find((n) => n.name === 'src' && n.type === 'directory');
    expect(srcDir).toBeDefined();
    expect(srcDir?.children).toBeDefined();
  });

  test('should rename and delete file', async () => {
    const oldName = 'temp.txt';
    const newName = 'renamed.txt';

    await FileService.writeFile(testProjectId, oldName, 'temp content');
    await FileService.renameResource(testProjectId, oldName, newName);

    const content = await FileService.readFile(testProjectId, newName);
    expect(content).toBe('temp content');

    await FileService.deleteResource(testProjectId, newName);
    await expect(FileService.readFile(testProjectId, newName)).rejects.toThrow();
  });

  test('SECURITY: Path traversal attempts must throw security exception', () => {
    const maliciousPaths = [
      '../../etc/passwd',
      '..\\..\\windows\\system32',
      '../../../root/.ssh/id_rsa',
      'subfolder/../../../../secret.txt',
    ];

    for (const malPath of maliciousPaths) {
      expect(() => {
        SecurePathResolver.resolvePath(testProjectId, malPath);
      }).toThrow(/Security Error: Path traversal attempt detected/);
    }
  });
});
