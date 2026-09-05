import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import {
  Project,
  ProjectTemplate,
  TemplateId,
  PROJECT_TEMPLATES,
  DEFAULT_ENTRY_FILES,
} from '@cloud-ide/shared';
import { Database } from '../db/db';
import { FileService } from './fileService';
import { SecurePathResolver } from '../utils/securePath';

export class ProjectService {
  /**
   * Creates a new project from a template and seeds the workspace files.
   */
  static async createProject(payload: {
    name: string;
    template: TemplateId;
    description?: string;
    userId?: string;
  }): Promise<Project> {
    const id = uuidv4();
    const now = new Date().toISOString();

    const templateDef =
      PROJECT_TEMPLATES.find((t) => t.id === payload.template) ||
      PROJECT_TEMPLATES.find((t) => t.id === 'nodejs')!;

    const entryFile =
      templateDef.defaultEntryFile ||
      DEFAULT_ENTRY_FILES[payload.template] ||
      'index.js';

    const project: Project = {
      id,
      userId: payload.userId,
      name: payload.name.trim(),
      description: payload.description?.trim(),
      template: payload.template,
      language: templateDef.language,
      entryFile,
      createdAt: now,
      updatedAt: now,
    };

    // Create workspace folder
    const projectRoot = SecurePathResolver.getProjectRoot(id);
    if (!fs.existsSync(projectRoot)) {
      fs.mkdirSync(projectRoot, { recursive: true });
    }

    // Populate starter template files
    if (templateDef.files) {
      for (const [filePath, content] of Object.entries(templateDef.files)) {
        await FileService.writeFile(id, filePath, content);
      }
    }

    // Save project in DB
    await Database.createProject(project);

    return project;
  }

  static async listProjects(userId?: string): Promise<Project[]> {
    return Database.listProjects(userId);
  }

  static async getProject(id: string, userId?: string): Promise<Project> {
    const project = await Database.getProject(id, userId);
    if (!project) {
      throw new Error(`Project not found with ID: ${id}`);
    }
    return project;
  }

  static async deleteProject(id: string, userId?: string): Promise<void> {
    const project = await this.getProject(id, userId);

    // Remove workspace folder
    const projectRoot = SecurePathResolver.getProjectRoot(id);
    if (fs.existsSync(projectRoot)) {
      fs.rmSync(projectRoot, { recursive: true, force: true });
    }

    // Remove DB entry
    await Database.deleteProject(id, userId);
  }
}
