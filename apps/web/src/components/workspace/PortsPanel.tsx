'use client';

import React, { useState, useEffect } from 'react';
import { Network, ExternalLink, RefreshCw, Globe, Activity } from 'lucide-react';
import { WorkspacePort } from '@cloud-ide/shared';
import { ApiClient } from '@/services/api';

interface PortsPanelProps {
  projectId: string;
  onOpenPreview?: (port: number) => void;
}

export const PortsPanel: React.FC<PortsPanelProps> = ({ projectId, onOpenPreview }) => {
  const [ports, setPorts] = useState<WorkspacePort[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadPorts = async () => {
    try {
      setIsLoading(true);
      const data = await ApiClient.getPorts(projectId);
      setPorts(data || []);
    } catch (_) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPorts();
    const interval = setInterval(loadPorts, 4000);
    return () => clearInterval(interval);
  }, [projectId]);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  return (
    <div className="h-full w-full flex flex-col bg-zinc-950 text-zinc-300 font-sans select-none overflow-hidden">
      {/* Header */}
      <div className="h-9 px-3 bg-zinc-900 border-b border-ide-border flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <Network className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-xs font-semibold text-zinc-200">Forwarded & Listening Ports</span>
          {ports.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-medium">
              {ports.length} active
            </span>
          )}
        </div>

        <button
          onClick={loadPorts}
          disabled={isLoading}
          className="flex items-center space-x-1 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors"
          title="Refresh open ports"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Port Table / List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
        {ports.length > 0 ? (
          <div className="border border-zinc-800 rounded-lg overflow-hidden divide-y divide-zinc-800/80 bg-zinc-900/50">
            {ports.map((port) => {
              const proxyUrl = `${API_BASE}/api/proxy/${projectId}/${port.port}`;
              return (
                <div
                  key={port.port}
                  className="p-3 flex items-center justify-between hover:bg-zinc-850/60 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-zinc-100">
                          Port {port.port}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-[10px] font-mono text-zinc-400 uppercase">
                          {port.protocol}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                        {proxyUrl}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {onOpenPreview && (
                      <button
                        onClick={() => onOpenPreview(port.port)}
                        className="flex items-center space-x-1 px-2.5 py-1 rounded bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-xs font-medium transition-colors"
                        title="Open in IDE Preview Panel"
                      >
                        <Globe className="w-3 h-3" />
                        <span>Preview in IDE</span>
                      </button>
                    )}

                    <a
                      href={proxyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-xs font-medium transition-colors"
                      title="Open directly in new browser tab"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Open Tab</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-zinc-500">
            <Activity className="w-8 h-8 text-zinc-600 mb-2 stroke-[1.5]" />
            <p className="text-xs font-medium text-zinc-400 mb-1">No active ports detected</p>
            <p className="text-[11px] text-zinc-500 max-w-sm">
              Start a web server (e.g. <code>npm run dev</code>, <code>cargo run</code>, <code>go run .</code>, or <code>python -m http.server 8000</code>) in the terminal to automatically preview it here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
