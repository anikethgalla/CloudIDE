import { Worker, Job } from 'bullmq';
import { getRedisConnection } from '../config/redis';
import { Database } from '../db/db';
import { ProjectService } from '../services/projectService';

export function createWorkspaceWorker(): Worker {
  const worker = new Worker(
    'workspace-queue',
    async (job: Job) => {
      const { jobId, projectId, userId, template, name, description } = job.data;
      console.log(`[Worker:Workspace] Job ${job.name} started (ID: ${jobId || job.id})`);

      try {
        await Database.updateJob(jobId, { status: 'PROCESSING', progress: 20 });

        if (job.name === 'workspace:create') {
          const project = await ProjectService.createProject({
            name,
            template,
            description,
            userId,
          });

          await Database.updateJob(jobId, {
            status: 'COMPLETED',
            progress: 100,
            result: project,
          });
          return project;
        }

        if (job.name === 'workspace:cleanup') {
          await ProjectService.deleteProject(projectId, userId);
          await Database.updateJob(jobId, { status: 'COMPLETED', progress: 100 });
          return { deleted: true };
        }

        return { success: true };
      } catch (err: any) {
        console.error(`[Worker:Workspace] Job ${jobId || job.id} failed:`, err.message);
        await Database.updateJob(jobId, {
          status: 'FAILED',
          error: err.message || 'Workspace processing error',
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
