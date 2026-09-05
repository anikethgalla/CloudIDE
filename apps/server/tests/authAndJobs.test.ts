import { db, upsertUser, getUser, getUserByEmail, listProjects, createProject, getProject, deleteProject, saveJob, getJob, updateJob } from '../src/db/db';
import { enqueueJob } from '../src/queues';
import { JobRecord, JobStatus, Project, User } from '@cloud-ide/shared';

describe('Authentication, Multi-Tenancy & Job Queues', () => {
  const testUser1: User = {
    id: 'user_test_1',
    email: 'dev1@breakout.io',
    name: 'Developer One',
    avatar: 'https://github.com/dev1.png',
    provider: 'github' as const,
    createdAt: new Date().toISOString(),
  };

  const testUser2: User = {
    id: 'user_test_2',
    email: 'dev2@breakout.io',
    name: 'Developer Two',
    avatar: 'https://google.com/dev2.png',
    provider: 'google' as const,
    createdAt: new Date().toISOString(),
  };

  test('Database should upsert and retrieve users cleanly', async () => {
    await upsertUser(testUser1);
    await upsertUser(testUser2);

    const user1 = await getUser(testUser1.id);
    expect(user1).toBeDefined();
    expect(user1?.email).toBe('dev1@breakout.io');
    expect(user1?.provider).toBe('github');

    const user2ByEmail = await getUserByEmail('dev2@breakout.io');
    expect(user2ByEmail).toBeDefined();
    expect(user2ByEmail?.name).toBe('Developer Two');
  });

  test('Multi-tenant project isolation: User 1 and User 2 projects remain segregated', async () => {
    // Create projects for User 1
    const p1: Project = {
      id: 'proj_u1_1',
      name: 'User 1 React App',
      description: 'Test React App',
      template: 'react',
      language: 'javascript',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: testUser1.id,
    };
    await createProject(p1);

    // Create projects for User 2
    const p2: Project = {
      id: 'proj_u2_1',
      name: 'User 2 Go Backend',
      description: 'Test Go Backend',
      template: 'go',
      language: 'go',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: testUser2.id,
    };
    await createProject(p2);

    // List projects for user 1
    const user1Projects = await listProjects(testUser1.id);
    expect(user1Projects.some((p: Project) => p.id === 'proj_u1_1')).toBe(true);
    expect(user1Projects.some((p: Project) => p.id === 'proj_u2_1')).toBe(false);

    // List projects for user 2
    const user2Projects = await listProjects(testUser2.id);
    expect(user2Projects.some((p: Project) => p.id === 'proj_u2_1')).toBe(true);
    expect(user2Projects.some((p: Project) => p.id === 'proj_u1_1')).toBe(false);

    // Get specific project with userId authorization check
    expect(await getProject('proj_u1_1', testUser1.id)).toBeDefined();
    expect(await getProject('proj_u1_1', testUser2.id)).toBeNull(); // User 2 should NOT access User 1's project

    // Delete project with userId check
    const deleteUnauthorized = await deleteProject('proj_u1_1', testUser2.id);
    expect(deleteUnauthorized).toBe(false);
    expect(await getProject('proj_u1_1')).toBeDefined(); // Still exists

    const deleteAuthorized = await deleteProject('proj_u1_1', testUser1.id);
    expect(deleteAuthorized).toBe(true);
    expect(await getProject('proj_u1_1')).toBeNull(); // Deleted
  });

  test('Job Repository should persist and update job records with progress and results', async () => {
    const jobRecord: JobRecord = {
      id: 'job_test_100',
      type: 'tutorial:import',
      status: 'QUEUED',
      progress: 0,
      userId: testUser1.id,
      payload: { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveJob(jobRecord);

    const fetched = await getJob('job_test_100');
    expect(fetched).toBeDefined();
    expect(fetched?.status).toBe('QUEUED');
    expect(fetched?.progress).toBe(0);

    // Update job to processing
    await updateJob('job_test_100', {
      status: 'PROCESSING',
      progress: 50,
    });

    const processingJob = await getJob('job_test_100');
    expect(processingJob?.status).toBe('PROCESSING');
    expect(processingJob?.progress).toBe(50);

    // Complete job
    await updateJob('job_test_100', {
      status: 'COMPLETED',
      progress: 100,
      result: { videoId: 'dQw4w9WgXcQ', title: 'Imported Tutorial' },
    });

    const completedJob = await getJob('job_test_100');
    expect(completedJob?.status).toBe('COMPLETED');
    expect(completedJob?.progress).toBe(100);
    expect(completedJob?.result?.videoId).toBe('dQw4w9WgXcQ');
  });

  test('Job Queue enqueuer creates tracked database record gracefully', async () => {
    const job = await enqueueJob('tutorial:import', {
      url: 'https://youtu.be/sample123',
      projectId: 'proj_test_async',
    }, testUser1.id, 'tutorial');

    expect(job).toBeDefined();
    expect(job.id).toBeDefined();
    expect(job.status).toBe('QUEUED');
    expect(job.userId).toBe(testUser1.id);

    const dbRecord = await getJob(job.id);
    expect(dbRecord).toBeDefined();
    expect(dbRecord?.type).toBe('tutorial:import');
  });
});
