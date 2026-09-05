'use client';

import React, { useEffect, useRef } from 'react';
import { Trash2, Terminal, CheckCircle2, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { ExecutionStatus } from '@cloud-ide/shared';
import { cn } from '@/lib/utils';

interface OutputPanelProps {
  output: string;
  status: ExecutionStatus;
  onClear: () => void;
}

export const OutputPanel: React.FC<OutputPanelProps> = ({
  output,
  status,
  onClear,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [output]);

  const renderStatus = () => {
    switch (status) {
      case 'RUNNING':
      case 'QUEUED':
        return (
          <span className="flex items-center space-x-1 text-amber-400">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Running...</span>
          </span>
        );
      case 'SUCCESS':
        return (
          <span className="flex items-center space-x-1 text-emerald-400">
            <CheckCircle2 className="w-3 h-3" />
            <span>Success</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="flex items-center space-x-1 text-rose-400">
            <AlertCircle className="w-3 h-3" />
            <span>Failed</span>
          </span>
        );
      case 'TIMEOUT':
        return (
          <span className="flex items-center space-x-1 text-amber-400">
            <Clock className="w-3 h-3" />
            <span>Timeout</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-ide-bg select-text font-mono text-xs overflow-hidden">
      {/* Header / Actions */}
      <div className="h-7 px-3 bg-zinc-900 border-b border-ide-border flex items-center justify-between text-[11px] text-zinc-400 select-none">
        <div className="flex items-center space-x-2">
          <span>Execution Output</span>
          {renderStatus()}
        </div>

        <button
          onClick={onClear}
          className="p-1 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"
          title="Clear Output"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Stream Area */}
      <div
        ref={containerRef}
        className="flex-1 p-3 overflow-y-auto custom-scrollbar text-zinc-200 whitespace-pre-wrap font-mono leading-relaxed"
      >
        {output ? (
          output
        ) : (
          <div className="text-zinc-500 italic">
            Click &quot;Run&quot; or press Ctrl+Enter to execute the active file.
          </div>
        )}
      </div>
    </div>
  );
};
