import { Request, Response } from 'express';
import { TutorialService } from '../services/tutorial/tutorialService';
import { TranscriptService } from '../services/youtube/transcriptService';
import { RebuildService } from '../services/learning/rebuildService';
import { LearningEventService } from '../services/learning/learningEventService';

export class TutorialController {
  static async importTutorial(req: Request, res: Response) {
    try {
      const { url, template, languageCode, customName } = req.body;
      if (!url) {
        return res.status(400).json({ error: 'YouTube URL is required' });
      }

      const project = await TutorialService.importTutorial({
        url,
        template,
        languageCode,
        customName,
      });

      res.status(201).json(project);
    } catch (err: any) {
      console.error('Tutorial import error:', err);
      res.status(500).json({ error: err.message || 'Failed to import YouTube tutorial' });
    }
  }

  static async getTutorial(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const tutorial = await TutorialService.getTutorial(projectId);
      if (!tutorial) {
        return res.status(404).json({ error: 'Tutorial not found for this project' });
      }
      res.json(tutorial);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getTranscript(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const { search } = req.query;

      const tutorial = await TutorialService.getTutorial(projectId);
      if (!tutorial || !tutorial.transcript) {
        return res.status(404).json({ error: 'No transcript available for this tutorial' });
      }

      if (search && typeof search === 'string') {
        const filtered = TranscriptService.searchTranscript(tutorial.transcript, search);
        return res.json(filtered);
      }

      res.json(tutorial.transcript);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async completeCheckpoint(req: Request, res: Response) {
    try {
      const { projectId, checkpointId } = req.params;
      const { completed = true } = req.body;

      const ok = await TutorialService.updateCheckpoint(projectId, checkpointId, completed);
      if (ok) {
        LearningEventService.recordEvent(
          projectId,
          'CHALLENGE_COMPLETED',
          0,
          { checkpointId }
        );
      }

      res.json({ success: ok });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async startRebuild(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const spec = await RebuildService.startRebuild(projectId);
      res.json({ success: true, spec });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async recordEvent(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const { type, timestamp, metadata } = req.body;

      if (!type) {
        return res.status(400).json({ error: 'Event type is required' });
      }

      const event = LearningEventService.recordEvent(
        projectId,
        type,
        timestamp || 0,
        metadata
      );
      res.json(event);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getEvents(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const stats = LearningEventService.getStats(projectId);
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
