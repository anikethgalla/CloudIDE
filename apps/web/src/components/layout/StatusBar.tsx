'use client';

import React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  Terminal,
  Globe,
  Code,
} from 'lucide-react';
import { ExecutionStatus } from '@cloud-ide/shared';
import { cn } from '@/lib/utils';

interface StatusBarProps {
  language: string;
  cursorPosition: { line: number; column: number };
  executionStatus: ExecutionStatus;
  previewUrl: string | null;
  isTerminalConnected: boolean;
  onOpenTerminal: () => void;
  onOpenPreview: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  language,
  cursorPosition,
  executionStatus,
  previewUrl,
  isTerminalConnected,
  onOpenTerminal,
  onOpenPreview,
}) => {
  const getStatusBadge = () => {
    switch (executionStatus) {
      case 'RUNNING':
      case 'QUEUED':
        return (
          <div className="flex items-center space-x-1 text-amber-300 font-medium animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Executing...</span>
          </div>
        );
      case 'SUCCESS':
        return (
          <div className="flex items-center space-x-1 text-emerald-300 font-medium">
            <CheckCircle2 className="w-3 h-3" />
            <span>Finished (Success)</span>
          </div>
        );
      case 'FAILED':
        return (
          <div className="flex items-center space-x-1 text-rose-300 font-medium">
            <AlertCircle className="w-3 h-3" />
            <span>Execution Failed</span>
          </div>
        );
      case 'TIMEOUT':
        return (
          <div className="flex items-center space-x-1 text-amber-300 font-medium">
            <Clock className="w-3 h-3" />
            <span>Timed Out</span>
          </div>
        );
      case 'STOPPED':
        return (
          <div className="flex items-center space-x-1 text-zinc-300 font-medium">
            <span>Stopped</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-1 text-zinc-400">
            <span>Ready</span>
          </div>
        );
    }
  };

  return (
    <footer className="h-6 bg-ide-sidebar border-t border-ide-border flex items-center justify-between px-3 text-[11px] select-none text-zinc-400 z-30">
      {/* Left items */}
      <div className="flex items-center space-x-3">
        {getStatusBadge()}

        <div className="h-3 w-[1px] bg-ide-border" />

        <button
          onClick={onOpenTerminal}
          className="flex items-center space-x-1 hover:text-zinc-200 transition-colors"
          title="Terminal Session Status"
        >
          <Terminal className="w-3 h-3" />
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              isTerminalConnected ? 'bg-emerald-400' : 'bg-zinc-600'
            )}
          />
          <span>{isTerminalConnected ? 'Sandbox Active' : 'Terminal Idle'}</span>
        </button>

        {previewUrl && (
          <>
            <div className="h-3 w-[1px] bg-ide-border" />
            <button
              onClick={onOpenPreview}
              className="flex items-center space-x-1 text-sky-400 hover:text-sky-300 transition-colors"
              title="Open Live Preview"
            >
              <Globe className="w-3 h-3" />
              <span>Preview Live</span>
            </button>
          </>
        )}
      </div>

      {/* Right items */}
      <div className="flex items-center space-x-4">
        <div>
          Ln {cursorPosition.line}, Col {cursorPosition.column}
        </div>
        <div>Spaces: 2</div>
        <div>UTF-8</div>
        <div className="flex items-center space-x-1 font-mono uppercase text-[10px] text-zinc-300">
          <Code className="w-3 h-3 text-sky-400" />
          <span>{language || 'Plain Text'}</span>
        </div>
      </div>
    </footer>
  );
};
