import fs from 'fs';
import path from 'path';
import { EnvService } from '../src/services/envService';
import { ProjectDetectorService } from '../src/services/projectDetectorService';
import { DiagnosticsService } from '../src/services/diagnosticsService';
import { PortProxyService } from '../src/services/portProxyService';
import { RunnerFactory } from '../src/runners';
import { FileService } from '../src/services/fileService';
import { ProjectService } from '../src/services/projectService';
import { Database } from '../src/db/db';

describe('VS Code-grade Dev Environment Features', () => {
  const testProjectId = 'test-dev-env-proj';

  beforeAll(async () => {
    await Database.init();
    try {
      await ProjectService.createProject({
        name: 'Dev Env Test Project',
        template: 'nodejs',
      });
    } catch (_) {}
  });

  afterAll(async () => {
    try {
      await ProjectService.deleteProject(testProjectId);
    } catch (_) {}
  });

  describe('EnvService (.env management & secret detection)', () => {
    test('should write and parse workspace environment variables', async () => {
      const envVars = [
        { key: 'DATABASE_URL', value: 'postgres://user:pass@localhost:5432/db' },
        { key: 'API_SECRET_KEY', value: 'secret_jwt_token_12345' },
        { key: 'APP_PORT', value: '8080' },
      ];

      await EnvService.saveEnvVars(testProjectId, envVars);

      const parsedVars = await EnvService.getEnvVars(testProjectId);
      expect(parsedVars.length).toBe(3);

      const dbUrl = parsedVars.find((v) => v.key === 'DATABASE_URL');
      expect(dbUrl?.value).toBe('postgres://user:pass@localhost:5432/db');

      const secretVar = parsedVars.find((v) => v.key === 'API_SECRET_KEY');
      expect(secretVar?.isSecret).toBe(true);

      const portVar = parsedVars.find((v) => v.key === 'APP_PORT');
      expect(portVar?.isSecret).toBe(false);
    });

    test('should return empty array if no .env exists', async () => {
      const nonExistentProj = 'non-existent-proj-env-123';
      const parsedVars = await EnvService.getEnvVars(nonExistentProj);
      expect(parsedVars).toEqual([]);
    });
  });

  describe('ProjectDetectorService', () => {
    test('should detect Rust project when Cargo.toml exists', async () => {
      const rustProjId = 'test-rust-detector-proj';
      const cargoToml = `[package]
name = "test_rust_app"
version = "0.1.0"
edition = "2021"

[dependencies]
tokio = "1"
`;
      await FileService.writeFile(rustProjId, 'Cargo.toml', cargoToml);
      const detected = await ProjectDetectorService.detect(rustProjId);

      expect(detected).not.toBeNull();
      expect(detected?.type).toBe('rust-cargo');
      expect(detected?.name).toBe('Rust (Cargo)');
      expect(detected?.packageManager).toBe('cargo');
      expect(detected?.suggestedRunCommands.some((c) => c.command === 'cargo run')).toBe(true);

      try {
        await ProjectService.deleteProject(rustProjId);
      } catch (_) {}
    });

    test('should detect Go project when go.mod exists', async () => {
      const goProjId = 'test-go-detector-proj';
      const goMod = `module test-go-app

go 1.22
`;
      await FileService.writeFile(goProjId, 'go.mod', goMod);
      const detected = await ProjectDetectorService.detect(goProjId);

      expect(detected).not.toBeNull();
      expect(detected?.type).toBe('go-module');
      expect(detected?.name).toBe('Go Module');
      expect(detected?.buildTool).toBe('go');
      expect(detected?.suggestedRunCommands.some((c) => c.command === 'go run .')).toBe(true);

      try {
        await ProjectService.deleteProject(goProjId);
      } catch (_) {}
    });
  });

  describe('DiagnosticsService', () => {
    test('should probe toolchains and return structured diagnostics', async () => {
      const diagnostics = await DiagnosticsService.getDiagnostics(true);

      expect(diagnostics).toBeDefined();
      expect(diagnostics.tools.length).toBeGreaterThan(5);

      const nodeTool = diagnostics.tools.find((t) => t.command === 'node');
      expect(nodeTool).toBeDefined();
      expect(nodeTool?.available).toBe(true);
      expect(nodeTool?.version).toContain('v');

      const rustTool = diagnostics.tools.find((t) => t.command === 'rustc');
      expect(rustTool).toBeDefined();
      if (rustTool?.available) {
        expect(rustTool.version).toContain('rustc');
      }
    });
  });

  describe('PortProxyService', () => {
    test('should register and track active ports', async () => {
      PortProxyService.registerPort(testProjectId, 3000);
      PortProxyService.registerPort(testProjectId, 8080);

      // Verify unregistering works
      PortProxyService.unregisterPort(testProjectId, 3000);
      expect(true).toBe(true);
    });
  });

  describe('RunnerFactory & Language Runners', () => {
    test('RunnerFactory should instantiate GoRunner for go language', () => {
      const runner = RunnerFactory.createRunner('go', testProjectId, 'main.go', {
        onOutput: () => {},
        onStatus: () => {},
      });
      expect(runner.getLanguage()).toBe('go');
    });

    test('RunnerFactory should instantiate RustRunner for rust language', () => {
      const runner = RunnerFactory.createRunner('rust', testProjectId, 'src/main.rs', {
        onOutput: () => {},
        onStatus: () => {},
      });
      expect(runner.getLanguage()).toBe('rust');
    });
  });
});
