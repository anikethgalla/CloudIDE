import { Request, Response } from 'express';
import { SocraticService } from '../services/ai/socraticService';
import { LearningEventService } from '../services/learning/learningEventService';

export class AIController {
  static async socraticGuidance(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const {
        currentTimestamp = 0,
        question,
        hintLevel = 0,
        currentFile,
        currentCode,
        recentTerminalOutput,
        learningMode = 'tutorial',
      } = req.body;

      if (!question || typeof question !== 'string') {
        return res.status(400).json({ error: 'Question is required' });
      }

      const guidance = await SocraticService.getGuidance({
        projectId,
        currentTimestamp: Number(currentTimestamp),
        question,
        hintLevel: Number(hintLevel),
        currentFile,
        currentCode,
        recentTerminalOutput,
        learningMode,
      });

      LearningEventService.recordEvent(
        projectId,
        'AI_HINT_REQUESTED',
        Number(currentTimestamp),
        { hintLevel, concept: guidance.concept }
      );

      res.json(guidance);
    } catch (err: any) {
      console.error('Socratic AI error:', err);
      res.status(500).json({ error: err.message || 'Failed to get Socratic guidance' });
    }
  }
}
