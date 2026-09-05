import { WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import url from 'url';
import { ExecutionService } from '../services/executionService';

export function handleExecutionWebSocket(ws: WebSocket, req: IncomingMessage) {
  const parsedUrl = url.parse(req.url || '', true);
  const executionId = parsedUrl.query.executionId as string;

  if (!executionId) {
    ws.send(JSON.stringify({ type: 'stderr', data: 'Missing executionId parameter\n' }));
    ws.close();
    return;
  }

  ExecutionService.registerClient(executionId, ws);

  ws.on('close', () => {
    ExecutionService.unregisterClient(executionId, ws);
  });
}
