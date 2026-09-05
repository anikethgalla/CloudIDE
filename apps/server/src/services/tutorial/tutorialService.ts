import { v4 as uuidv4 } from 'uuid';
import {
  Project,
  TutorialMetadata,
  TemplateId,
  TranscriptSegment,
  RebuildSpecification,
} from '@cloud-ide/shared';
import { YouTubeService } from '../youtube/youtubeService';
import { TranscriptService } from '../youtube/transcriptService';
import { CheckpointService } from './checkpointService';
import { ProjectService } from '../projectService';
import { Database } from '../../db/db';

export class TutorialService {
  private static tutorialStore: Map<string, TutorialMetadata> = new Map();

  /**
   * Imports a YouTube tutorial, extracts transcript, initializes checkpoints and seeds the workspace.
   */
  static async importTutorial(payload: {
    url: string;
    template?: TemplateId;
    languageCode?: string;
    customName?: string;
  }): Promise<Project> {
    const videoId = YouTubeService.extractVideoId(payload.url);
    if (!videoId) {
      throw new Error(`Invalid YouTube URL or Video ID: "${payload.url}"`);
    }

    // 1. Fetch Video Metadata
    const metadata = await YouTubeService.fetchVideoMetadata(videoId);

    // 2. Fetch Timestamped Transcript
    const transcriptResult = await TranscriptService.fetchTranscript(
      videoId,
      payload.languageCode ? [payload.languageCode, 'en'] : ['en']
    );

    // 3. Generate Checkpoints & Active Recall Challenges
    const checkpoints = CheckpointService.generateCheckpoints(
      transcriptResult.segments
    );

    // 4. Determine Project Template
    let chosenTemplate: TemplateId = payload.template || 'nodejs';
    const lowerTitle = metadata.title.toLowerCase();
    if (!payload.template) {
      if (lowerTitle.includes('react') || lowerTitle.includes('vite')) {
        chosenTemplate = 'react';
      } else if (lowerTitle.includes('next') || lowerTitle.includes('next.js')) {
        chosenTemplate = 'nextjs';
      } else if (lowerTitle.includes('python') || lowerTitle.includes('django') || lowerTitle.includes('fastapi')) {
        chosenTemplate = 'python';
      } else if (lowerTitle.includes('c++') || lowerTitle.includes('cpp')) {
        chosenTemplate = 'cpp';
      } else if (lowerTitle.includes('java') || lowerTitle.includes('spring')) {
        chosenTemplate = 'java';
      } else if (lowerTitle.includes('html') || lowerTitle.includes('css')) {
        chosenTemplate = 'html';
      }
    }

    // 5. Create Base Project Workspace
    const projectName = payload.customName?.trim() || metadata.title.slice(0, 40) || `Tutorial-${videoId}`;
    const project = await ProjectService.createProject({
      name: projectName,
      template: chosenTemplate,
      description: `Project Breakout workspace for: ${metadata.title}`,
    });

    // 6. Build Tutorial Metadata
    const lastSegment = transcriptResult.segments[transcriptResult.segments.length - 1];
    const durationSeconds = lastSegment ? lastSegment.start + lastSegment.duration : 600;

    const tutorialMeta: TutorialMetadata = {
      id: uuidv4(),
      projectId: project.id,
      youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
      videoId,
      title: metadata.title,
      thumbnailUrl: metadata.thumbnailUrl,
      durationSeconds: Math.ceil(durationSeconds),
      language: transcriptResult.language,
      languageCode: transcriptResult.languageCode,
      isGenerated: transcriptResult.isGenerated,
      transcript: transcriptResult.segments,
      checkpoints,
      notes: [],
      rebuildMode: false,
    };

    this.tutorialStore.set(project.id, tutorialMeta);

    // Attach to project return
    project.tutorial = tutorialMeta;
    return project;
  }

  static async getTutorial(projectId: string): Promise<TutorialMetadata | null> {
    return this.tutorialStore.get(projectId) || null;
  }

  static async updateCheckpoint(
    projectId: string,
    checkpointId: string,
    completed: boolean
  ): Promise<boolean> {
    const tutorial = this.tutorialStore.get(projectId);
    if (!tutorial) return false;

    const cp = tutorial.checkpoints.find((c) => c.id === checkpointId);
    if (cp) {
      cp.completed = completed;
      return true;
    }
    return false;
  }

  static async setRebuildMode(
    projectId: string,
    enabled: boolean,
    spec?: RebuildSpecification
  ): Promise<TutorialMetadata | null> {
    const tutorial = this.tutorialStore.get(projectId);
    if (!tutorial) return null;

    tutorial.rebuildMode = enabled;
    if (spec) {
      tutorial.rebuildSpec = spec;
    }
    return tutorial;
  }
}
