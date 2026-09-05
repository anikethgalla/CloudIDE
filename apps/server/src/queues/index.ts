import { Queue, QueueOptions } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';
import { JobRecord, JobStatus } from '@cloud-ide/shared';
import { getRedisConnection, isRedisAvailable } from '../config/redis';
import { Database } from '../db/db';

let tutorialQueue: Queue | null = null;
let aiQueue: Queue | null = null;
let workspaceQueue: Queue | null = null;

function getQueueOptions(): QueueOptions {
  return {
    connection: getRedisConnection(),
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 50 },
    },
  };
}

export function getTutorialQueue(): Queue {
  if (!tutorialQueue) {
    tutorialQueue = new Queue('tutorial-queue', getQueueOptions());
  }
  return tutorialQueue;
}

export function getAiQueue(): Queue {
  if (!aiQueue) {
    aiQueue = new Queue('ai-queue', getQueueOptions());
  }
  return aiQueue;
}

export function getWorkspaceQueue(): Queue {
  if (!workspaceQueue) {
    workspaceQueue = new Queue('workspace-queue', getQueueOptions());
  }
  return workspaceQueue;
}

/**
 * Enqueues a job to BullMQ and saves the job state into Database (Postgres / fallback).
 */
export async function enqueueJob(
  type: string,
  payload: any,
  userId?: string,
  queueName: 'tutorial' | 'ai' | 'workspace' = 'tutorial'
): Promise<JobRecord> {
  const jobId = uuidv4();
  const now = new Date().toISOString();

  const jobRecord: JobRecord = {
    id: jobId,
    userId,
    type,
    status: 'QUEUED',
    progress: 0,
    payload,
    createdAt: now,
    updatedAt: now,
  };

  // Save to DB
  await Database.saveJob(jobRecord);

  try {
    let queue: Queue;
    switch (queueName) {
      case 'ai':
        queue = getAiQueue();
        break;
      case 'workspace':
        queue = getWorkspaceQueue();
        break;
      default:
        queue = getTutorialQueue();
        break;
    }

    await queue.add(type, { jobId, userId, ...payload }, { jobId });
  } catch (err: any) {
    console.warn(`[Queue] Failed to enqueue to Redis queue (${err.message}). Job recorded in DB for processing.`);
  }

  return jobRecord;
}
