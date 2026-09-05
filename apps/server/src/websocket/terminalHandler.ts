import { WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import url from 'url';
import { TerminalService } from '../services/terminalService';

export function handleTerminalWebSocket(ws: WebSocket, req: IncomingMessage) {
  const parsedUrl = url.parse(req.url || '', true);
  const projectId = parsedUrl.query.projectId as string;

  if (!projectId) {
    ws.send('\r\n\x1b[31mMissing projectId in WebSocket connection query.\x1b[0m\r\n');
    ws.close();
    return;
  }

  TerminalService.handleConnection(ws, projectId);
}
