import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { Project, User, JobRecord, JobStatus } from '@cloud-ide/shared';
import { config } from '../config';

export class Database {
  private static pool: Pool | null = null;
  private static isConnectedToPg = false;
  private static memoryProjects: Map<string, Project> = new Map();
  private static memoryUsers: Map<string, User> = new Map();
  private static memoryJobs: Map<string, JobRecord> = new Map();
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
        const data = JSON.parse(raw);
        if (Array.isArray(data)) {
          data.forEach((p: Project) => this.memoryProjects.set(p.id, p));
        } else {
          if (data.projects) data.projects.forEach((p: Project) => this.memoryProjects.set(p.id, p));
          if (data.users) data.users.forEach((u: User) => this.memoryUsers.set(u.id, u));
          if (data.jobs) data.jobs.forEach((j: JobRecord) => this.memoryJobs.set(j.id, j));
        }
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
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          image TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS projects (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64),
          name VARCHAR(255) NOT NULL,
          description TEXT,
          template VARCHAR(64) NOT NULL,
          language VARCHAR(64) NOT NULL,
          entry_file VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS jobs (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64),
          type VARCHAR(128) NOT NULL,
          status VARCHAR(64) NOT NULL,
          progress INTEGER DEFAULT 0,
          payload JSONB,
          result JSONB,
          error TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        ALTER TABLE projects ADD COLUMN IF NOT EXISTS user_id VARCHAR(64);
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
      const data = {
        projects: Array.from(this.memoryProjects.values()),
        users: Array.from(this.memoryUsers.values()),
        jobs: Array.from(this.memoryJobs.values()),
      };
      fs.writeFileSync(this.metaFile, JSON.stringify(data, null, 2), 'utf-8');
    } catch (_) {}
  }

  // ==========================================
  // USERS
  // ==========================================
  static async upsertUser(user: User): Promise<User> {
    this.memoryUsers.set(user.id, user);
    this.syncMetaFile();

    if (this.isConnectedToPg && this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO users (id, name, email, image, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             email = EXCLUDED.email,
             image = EXCLUDED.image,
             updated_at = EXCLUDED.updated_at`,
          [
            user.id,
            user.name,
            user.email,
            user.image || '',
            user.createdAt,
            user.updatedAt || user.createdAt,
          ]
        );
      } catch (err) {
        console.error('Postgres upsertUser failed:', err);
      }
    }
    return user;
  }

  static async getUser(id: string): Promise<User | null> {
    if (this.isConnectedToPg && this.pool) {
      try {
        const res = await this.pool.query('SELECT id, name, email, image, created_at as "createdAt", updated_at as "updatedAt" FROM users WHERE id = $1', [id]);
        if (res.rows.length > 0) {
          const r = res.rows[0];
          return {
            ...r,
            createdAt: new Date(r.createdAt).toISOString(),
            updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : undefined,
          };
        }
      } catch (err) {
        console.error('Postgres getUser failed:', err);
      }
    }
    return this.memoryUsers.get(id) || null;
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    if (this.isConnectedToPg && this.pool) {
      try {
        const res = await this.pool.query('SELECT id, name, email, image, created_at as "createdAt", updated_at as "updatedAt" FROM users WHERE email = $1', [email]);
        if (res.rows.length > 0) {
          const r = res.rows[0];
          return {
            ...r,
            createdAt: new Date(r.createdAt).toISOString(),
            updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : undefined,
          };
        }
      } catch (err) {
        console.error('Postgres getUserByEmail failed:', err);
      }
    }
    for (const u of this.memoryUsers.values()) {
      if (u.email === email) return u;
    }
    return null;
  }

  // ==========================================
  // PROJECTS
  // ==========================================
  static async listProjects(userId?: string): Promise<Project[]> {
    if (this.isConnectedToPg && this.pool) {
      try {
        let query = 'SELECT id, user_id as "userId", name, description, template, language, entry_file as "entryFile", created_at as "createdAt", updated_at as "updatedAt" FROM projects';
        const params: any[] = [];
        if (userId) {
          query += ' WHERE user_id = $1 OR user_id IS NULL';
          params.push(userId);
        }
        query += ' ORDER BY updated_at DESC';
        const res = await this.pool.query(query, params);
        return res.rows.map((r) => ({
          ...r,
          createdAt: new Date(r.createdAt).toISOString(),
          updatedAt: new Date(r.updatedAt).toISOString(),
        }));
      } catch (err) {
        console.error('Postgres query failed, using fallback:', err);
      }
    }
    const all = Array.from(this.memoryProjects.values());
    const filtered = userId ? all.filter((p) => !p.userId || p.userId === userId) : all;
    return filtered.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  static async getProject(id: string, userId?: string): Promise<Project | null> {
    if (this.isConnectedToPg && this.pool) {
      try {
        let query = 'SELECT id, user_id as "userId", name, description, template, language, entry_file as "entryFile", created_at as "createdAt", updated_at as "updatedAt" FROM projects WHERE id = $1';
        const params: any[] = [id];
        if (userId) {
          query += ' AND (user_id = $2 OR user_id IS NULL)';
          params.push(userId);
        }
        const res = await this.pool.query(query, params);
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
    const proj = this.memoryProjects.get(id) || null;
    if (proj && userId && proj.userId && proj.userId !== userId) {
      return null;
    }
    return proj;
  }

  static async createProject(project: Project): Promise<Project> {
    this.memoryProjects.set(project.id, project);
    this.syncMetaFile();

    if (this.isConnectedToPg && this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO projects (id, user_id, name, description, template, language, entry_file, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO UPDATE SET
             user_id = COALESCE(EXCLUDED.user_id, projects.user_id),
             name = EXCLUDED.name,
             description = EXCLUDED.description,
             entry_file = EXCLUDED.entry_file,
             updated_at = EXCLUDED.updated_at`,
          [
            project.id,
            project.userId || null,
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

  static async deleteProject(id: string, userId?: string): Promise<boolean> {
    const existing = this.memoryProjects.get(id);
    if (existing && userId && existing.userId && existing.userId !== userId) {
      return false;
    }

    this.memoryProjects.delete(id);
    this.syncMetaFile();

    if (this.isConnectedToPg && this.pool) {
      try {
        if (userId) {
          await this.pool.query('DELETE FROM projects WHERE id = $1 AND (user_id = $2 OR user_id IS NULL)', [id, userId]);
        } else {
          await this.pool.query('DELETE FROM projects WHERE id = $1', [id]);
        }
      } catch (_) {}
    }
    return true;
  }

  // ==========================================
  // BACKGROUND JOBS
  // ==========================================
  static async saveJob(job: JobRecord): Promise<JobRecord> {
    this.memoryJobs.set(job.id, job);
    this.syncMetaFile();

    if (this.isConnectedToPg && this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO jobs (id, user_id, type, status, progress, payload, result, error, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (id) DO UPDATE SET
             status = EXCLUDED.status,
             progress = EXCLUDED.progress,
             result = EXCLUDED.result,
             error = EXCLUDED.error,
             updated_at = EXCLUDED.updated_at`,
          [
            job.id,
            job.userId || null,
            job.type,
            job.status,
            job.progress || 0,
            JSON.stringify(job.payload || {}),
            JSON.stringify(job.result || {}),
            job.error || null,
            job.createdAt,
            job.updatedAt,
          ]
        );
      } catch (err) {
        console.error('Postgres saveJob failed:', err);
      }
    }
    return job;
  }

  static async getJob(id: string): Promise<JobRecord | null> {
    if (this.isConnectedToPg && this.pool) {
      try {
        const res = await this.pool.query('SELECT id, user_id as "userId", type, status, progress, payload, result, error, created_at as "createdAt", updated_at as "updatedAt" FROM jobs WHERE id = $1', [id]);
        if (res.rows.length > 0) {
          const r = res.rows[0];
          return {
            ...r,
            payload: typeof r.payload === 'string' ? JSON.parse(r.payload) : r.payload,
            result: typeof r.result === 'string' ? JSON.parse(r.result) : r.result,
            createdAt: new Date(r.createdAt).toISOString(),
            updatedAt: new Date(r.updatedAt).toISOString(),
          };
        }
      } catch (err) {
        console.error('Postgres getJob failed:', err);
      }
    }
    return this.memoryJobs.get(id) || null;
  }

  static async updateJob(id: string, updates: Partial<JobRecord>): Promise<JobRecord | null> {
    const existing = await this.getJob(id);
    if (!existing) return null;

    const updated: JobRecord = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return this.saveJob(updated);
  }
}

export const db = Database;
export const upsertUser = Database.upsertUser.bind(Database);
export const getUser = Database.getUser.bind(Database);
export const getUserByEmail = Database.getUserByEmail.bind(Database);
export const listProjects = Database.listProjects.bind(Database);
export const getProject = Database.getProject.bind(Database);
export const createProject = Database.createProject.bind(Database);
export const updateProjectTimestamp = Database.updateProjectTimestamp.bind(Database);
export const deleteProject = Database.deleteProject.bind(Database);
export const saveJob = Database.saveJob.bind(Database);
export const getJob = Database.getJob.bind(Database);
export const updateJob = Database.updateJob.bind(Database);

