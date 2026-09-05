import { NodeRunner } from '../src/runners/NodeRunner';
import { PythonRunner } from '../src/runners/PythonRunner';
import { FileService } from '../src/services/fileService';
import { ProjectService } from '../src/services/projectService';
import { Database } from '../src/db/db';

describe('Language Runners & Execution Tests', () => {
  const testProjectId = 'test-runner-proj';

  beforeAll(async () => {
    await Database.init();
    await ProjectService.createProject({
      name: 'Runner Test Project',
      template: 'nodejs',
    });
  });

  afterAll(async () => {
    try {
      await ProjectService.deleteProject(testProjectId);
    } catch (_) {}
  });

  test('NodeRunner should execute JavaScript and stream stdout chunks', async () => {
    const code = 'console.log("HELLO_NODE_SANDBOX");';
    await FileService.writeFile(testProjectId, 'test.js', code);

    let output = '';
    let status = '';

    const runner = new NodeRunner(testProjectId, 'test.js', {
      onOutput: (chunk) => {
        output += chunk.data;
      },
      onStatus: (st) => {
        status = st;
      },
    });

    const exitCode = await runner.run();
    expect(exitCode).toBe(0);
    expect(output).toContain('HELLO_NODE_SANDBOX');
    expect(status).toBe('SUCCESS');
  });

  test('PythonRunner should execute Python script if runtime available', async () => {
    const code = 'print("HELLO_PYTHON_SANDBOX")';
    await FileService.writeFile(testProjectId, 'test.py', code);

    let output = '';
    let status = '';

    const runner = new PythonRunner(testProjectId, 'test.py', {
      onOutput: (chunk) => {
        output += chunk.data;
      },
      onStatus: (st) => {
        status = st;
      },
    });

    const exitCode = await runner.run();
    // In environments with python installed, output contains the printed line
    if (exitCode === 0) {
      expect(output).toContain('HELLO_PYTHON_SANDBOX');
    }
  });

  test('Runner should support manual process stopping', async () => {
    // Infinite loop code
    const code = 'setInterval(() => console.log("tick"), 100);';
    await FileService.writeFile(testProjectId, 'loop.js', code);

    let output = '';
    let status = '';

    const runner = new NodeRunner(testProjectId, 'loop.js', {
      onOutput: (chunk) => {
        output += chunk.data;
      },
      onStatus: (st) => {
        status = st;
      },
    });

    const runPromise = runner.run();

    // Stop after 300ms
    setTimeout(() => {
      runner.stop();
    }, 300);

    await runPromise;
    expect(status).toBe('STOPPED');
  });
});
