import Docker from 'dockerode';
import path from 'path';
import fs from 'fs';
import { config } from '../config';
import { SecurePathResolver } from '../utils/securePath';

export class DockerSandboxService {
  private static docker: Docker | null = null;
  private static isDockerAvailable = false;
  private static activeContainers: Map<string, Docker.Container> = new Map();

  static async init(): Promise<void> {
    try {
      this.docker = new Docker({
        socketPath: config.docker.socketPath || (process.platform === 'win32' ? '//./pipe/docker_engine' : '/var/run/docker.sock'),
        timeout: 5000,
      });

      await this.docker.ping();
      this.isDockerAvailable = true;
      console.log('✔ Connected to Docker Daemon for sandbox container execution.');
    } catch (err: any) {
      this.isDockerAvailable = false;
      console.warn(`⚠ Docker Daemon unavailable (${err.message}). Using local isolated runner process fallback.`);
    }
  }

  static isAvailable(): boolean {
    return this.isDockerAvailable;
  }

  /**
   * Spawns an isolated Docker container with strict CPU, memory, PID, and non-root user limits.
   */
  static async createSandboxContainer(projectId: string, imageName = 'node:20-alpine'): Promise<Docker.Container | null> {
    if (!this.isDockerAvailable || !this.docker) {
      return null;
    }

    const hostWorkspace = SecurePathResolver.getProjectRoot(projectId);

    try {
      const container = await this.docker.createContainer({
        Image: imageName,
        Cmd: ['/bin/sh'],
        Tty: true,
        OpenStdin: true,
        StdinOnce: false,
        WorkingDir: '/workspace',
        User: '1000:1000', // Non-root user inside container
        HostConfig: {
          Binds: [`${hostWorkspace}:/workspace:rw`],
          Memory: config.docker.memoryLimit, // 512 MB
          MemorySwap: config.docker.memoryLimit, // Prevent swapping to exhaust disk
          NanoCpus: config.docker.cpuLimit * 1e9, // 1.0 CPU quota
          PidsLimit: config.docker.pidsLimit, // Prevent fork bombs
          NetworkMode: 'bridge',
          AutoRemove: true,
        },
      });

      await container.start();
      this.activeContainers.set(projectId, container);
      return container;
    } catch (err: any) {
      console.error(`Failed to create Docker sandbox for project ${projectId}:`, err.message);
      return null;
    }
  }

  static async stopSandboxContainer(projectId: string): Promise<void> {
    const container = this.activeContainers.get(projectId);
    if (container) {
      try {
        await container.stop({ t: 2 });
      } catch (_) {}
      this.activeContainers.delete(projectId);
    }
  }
}
