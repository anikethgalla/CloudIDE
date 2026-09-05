import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  workspacesDir: path.resolve(
    process.cwd(),
    process.env.WORKSPACES_DIR || '../../workspaces'
  ),
  databaseUrl:
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/online_ide?schema=public',
  docker: {
    socketPath: process.env.DOCKER_SOCKET_PATH || undefined,
    memoryLimit: parseInt(process.env.SANDBOX_MEMORY_LIMIT || '536870912', 10), // 512MB
    cpuLimit: parseFloat(process.env.SANDBOX_CPU_LIMIT || '1.0'),
    pidsLimit: parseInt(process.env.SANDBOX_PIDS_LIMIT || '100', 10),
    timeoutMs: parseInt(process.env.EXECUTION_TIMEOUT_MS || '15000', 10),
  },
};
