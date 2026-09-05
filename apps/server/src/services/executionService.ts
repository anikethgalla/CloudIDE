import { v4 as uuidv4 } from 'uuid';
import { WebSocket } from 'ws';
import { ExecutionStatus, ExecutionResult, Language } from '@cloud-ide/shared';
import { RunnerFactory, BaseRunner } from '../runners';
import { ProjectService } from './projectService';

interface ActiveExecution {
  executionId: string;
  projectId: string;
  runner: BaseRunner;
  status: ExecutionStatus;
  outputBuffer: string;
  clients: Set<WebSocket>;
  startTime: number;
}

export class ExecutionService {
  private static activeExecutions: Map<string, ActiveExecution> = new Map();
  private static projectToExecution: Map<string, string> = new Map();

  static async runProject(projectId: string, customEntryFile?: string): Promise<string> {
    // Stop any existing execution for this project
    await this.stopProject(projectId);

    const project = await ProjectService.getProject(projectId);
    const entryFile = customEntryFile || project.entryFile || 'index.js';
    const executionId = uuidv4();

    const activeExec: ActiveExecution = {
      executionId,
      projectId,
      runner: null as any,
      status: 'QUEUED',
      outputBuffer: '',
      clients: new Set(),
      startTime: Date.now(),
    };

    const runner = RunnerFactory.createRunner(
      project.language,
      projectId,
      entryFile,
      {
        onOutput: (chunk) => {
          activeExec.outputBuffer += chunk.data;
          this.broadcastToClients(executionId, {
            type: chunk.type,
            data: chunk.data,
            timestamp: Date.now(),
          });
        },
        onStatus: (status) => {
          activeExec.status = status;
          this.broadcastToClients(executionId, {
            type: 'status',
            status,
            timestamp: Date.now(),
          });
        },
      }
    );

    activeExec.runner = runner;
    this.activeExecutions.set(executionId, activeExec);
    this.projectToExecution.set(projectId, executionId);

    // Asynchronously run
    runner.run().then((exitCode) => {
      // Clean up when done
      setTimeout(() => {
        if (this.projectToExecution.get(projectId) === executionId) {
          this.projectToExecution.delete(projectId);
        }
      }, 5000);
    });

    return executionId;
  }

  static async stopProject(projectId: string): Promise<boolean> {
    const executionId = this.projectToExecution.get(projectId);
    if (!executionId) return false;

    const exec = this.activeExecutions.get(executionId);
    if (exec) {
      exec.runner.stop();
      exec.status = 'STOPPED';
      this.broadcastToClients(executionId, {
        type: 'status',
        status: 'STOPPED',
        timestamp: Date.now(),
      });
      this.projectToExecution.delete(projectId);
      return true;
    }
    return false;
  }

  static registerClient(executionId: string, ws: WebSocket) {
    const exec = this.activeExecutions.get(executionId);
    if (exec) {
      exec.clients.add(ws);
      // Replay existing output buffer to new client
      if (exec.outputBuffer) {
        ws.send(
          JSON.stringify({
            type: 'stdout',
            data: exec.outputBuffer,
            timestamp: Date.now(),
          })
        );
      }
      ws.send(
        JSON.stringify({
          type: 'status',
          status: exec.status,
          timestamp: Date.now(),
        })
      );
    }
  }

  static unregisterClient(executionId: string, ws: WebSocket) {
    const exec = this.activeExecutions.get(executionId);
    if (exec) {
      exec.clients.delete(ws);
    }
  }

  private static broadcastToClients(executionId: string, message: any) {
    const exec = this.activeExecutions.get(executionId);
    if (!exec) return;

    const payload = JSON.stringify(message);
    for (const client of exec.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  }
}
