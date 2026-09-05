import { Request, Response } from 'express';
import { TutorialService } from '../services/tutorial/tutorialService';
import { TranscriptService } from '../services/youtube/transcriptService';
import { YouTubeService } from '../services/youtube/youtubeService';
import { RebuildService } from '../services/learning/rebuildService';
import { LearningEventService } from '../services/learning/learningEventService';
import { enqueueJob } from '../queues';
import { Database } from '../db/db';

export class TutorialController {
  static async importTutorial(req: Request, res: Response) {
    try {
      const { url, template, languageCode, customName } = req.body;
      if (!url) {
        return res.status(400).json({ error: 'YouTube URL is required' });
      }

      const videoId = YouTubeService.extractVideoId(url);
      if (!videoId) {
        return res.status(400).json({ error: `Invalid YouTube URL or Video ID: "${url}"` });
      }

      const userId = req.user?.id;
      const isSync = req.query.sync === 'true';

      if (isSync) {
        const project = await TutorialService.importTutorial({
          url,
          template,
          languageCode,
          customName,
          userId,
        });
        return res.status(201).json(project);
      }

      // Enqueue background job
      const job = await enqueueJob(
        'tutorial:import',
        { url, template, languageCode, customName },
        userId,
        'tutorial'
      );

      // Trigger self-healing background processing in parallel
      TutorialService.importTutorial({
        url,
        template,
        languageCode,
        customName,
        userId,
      })
        .then(async (proj) => {
          await Database.updateJob(job.id, {
            status: 'COMPLETED',
            progress: 100,
            result: {
              projectId: proj.id,
              tutorialId: proj.tutorial?.id,
              project: proj,
            },
          });
        })
        .catch(async (err) => {
          await Database.updateJob(job.id, {
            status: 'FAILED',
            error: err.message,
          });
        });

      res.status(202).json({
        jobId: job.id,
        status: job.status,
        message: 'Tutorial import queued for background processing.',
      });
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
