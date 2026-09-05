import { Request, Response } from 'express';
import { NotesService } from '../services/notes/notesService';
import { LearningEventService } from '../services/learning/learningEventService';

export class NotesController {
  static async getNotes(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const list = await NotesService.getNotes(projectId);
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async saveNote(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const { content, timestamp, noteId } = req.body;

      if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: 'Note content is required' });
      }

      const note = await NotesService.saveNote(projectId, content, timestamp, noteId);
      LearningEventService.recordEvent(
        projectId,
        'NOTE_CREATED',
        timestamp || 0,
        { noteId: note.id }
      );

      res.status(201).json(note);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async deleteNote(req: Request, res: Response) {
    try {
      const { projectId, noteId } = req.params;
      const ok = await NotesService.deleteNote(projectId, noteId);
      res.json({ success: ok });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
