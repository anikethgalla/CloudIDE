'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';
import { RefreshCw, Terminal as TerminalIcon, WifiOff, Loader2 } from 'lucide-react';

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
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isMountedRef = useRef(true);

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const cleanupSocket = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.onopen = null;
      socketRef.current.onmessage = null;
      socketRef.current.onclose = null;
      socketRef.current.onerror = null;
      if (
        socketRef.current.readyState === WebSocket.OPEN ||
        socketRef.current.readyState === WebSocket.CONNECTING
      ) {
        socketRef.current.close();
      }
      socketRef.current = null;
    }
  }, []);

  const connectWebSocket = useCallback(() => {
    if (!projectId || !isMountedRef.current) return;

    cleanupSocket();

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setIsConnecting(true);

    const term = xtermInstance.current;
    if (term && reconnectAttemptsRef.current === 0) {
      term.writeln('\x1b[38;5;244mConnecting to sandboxed terminal container...\x1b[0m');
    }

    try {
      const wsUrl = `${WS_BASE}/ws/terminal?projectId=${encodeURIComponent(projectId)}`;
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        if (!isMountedRef.current) return;
        setIsConnected(true);
        setIsConnecting(false);
        reconnectAttemptsRef.current = 0;
        onConnectionChange?.(true);

        // Send initial dimensions
        if (xtermInstance.current) {
          const { cols, rows } = xtermInstance.current;
          ws.send(JSON.stringify({ type: 'resize', cols, rows }));
          xtermInstance.current.focus();
        }

        // Setup ping keepalive every 15s
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 15000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.type === 'pong') {
            return; // Ignore keepalive pong
          }
        } catch (_) {
          // Normal terminal data chunk
        }
        xtermInstance.current?.write(event.data);
      };

      ws.onclose = (e) => {
        if (!isMountedRef.current) return;
        setIsConnected(false);
        setIsConnecting(false);
        onConnectionChange?.(false);

        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }

        // Auto-reconnect with exponential backoff if not cleanly closed
        if (reconnectAttemptsRef.current < 6) {
          const delay = Math.min(1000 * Math.pow(1.5, reconnectAttemptsRef.current), 8000);
          reconnectAttemptsRef.current += 1;
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current) {
              connectWebSocket();
            }
          }, delay);
        }
      };

      ws.onerror = () => {
        if (!isMountedRef.current) return;
        setIsConnected(false);
        setIsConnecting(false);
        onConnectionChange?.(false);
      };
    } catch (err) {
      console.error('[XTermTerminal] WebSocket init error:', err);
      setIsConnected(false);
      setIsConnecting(false);
    }
  }, [projectId, cleanupSocket, onConnectionChange]);

  const initTerminal = useCallback(() => {
    if (!terminalRef.current) return;

    // Dispose old instance if exists
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

    // Forward terminal input to backend
    term.onData((data) => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'input', data }));
      }
    });

    connectWebSocket();
  }, [connectWebSocket]);

  useEffect(() => {
    isMountedRef.current = true;
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

    // Auto reconnect on tab switch / window focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
          reconnectAttemptsRef.current = 0;
          connectWebSocket();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      resizeObserver.disconnect();
      cleanupSocket();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (xtermInstance.current) {
        xtermInstance.current.dispose();
        xtermInstance.current = null;
      }
    };
  }, [initTerminal, cleanupSocket, connectWebSocket]);

  const handleManualReconnect = () => {
    reconnectAttemptsRef.current = 0;
    connectWebSocket();
  };

  return (
    <div
      className="h-full w-full relative flex flex-col bg-ide-bg select-text overflow-hidden cursor-text"
      onClick={() => xtermInstance.current?.focus()}
    >
      {/* Terminal Container */}
      <div ref={terminalRef} className="flex-1 w-full h-full p-2" />

      {/* Disconnected / Reconnecting Status Badge */}
      {!isConnected && (
        <div className="absolute top-2 right-2 flex items-center space-x-2 bg-zinc-900/95 border border-zinc-700 px-3 py-1.5 rounded-lg shadow-xl text-xs backdrop-blur-md">
          {isConnecting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 text-sky-400 animate-spin" />
              <span className="text-zinc-300 font-medium">Reconnecting...</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-zinc-300">Disconnected</span>
              <button
                onClick={handleManualReconnect}
                className="flex items-center space-x-1 px-2 py-0.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-medium transition-colors ml-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
