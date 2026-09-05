import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { WebSocketServer } from 'ws';
import url from 'url';

import { config } from './config';
import { Database } from './db/db';
import { DockerSandboxService } from './services/sandboxService';
import { ProjectController } from './controllers/projectController';
import { FileController } from './controllers/fileController';
import { ExecutionController } from './controllers/executionController';
import { TutorialController } from './controllers/tutorialController';
import { NotesController } from './controllers/notesController';
import { AIController } from './controllers/aiController';
import { WorkspaceController } from './controllers/workspaceController';
import { PortProxyService } from './services/portProxyService';
import { handleTerminalWebSocket } from './websocket/terminalHandler';
import { handleExecutionWebSocket } from './websocket/executionHandler';

async function bootstrap() {
  const app = express();
  const server = http.createServer(app);

  // Initialize DB and Docker
  await Database.init();
  await DockerSandboxService.init();

  // Middleware
  app.use(cors());
  app.use(morgan('dev'));
  app.use(express.json());

  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      dockerAvailable: DockerSandboxService.isAvailable(),
      timestamp: new Date().toISOString(),
    });
  });

  // REST API Routes
  // Templates
  app.get('/api/templates', ProjectController.getTemplates);

  // Projects
  app.get('/api/projects', ProjectController.list);
  app.post('/api/projects', ProjectController.create);
  app.get('/api/projects/:id', ProjectController.get);
  app.delete('/api/projects/:id', ProjectController.delete);

  // Files & Directories
  app.get('/api/projects/:id/files', FileController.getFiles);
  app.get('/api/projects/:id/file', FileController.getFileContent);
  app.post('/api/projects/:id/file', FileController.createFile);
  app.put('/api/projects/:id/file', FileController.saveFile);
  app.post('/api/projects/:id/directory', FileController.createDirectory);
  app.post('/api/projects/:id/rename', FileController.rename);
  app.delete('/api/projects/:id/resource', FileController.delete);

  // Execution
  app.post('/api/projects/:id/run', ExecutionController.run);
  app.post('/api/projects/:id/stop', ExecutionController.stop);

  // ==========================================
  // PROJECT BREAKOUT: TUTORIAL & LEARNING ROUTES
  // ==========================================
  app.post('/api/tutorials/import', TutorialController.importTutorial);
  app.get('/api/tutorials/:projectId', TutorialController.getTutorial);
  app.get('/api/tutorials/:projectId/transcript', TutorialController.getTranscript);
  app.post('/api/tutorials/:projectId/checkpoints/:checkpointId/complete', TutorialController.completeCheckpoint);
  app.post('/api/tutorials/:projectId/rebuild/start', TutorialController.startRebuild);
  app.post('/api/tutorials/:projectId/events', TutorialController.recordEvent);
  app.get('/api/tutorials/:projectId/events', TutorialController.getEvents);

  // Timestamped Notes
  app.get('/api/tutorials/:projectId/notes', NotesController.getNotes);
  app.post('/api/tutorials/:projectId/notes', NotesController.saveNote);
  app.delete('/api/tutorials/:projectId/notes/:noteId', NotesController.deleteNote);

  // Socratic AI (Gemini)
  app.post('/api/tutorials/:projectId/socratic-ai', AIController.socraticGuidance);

  // ==========================================
  // WORKSPACE DEVELOPMENT ENVIRONMENT ROUTES
  // ==========================================
  app.get('/api/workspaces/diagnostics', WorkspaceController.getDiagnostics);
  app.get('/api/workspaces/:projectId/detect', WorkspaceController.detectProject);
  app.get('/api/workspaces/:projectId/ports', WorkspaceController.getPorts);
  app.get('/api/workspaces/:projectId/env', WorkspaceController.getEnv);
  app.post('/api/workspaces/:projectId/env', WorkspaceController.saveEnv);
  app.get('/api/workspaces/:projectId/processes', WorkspaceController.getProcesses);
  app.post('/api/workspaces/:projectId/processes', WorkspaceController.startProcess);
  app.delete('/api/workspaces/:projectId/processes/:procId', WorkspaceController.stopProcess);

  // Port Reverse Proxy for Live Web Previews
  app.use('/api/proxy/:projectId/:port', (req, res) => {
    PortProxyService.handleProxyRequest(req, res);
  });

  // WebSocket Server Setup
  const wssTerminal = new WebSocketServer({ noServer: true });
  const wssExecute = new WebSocketServer({ noServer: true });

  wssTerminal.on('connection', (ws, req) => {
    handleTerminalWebSocket(ws, req);
  });

  wssExecute.on('connection', (ws, req) => {
    handleExecutionWebSocket(ws, req);
  });

  server.on('upgrade', (request, socket, head) => {
    const parsedUrl = url.parse(request.url || '');
    const pathname = parsedUrl.pathname;

    if (pathname === '/ws/terminal') {
      wssTerminal.handleUpgrade(request, socket, head, (ws) => {
        wssTerminal.emit('connection', ws, request);
      });
    } else if (pathname === '/ws/execute') {
      wssExecute.handleUpgrade(request, socket, head, (ws) => {
        wssExecute.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  server.listen(config.port, config.host, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Project Breakout Cloud IDE Backend listening on http://${config.host}:${config.port}`);
    console.log(`🔌 WebSocket Terminal Endpoint: ws://${config.host}:${config.port}/ws/terminal`);
    console.log(`🔌 WebSocket Execution Endpoint: ws://${config.host}:${config.port}/ws/execute`);
    console.log(`======================================================\n`);
  });
}

bootstrap().catch((err) => {
  console.error('Fatal backend bootstrap failure:', err);
  process.exit(1);
});
