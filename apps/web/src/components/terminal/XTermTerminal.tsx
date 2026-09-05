'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';
import { RefreshCw, Terminal as TerminalIcon, WifiOff } from 'lucide-react';

interface XTermTerminalProps {
  projectId: string;
  onConnectionChange?: (connected: boolean) => void;
}

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000';

export const XTermTerminal: React.FC<XTermTerminalProps> = ({
  projectId,
  onConnectionChange,
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermInstance = useRef<XTerm | null>(null);
  const fitAddonInstance = useRef<FitAddon | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const initTerminal = () => {
    if (!terminalRef.current) return;

    // Clean up previous instance
    if (xtermInstance.current) {
      xtermInstance.current.dispose();
      xtermInstance.current = null;
    }

    const term = new XTerm({
      cursorBlink: true,
      cursorStyle: 'block',
      fontSize: 13,
      fontFamily: "'Fira Code', 'Consolas', 'Courier New', monospace",
      theme: {
        background: '#18181b',
        foreground: '#f4f4f5',
        cursor: '#38bdf8',
        selectionBackground: 'rgba(56, 189, 248, 0.3)',
        black: '#18181b',
        red: '#f87171',
        green: '#4ade80',
        yellow: '#facc15',
        blue: '#60a5fa',
        magenta: '#c084fc',
        cyan: '#38bdf8',
        white: '#f4f4f5',
        brightBlack: '#71717a',
        brightRed: '#ef4444',
        brightGreen: '#22c55e',
        brightYellow: '#eab308',
        brightBlue: '#3b82f6',
        brightMagenta: '#a855f7',
        brightCyan: '#06b6d4',
        brightWhite: '#ffffff',
      },
      allowTransparency: true,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);

    term.open(terminalRef.current);
    fitAddon.fit();

    xtermInstance.current = term;
    fitAddonInstance.current = fitAddon;

    connectWebSocket(term, fitAddon);
  };

  const connectWebSocket = (term: XTerm, fitAddon: FitAddon) => {
    if (!projectId) return;

    if (socketRef.current) {
      socketRef.current.close();
    }

    setIsConnecting(true);
    term.writeln('\x1b[38;5;244mConnecting to sandboxed terminal container...\x1b[0m');

    const wsUrl = `${WS_BASE}/ws/terminal?projectId=${encodeURIComponent(projectId)}`;
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setIsConnecting(false);
      onConnectionChange?.(true);
      term.writeln('\x1b[38;5;34m✔ Interactive sandbox terminal connected.\x1b[0m\r\n');

      // Send initial dimensions
      const { cols, rows } = term;
      ws.send(JSON.stringify({ type: 'resize', cols, rows }));
    };

    ws.onmessage = (event) => {
      term.write(event.data);
    };

    ws.onclose = () => {
      setIsConnected(false);
      setIsConnecting(false);
      onConnectionChange?.(false);
      term.writeln('\r\n\x1b[38;5;196m✖ Terminal session disconnected.\x1b[0m');
    };

    ws.onerror = () => {
      setIsConnected(false);
      setIsConnecting(false);
      onConnectionChange?.(false);
      term.writeln('\r\n\x1b[38;5;196m✖ WebSocket connection error.\x1b[0m');
    };

    // Forward terminal input to backend
    term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'input', data }));
      }
    });
  };

  useEffect(() => {
    initTerminal();

    const handleResize = () => {
      if (fitAddonInstance.current && xtermInstance.current) {
        fitAddonInstance.current.fit();
        const { cols, rows } = xtermInstance.current;
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({ type: 'resize', cols, rows }));
        }
      }
    };

    window.addEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    if (terminalRef.current) {
      resizeObserver.observe(terminalRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (xtermInstance.current) {
        xtermInstance.current.dispose();
      }
    };
  }, [projectId]);

  const handleReconnect = () => {
    if (xtermInstance.current && fitAddonInstance.current) {
      xtermInstance.current.clear();
      connectWebSocket(xtermInstance.current, fitAddonInstance.current);
    }
  };

  return (
    <div className="h-full w-full relative flex flex-col bg-ide-bg select-text overflow-hidden">
      {/* Terminal Container */}
      <div ref={terminalRef} className="flex-1 w-full h-full p-2" />

      {/* Disconnected Overlay / Reconnect Banner */}
      {!isConnected && !isConnecting && (
        <div className="absolute top-2 right-2 flex items-center space-x-2 bg-zinc-900/90 border border-zinc-700/80 px-2.5 py-1.5 rounded-lg shadow-lg text-xs">
          <WifiOff className="w-3.5 h-3.5 text-rose-400" />
          <span className="text-zinc-300">Disconnected</span>
          <button
            onClick={handleReconnect}
            className="flex items-center space-x-1 px-2 py-0.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-medium transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reconnect</span>
          </button>
        </div>
      )}
    </div>
  );
};
