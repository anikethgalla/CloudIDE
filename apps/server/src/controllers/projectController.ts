import { Request, Response } from 'express';
import { ProjectService } from '../services/projectService';
import { PROJECT_TEMPLATES } from '@cloud-ide/shared';

export class ProjectController {
  static async list(req: Request, res: Response) {
    try {
      const list = await ProjectService.listProjects(req.user?.id);
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async get(req: Request, res: Response) {
    try {
      const project = await ProjectService.getProject(req.params.id, req.user?.id);
      res.json(project);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { name, template, description } = req.body;
      if (!name || !template) {
        return res.status(400).json({ error: 'Name and template are required' });
      }

      const project = await ProjectService.createProject({
        name,
        template,
        description,
        userId: req.user?.id,
      });

      res.status(201).json(project);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      await ProjectService.deleteProject(req.params.id, req.user?.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getTemplates(req: Request, res: Response) {
    res.json(PROJECT_TEMPLATES);
  }
}
