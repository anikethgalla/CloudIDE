import { Worker, Job } from 'bullmq';
import { getRedisConnection } from '../config/redis';
import { TutorialService } from '../services/tutorial/tutorialService';
import { YouTubeService } from '../services/youtube/youtubeService';
import { TranscriptService } from '../services/youtube/transcriptService';
import { CheckpointService } from '../services/tutorial/checkpointService';
import { SpecificationService } from '../services/ai/specificationService';
import { Database } from '../db/db';
import { ProjectService } from '../services/projectService';
import { TemplateId } from '@cloud-ide/shared';

export function createTutorialWorker(): Worker {
  const worker = new Worker(
    'tutorial-queue',
    async (job: Job) => {
      const { jobId, userId, url, template, languageCode, customName, projectId } = job.data;
      const startTime = Date.now();
      console.log(`[Worker:Tutorial] Job ${job.name} started (ID: ${jobId || job.id})`);

      try {
        if (job.name === 'tutorial:import') {
          await Database.updateJob(jobId, { status: 'PROCESSING', progress: 10 });
          await job.updateProgress(10);

          // 1. Process YouTube Import
          const project = await TutorialService.importTutorial({
            url,
            template,
            languageCode,
            customName,
            userId,
          });

          await Database.updateJob(jobId, {
            status: 'COMPLETED',
            progress: 100,
            result: {
              projectId: project.id,
              tutorialId: project.tutorial?.id,
              project,
            },
          });
          await job.updateProgress(100);

          console.log(`[Worker:Tutorial] Job completed in ${Date.now() - startTime}ms (Project: ${project.id})`);
          return { success: true, projectId: project.id, tutorialId: project.tutorial?.id };
        }

        if (job.name === 'tutorial:generate-spec') {
          await Database.updateJob(jobId, { status: 'PROCESSING', progress: 20 });
          const tutorial = await TutorialService.getTutorial(projectId);
          if (!tutorial) throw new Error(`Tutorial for project ${projectId} not found.`);

          const spec = await SpecificationService.generateSpecification(projectId);

          await TutorialService.setRebuildMode(projectId, true, spec);
          await Database.updateJob(jobId, { status: 'COMPLETED', progress: 100, result: spec });
          return spec;
        }

        return { success: true };
      } catch (err: any) {
        console.error(`[Worker:Tutorial] Job ${jobId || job.id} failed:`, err.message);
        await Database.updateJob(jobId, {
          status: 'FAILED',
          error: err.message || 'Unknown processing error',
        });
        throw err;
      }
    },
    {
      connection: getRedisConnection(),
      concurrency: 5,
    }
  );

  worker.on('failed', (job, err) => {
    console.error(`[Worker:Tutorial] Job ${job?.id} failed with error: ${err.message}`);
  });

  return worker;
}
