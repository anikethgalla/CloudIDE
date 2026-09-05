'use client';

import React from 'react';
import {
  Play,
  Square,
  PanelLeft,
  PanelBottom,
  ExternalLink,
  Code2,
  Save,
  Globe,
  Loader2,
  FolderOpen,
} from 'lucide-react';
import Link from 'next/link';
import { Project, ExecutionStatus } from '@cloud-ide/shared';
import { cn } from '@/lib/utils';

interface TopBarProps {
  project: Project | null;
  executionStatus: ExecutionStatus;
  isSidebarOpen: boolean;
  isBottomPanelOpen: boolean;
  isPreviewOpen: boolean;
  hasDirtyFiles: boolean;
  onToggleSidebar: () => void;
  onToggleBottomPanel: () => void;
  onTogglePreview: () => void;
  onRun: () => void;
  onStop: () => void;
  onSaveAll: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  project,
  executionStatus,
  isSidebarOpen,
  isBottomPanelOpen,
  isPreviewOpen,
  hasDirtyFiles,
  onToggleSidebar,
  onToggleBottomPanel,
  onTogglePreview,
  onRun,
  onStop,
  onSaveAll,
}) => {
  const isRunning = executionStatus === 'RUNNING' || executionStatus === 'QUEUED';
  const isWebProject = project?.template === 'html' || project?.template === 'react' || project?.template === 'nextjs';

  return (
    <header className="h-12 bg-ide-activity border-b border-ide-border flex items-center justify-between px-3 select-none z-30">
      {/* Left: Logo & Project Info */}
      <div className="flex items-center space-x-3">
        <Link
          href="/"
          className="flex items-center space-x-2 text-sky-400 hover:text-sky-300 font-bold transition-colors"
          title="Back to Dashboard"
        >
          <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
            <Code2 className="w-4 h-4 text-sky-400" />
          </div>
          <span className="text-sm font-semibold tracking-wide text-zinc-100 hidden sm:inline">
            Cloud<span className="text-sky-400">IDE</span>
          </span>
        </Link>

        <div className="h-4 w-[1px] bg-ide-border" />

        <div className="flex items-center space-x-2">
          <Link
            href="/"
            className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Projects</span>
          </Link>
          <span className="text-xs text-zinc-600">/</span>
          <span className="text-xs font-medium text-zinc-200 truncate max-w-[160px]">
            {project?.name || 'Loading project...'}
          </span>
          {project?.template && (
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400">
              {project.template}
            </span>
          )}
        </div>
      </div>

      {/* Center: Execution Actions (Run / Stop / Save) */}
      <div className="flex items-center space-x-2">
        {isRunning ? (
          <button
            onClick={onStop}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-400 text-xs font-semibold transition-all shadow-sm active:scale-95"
            title="Stop Execution"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop</span>
          </button>
        ) : (
          <button
            onClick={onRun}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 text-xs font-semibold transition-all shadow-sm active:scale-95"
            title="Run Code (Ctrl + Enter)"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run</span>
          </button>
        )}

        {hasDirtyFiles && (
          <button
            onClick={onSaveAll}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-amber-500/30 text-xs font-medium transition-all"
            title="Save Unsaved Changes (Ctrl + S)"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Save</span>
          </button>
        )}
      </div>

      {/* Right: Panel Toggles & Preview */}
      <div className="flex items-center space-x-1.5">
        {isWebProject && (
          <button
            onClick={onTogglePreview}
            className={cn(
              'flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors',
              isPreviewOpen
                ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 border-zinc-700'
            )}
            title="Toggle Live Web Preview"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Preview</span>
          </button>
        )}

        <button
          onClick={onToggleSidebar}
          className={cn(
            'p-1.5 rounded-md border transition-colors',
            isSidebarOpen
              ? 'bg-zinc-800 text-zinc-200 border-zinc-700'
              : 'text-zinc-500 hover:text-zinc-300 border-transparent'
          )}
          title="Toggle Explorer Sidebar (Ctrl + B)"
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleBottomPanel}
          className={cn(
            'p-1.5 rounded-md border transition-colors',
            isBottomPanelOpen
              ? 'bg-zinc-800 text-zinc-200 border-zinc-700'
              : 'text-zinc-500 hover:text-zinc-300 border-transparent'
          )}
          title="Toggle Terminal / Output Panel (Ctrl + `)"
        >
          <PanelBottom className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
