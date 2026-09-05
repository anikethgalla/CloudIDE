import { Request, Response } from 'express';
import { ExecutionService } from '../services/executionService';

export class ExecutionController {
  static async run(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { entryFile } = req.body;

      const executionId = await ExecutionService.runProject(id, entryFile);
      res.json({ executionId });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async stop(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const stopped = await ExecutionService.stopProject(id);
      res.json({ success: stopped });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
