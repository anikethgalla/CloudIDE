import { Request, Response } from 'express';
import { Database } from '../db/db';
import { User } from '@cloud-ide/shared';

export class JobController {
  static async getJob(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const job = await Database.getJob(id);

      if (!job) {
        return res.status(404).json({ error: `Job not found with ID: ${id}` });
      }

      // If user owns the job or is admin
      if (job.userId && req.user && job.userId !== req.user.id && req.user.id !== 'dev-user-default') {
        return res.status(403).json({ error: 'Forbidden: You do not have access to this job.' });
      }

      res.json(job);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async syncUser(req: Request, res: Response) {
    try {
      const { id, name, email, image } = req.body;
      if (!id || !email) {
        return res.status(400).json({ error: 'User id and email are required.' });
      }

      const user: User = {
        id,
        name: name || email.split('@')[0],
        email,
        image,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const saved = await Database.upsertUser(user);
      res.json(saved);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
