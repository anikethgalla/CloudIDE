'use client';

import React, { useState, useEffect } from 'react';
import { Cpu, RefreshCw, CheckCircle2, XCircle, X, Terminal, Package, Wrench, GitBranch } from 'lucide-react';
import { ToolchainDiagnostics, ToolchainItem } from '@cloud-ide/shared';
import { ApiClient } from '@/services/api';

interface DiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DiagnosticsModal: React.FC<DiagnosticsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [diagnostics, setDiagnostics] = useState<ToolchainDiagnostics | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadDiagnostics = async (refresh = false) => {
    try {
      setIsLoading(true);
      const data = await ApiClient.getDiagnostics(refresh);
      setDiagnostics(data);
    } catch (err: any) {
      console.error('Failed to load diagnostics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadDiagnostics(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getCategoryIcon = (category: ToolchainItem['category']) => {
    switch (category) {
      case 'runtime':
        return <Terminal className="w-3.5 h-3.5 text-sky-400" />;
      case 'package_manager':
        return <Package className="w-3.5 h-3.5 text-amber-400" />;
      case 'compiler':
        return <Wrench className="w-3.5 h-3.5 text-emerald-400" />;
      case 'vcs':
        return <GitBranch className="w-3.5 h-3.5 text-violet-400" />;
      default:
        return <Cpu className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  const tools = diagnostics?.tools || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fade-in font-sans">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Environment & Toolchains Diagnostics</h3>
              <p className="text-[11px] text-zinc-400">Real-time status of compilers, package managers, and runtimes</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => loadDiagnostics(true)}
              disabled={isLoading}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium border border-zinc-700 transition-colors"
              title="Rescan environment"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Rescan</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
          <div className="border border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-800/80 bg-zinc-950/50">
            {tools.map((item) => (
              <div
                key={item.command}
                className="p-3 flex items-center justify-between hover:bg-zinc-900/60 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-zinc-200">{item.name}</span>
                      <code className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                        {item.command}
                      </code>
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                      {item.version || 'Not installed / not in PATH'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  {item.available ? (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Ready</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500 border border-zinc-700 text-[10px] font-medium">
                      <XCircle className="w-3 h-3" />
                      <span>Unavailable</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
          <span>
            Scanned: {diagnostics ? new Date(diagnostics.timestamp).toLocaleTimeString() : 'Loading...'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg border border-zinc-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
