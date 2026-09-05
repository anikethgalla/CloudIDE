import { Worker, Job } from 'bullmq';
import { getRedisConnection } from '../config/redis';
import { Database } from '../db/db';
import { SocraticService } from '../services/ai/socraticService';

export function createAiWorker(): Worker {
  const worker = new Worker(
    'ai-queue',
    async (job: Job) => {
      const { jobId, projectId, question, currentTimestamp, hintLevel, currentFile, currentCode, recentTerminalOutput } = job.data;
      console.log(`[Worker:AI] Job ${job.name} started (ID: ${jobId || job.id})`);

      try {
        await Database.updateJob(jobId, { status: 'PROCESSING', progress: 30 });

        if (job.name === 'ai:generate-hint') {
          const response = await SocraticService.getGuidance({
            projectId,
            question,
            currentTimestamp,
            hintLevel,
            currentFile,
            currentCode,
            recentTerminalOutput,
          });

          await Database.updateJob(jobId, {
            status: 'COMPLETED',
            progress: 100,
            result: response,
          });
          return response;
        }

        return { success: true };
      } catch (err: any) {
        console.error(`[Worker:AI] Job ${jobId || job.id} failed:`, err.message);
        await Database.updateJob(jobId, {
          status: 'FAILED',
          error: err.message || 'AI processing error',
        });
        throw err;
      }
    },
    {
      connection: getRedisConnection(),
      concurrency: 5,
    }
  );

  return worker;
}
