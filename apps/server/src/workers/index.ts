import { createTutorialWorker } from './tutorialWorker';
import { createAiWorker } from './aiWorker';
import { createWorkspaceWorker } from './workspaceWorker';
import { Database } from '../db/db';

async function startWorkers() {
  console.log('==============================================');
  console.log('🚀 Project Breakout Background Worker Starting');
  console.log('==============================================');

  // Initialize DB
  await Database.init();

  const tutorialWorker = createTutorialWorker();
  const aiWorker = createAiWorker();
  const workspaceWorker = createWorkspaceWorker();

  console.log('✔ Tutorial Worker initialized and listening on tutorial-queue');
  console.log('✔ AI Worker initialized and listening on ai-queue');
  console.log('✔ Workspace Worker initialized and listening on workspace-queue');

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\nStopping background workers...');
    await Promise.all([
      tutorialWorker.close(),
      aiWorker.close(),
      workspaceWorker.close(),
    ]);
    console.log('Workers stopped.');
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startWorkers().catch((err) => {
  console.error('Failed to start workers:', err);
  process.exit(1);
});
