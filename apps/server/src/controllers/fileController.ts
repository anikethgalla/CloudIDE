import { Request, Response } from 'express';
import { FileService } from '../services/fileService';

export class FileController {
  static async getFiles(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tree = await FileService.getFileTree(id);
      res.json(tree);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getFileContent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const filePath = req.query.path as string;

      if (!filePath) {
        return res.status(400).json({ error: 'Query parameter "path" is required' });
      }

      const content = await FileService.readFile(id, filePath);
      res.json({ path: filePath, content });
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  }

  static async saveFile(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { path: filePath, content } = req.body;

      if (!filePath || content === undefined) {
        return res.status(400).json({ error: 'Body must include "path" and "content"' });
      }

      await FileService.writeFile(id, filePath, content);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async createFile(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { path: filePath, content = '' } = req.body;

      if (!filePath) {
        return res.status(400).json({ error: 'Body must include "path"' });
      }

      await FileService.writeFile(id, filePath, content);
      res.status(201).json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async createDirectory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { path: dirPath } = req.body;

      if (!dirPath) {
        return res.status(400).json({ error: 'Body must include "path"' });
      }

      await FileService.createDirectory(id, dirPath);
      res.status(201).json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async rename(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { oldPath, newPath } = req.body;

      if (!oldPath || !newPath) {
        return res.status(400).json({ error: 'Body must include "oldPath" and "newPath"' });
      }

      await FileService.renameResource(id, oldPath, newPath);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const targetPath = req.query.path as string;

      if (!targetPath) {
        return res.status(400).json({ error: 'Query parameter "path" is required' });
      }

      await FileService.deleteResource(id, targetPath);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
