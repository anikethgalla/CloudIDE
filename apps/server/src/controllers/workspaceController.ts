import { Request, Response } from 'express';
import { DiagnosticsService } from '../services/diagnosticsService';
import { ProjectDetectorService } from '../services/projectDetectorService';
import { PortProxyService } from '../services/portProxyService';
import { EnvService } from '../services/envService';
import { ProcessManager } from '../services/processManager';

export class WorkspaceController {
  static async getDiagnostics(req: Request, res: Response) {
    try {
      const force = req.query.refresh === 'true';
      const diagnostics = await DiagnosticsService.getDiagnostics(force);
      res.json(diagnostics);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve diagnostics', message: err.message });
    }
  }

  static async detectProject(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const detected = await ProjectDetectorService.detect(projectId);
      res.json(detected || { type: 'unknown', name: 'Custom Project', suggestedRunCommands: [] });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to detect project type', message: err.message });
    }
  }

  static async getPorts(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const ports = await PortProxyService.getActivePorts(projectId);
      res.json(ports);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to scan ports', message: err.message });
    }
  }

  static async getEnv(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const vars = await EnvService.getEnvVars(projectId);
      res.json(vars);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve env vars', message: err.message });
    }
  }

  static async saveEnv(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const { vars } = req.body;
      if (!Array.isArray(vars)) {
        return res.status(400).json({ error: 'vars must be an array of key-value pairs.' });
      }
      const saved = await EnvService.saveEnvVars(projectId, vars);
      res.json(saved);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to save env vars', message: err.message });
    }
  }

  static async getProcesses(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const procs = ProcessManager.getProcesses(projectId);
      res.json(procs);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve processes', message: err.message });
    }
  }

  static async startProcess(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const { command, args, name } = req.body;
      if (!command) {
        return res.status(400).json({ error: 'command is required.' });
      }
      const proc = await ProcessManager.startProcess(projectId, command, args || [], name);
      res.status(201).json(proc);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to start process', message: err.message });
    }
  }

  static async stopProcess(req: Request, res: Response) {
    try {
      const { procId } = req.params;
      const success = ProcessManager.stopProcess(procId);
      res.json({ success });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to stop process', message: err.message });
    }
  }
}
