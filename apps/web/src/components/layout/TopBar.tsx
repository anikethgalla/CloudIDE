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
  Youtube,
  EyeOff,
  Eye,
  BrainCircuit,
  FileText,
  Target,
  Sparkles,
  Layers,
  FolderOpen,
} from 'lucide-react';
import Link from 'next/link';
import { Project, ExecutionStatus, TutorialMetadata } from '@cloud-ide/shared';
import { ActiveRightTab } from '@/types';
import { cn } from '@/lib/utils';

interface TopBarProps {
  project: Project | null;
  tutorial: TutorialMetadata | null;
  executionStatus: ExecutionStatus;
  isSidebarOpen: boolean;
  isBottomPanelOpen: boolean;
  isRightPanelOpen: boolean;
  activeRightTab: ActiveRightTab;
  isBlindfoldEnabled: boolean;
  hasDirtyFiles: boolean;
  onToggleSidebar: () => void;
  onToggleBottomPanel: () => void;
  onToggleRightPanel: () => void;
  onSelectRightTab: (tab: ActiveRightTab) => void;
  onToggleBlindfold: () => void;
  onStartRebuild: () => void;
  onOpenImportModal: () => void;
  onRun: () => void;
  onStop: () => void;
  onSaveAll: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  project,
  tutorial,
  executionStatus,
  isSidebarOpen,
  isBottomPanelOpen,
  isRightPanelOpen,
  activeRightTab,
  isBlindfoldEnabled,
  hasDirtyFiles,
  onToggleSidebar,
  onToggleBottomPanel,
  onToggleRightPanel,
  onSelectRightTab,
  onToggleBlindfold,
  onStartRebuild,
  onOpenImportModal,
  onRun,
  onStop,
  onSaveAll,
}) => {
  const isRunning = executionStatus === 'RUNNING' || executionStatus === 'QUEUED';
  const isWebProject = project?.template === 'html' || project?.template === 'react' || project?.template === 'nextjs';
  const hasTutorial = !!tutorial || !!project?.tutorial;
  const isRebuildMode = !!tutorial?.rebuildMode;

  return (
    <header className="h-12 bg-ide-activity border-b border-ide-border flex items-center justify-between px-3 select-none z-30 font-sans">
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
            Project <span className="text-sky-400">Breakout</span>
          </span>
        </Link>

        <div className="h-4 w-[1px] bg-ide-border" />

        <div className="flex items-center space-x-2">
          <Link
            href="/"
            className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Workspaces</span>
          </Link>
          <span className="text-xs text-zinc-600">/</span>
          <span className="text-xs font-medium text-zinc-200 truncate max-w-[160px]">
            {project?.name || 'Loading workspace...'}
          </span>
          {hasTutorial && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center gap-1">
              <Youtube className="w-3 h-3" />
              <span>Tutorial</span>
            </span>
          )}
          {isRebuildMode && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Rebuild Mode</span>
            </span>
          )}
        </div>
      </div>

      {/* Center: Execution & Active Recall Controls */}
      <div className="flex items-center space-x-2">
        {/* Run / Stop Button */}
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

        {/* Blindfold Mode Toggle */}
        {hasTutorial && !isRebuildMode && (
          <button
            onClick={onToggleBlindfold}
            className={cn(
              'flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-all active:scale-95',
              isBlindfoldEnabled
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm ring-1 ring-amber-500/30'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200'
            )}
            title="Blindfold Mode restricts video access while you code to force active recall (Ctrl + Shift + B)"
          >
            {isBlindfoldEnabled ? (
              <EyeOff className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Eye className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">Blindfold Mode</span>
            <span
              className={cn(
                'w-2 h-2 rounded-full',
                isBlindfoldEnabled ? 'bg-amber-400 animate-pulse' : 'bg-zinc-600'
              )}
            />
          </button>
        )}

        {/* Rebuild From Memory Action */}
        {hasTutorial && !isRebuildMode && (
          <button
            onClick={onStartRebuild}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 text-xs font-semibold transition-all shadow-sm active:scale-95"
            title="Wipe tutorial access and generate functional specification to rebuild from memory"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Rebuild From Memory</span>
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

      {/* Right: Learning Hub Toggles & Layout Panes */}
      <div className="flex items-center space-x-1.5">
        {hasTutorial && !isRebuildMode && (
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 space-x-0.5 mr-1">
            <button
              onClick={() => {
                onSelectRightTab('tutorial');
                if (!isRightPanelOpen) onToggleRightPanel();
              }}
              className={cn(
                'px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1',
                activeRightTab === 'tutorial' && isRightPanelOpen
                  ? 'bg-rose-500/20 text-rose-300 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              )}
              title="YouTube Tutorial Video"
            >
              <Youtube className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Video</span>
            </button>

            <button
              onClick={() => {
                onSelectRightTab('transcript');
                if (!isRightPanelOpen) onToggleRightPanel();
              }}
              className={cn(
                'px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1',
                activeRightTab === 'transcript' && isRightPanelOpen
                  ? 'bg-sky-500/20 text-sky-300 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              )}
              title="Synchronized Transcript"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Transcript</span>
            </button>

            <button
              onClick={() => {
                onSelectRightTab('notes');
                if (!isRightPanelOpen) onToggleRightPanel();
              }}
              className={cn(
                'px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1',
                activeRightTab === 'notes' && isRightPanelOpen
                  ? 'bg-amber-500/20 text-amber-300 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              )}
              title="Timestamped Scratchpad (Ctrl + Shift + M)"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Notes</span>
            </button>

            <button
              onClick={() => {
                onSelectRightTab('ai');
                if (!isRightPanelOpen) onToggleRightPanel();
              }}
              className={cn(
                'px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1',
                activeRightTab === 'ai' && isRightPanelOpen
                  ? 'bg-purple-500/20 text-purple-300 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              )}
              title="Socratic AI Tutor (Ctrl + Shift + A)"
            >
              <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden xl:inline">AI Tutor</span>
            </button>

            <button
              onClick={() => {
                onSelectRightTab('checkpoints');
                if (!isRightPanelOpen) onToggleRightPanel();
              }}
              className={cn(
                'px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1',
                activeRightTab === 'checkpoints' && isRightPanelOpen
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              )}
              title="Learning Checkpoints & Challenges"
            >
              <Target className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Checkpoints</span>
            </button>
          </div>
        )}

        {isRebuildMode && (
          <button
            onClick={() => {
              onSelectRightTab('rebuild');
              if (!isRightPanelOpen) onToggleRightPanel();
            }}
            className={cn(
              'px-2.5 py-1.5 rounded-md text-xs font-semibold border flex items-center gap-1.5 transition-colors',
              activeRightTab === 'rebuild' && isRightPanelOpen
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200'
            )}
            title="Rebuild Specification"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Specification</span>
          </button>
        )}

        {isWebProject && (
          <button
            onClick={() => {
              onSelectRightTab('preview');
              if (!isRightPanelOpen) onToggleRightPanel();
            }}
            className={cn(
              'flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors',
              activeRightTab === 'preview' && isRightPanelOpen
                ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 border-zinc-700'
            )}
            title="Live Web Preview"
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
