import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { Project } from '@cloud-ide/shared';
import { config } from '../config';

export class Database {
  private static pool: Pool | null = null;
  private static isConnectedToPg = false;
  private static memoryProjects: Map<string, Project> = new Map();
  private static metaFile = path.resolve(config.workspacesDir, '.metadata.json');

  static async init(): Promise<void> {
    // Ensure workspaces dir exists
    if (!fs.existsSync(config.workspacesDir)) {
      fs.mkdirSync(config.workspacesDir, { recursive: true });
    }

    // Load local fallback cache
    if (fs.existsSync(this.metaFile)) {
      try {
        const raw = fs.readFileSync(this.metaFile, 'utf-8');
        const list: Project[] = JSON.parse(raw);
        list.forEach((p) => this.memoryProjects.set(p.id, p));
      } catch (_) {}
    }

    // Try PostgreSQL connection
    try {
      this.pool = new Pool({
        connectionString: config.databaseUrl,
        connectionTimeoutMillis: 3000,
      });

      const client = await this.pool.connect();
      await client.query(`
        CREATE TABLE IF NOT EXISTS projects (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          template VARCHAR(64) NOT NULL,
          language VARCHAR(64) NOT NULL,
          entry_file VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      client.release();
      this.isConnectedToPg = true;
      console.log('✔ Connected to PostgreSQL database successfully.');
    } catch (err: any) {
      console.warn(
        `⚠ PostgreSQL not reachable (${err.message}). Using persistent file-backed repository.`
      );
      this.isConnectedToPg = false;
    }
  }

  private static syncMetaFile() {
    try {
      const arr = Array.from(this.memoryProjects.values());
      fs.writeFileSync(this.metaFile, JSON.stringify(arr, null, 2), 'utf-8');
    } catch (_) {}
  }

  static async listProjects(): Promise<Project[]> {
    if (this.isConnectedToPg && this.pool) {
      try {
        const res = await this.pool.query(
          'SELECT id, name, description, template, language, entry_file as "entryFile", created_at as "createdAt", updated_at as "updatedAt" FROM projects ORDER BY updated_at DESC'
        );
        return res.rows.map((r) => ({
          ...r,
          createdAt: new Date(r.createdAt).toISOString(),
          updatedAt: new Date(r.updatedAt).toISOString(),
        }));
      } catch (err) {
        console.error('Postgres query failed, using fallback:', err);
      }
    }
    return Array.from(this.memoryProjects.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  static async getProject(id: string): Promise<Project | null> {
    if (this.isConnectedToPg && this.pool) {
      try {
        const res = await this.pool.query(
          'SELECT id, name, description, template, language, entry_file as "entryFile", created_at as "createdAt", updated_at as "updatedAt" FROM projects WHERE id = $1',
          [id]
        );
        if (res.rows.length > 0) {
          const r = res.rows[0];
          return {
            ...r,
            createdAt: new Date(r.createdAt).toISOString(),
            updatedAt: new Date(r.updatedAt).toISOString(),
          };
        }
        return null;
      } catch (err) {
        console.error('Postgres query failed, using fallback:', err);
      }
    }
    return this.memoryProjects.get(id) || null;
  }

  static async createProject(project: Project): Promise<Project> {
    this.memoryProjects.set(project.id, project);
    this.syncMetaFile();

    if (this.isConnectedToPg && this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO projects (id, name, description, template, language, entry_file, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             description = EXCLUDED.description,
             entry_file = EXCLUDED.entry_file,
             updated_at = EXCLUDED.updated_at`,
          [
            project.id,
            project.name,
            project.description || '',
            project.template,
            project.language,
            project.entryFile || '',
            project.createdAt,
            project.updatedAt,
          ]
        );
      } catch (err) {
        console.error('Postgres insert failed:', err);
      }
    }
    return project;
  }

  static async updateProjectTimestamp(id: string): Promise<void> {
    const proj = this.memoryProjects.get(id);
    if (proj) {
      proj.updatedAt = new Date().toISOString();
      this.syncMetaFile();
    }

    if (this.isConnectedToPg && this.pool) {
      try {
        await this.pool.query('UPDATE projects SET updated_at = NOW() WHERE id = $1', [id]);
      } catch (_) {}
    }
  }

  static async deleteProject(id: string): Promise<boolean> {
    this.memoryProjects.delete(id);
    this.syncMetaFile();

    if (this.isConnectedToPg && this.pool) {
      try {
        await this.pool.query('DELETE FROM projects WHERE id = $1', [id]);
      } catch (_) {}
    }
    return true;
  }
}
