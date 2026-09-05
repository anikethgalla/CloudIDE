'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Project,
  FileNode,
  EditorTab,
  ExecutionStatus,
  ProblemMarker,
  TutorialMetadata,
  LearningCheckpoint,
  RebuildSpecification,
  DetectedProjectType,
} from '@cloud-ide/shared';
import { ApiClient } from '@/services/api';
import { getLanguageFromFilename } from '@/lib/fileIcons';
import { TopBar } from '@/components/layout/TopBar';
import { ActivityBar } from '@/components/layout/ActivityBar';
import { StatusBar } from '@/components/layout/StatusBar';
import { FileTree } from '@/components/explorer/FileTree';
import { EditorTabs } from '@/components/editor/EditorTabs';
import { MonacoEditorPane } from '@/components/editor/MonacoEditorPane';
import { XTermTerminal } from '@/components/terminal/XTermTerminal';
import { OutputPanel } from '@/components/output/OutputPanel';
import { WebPreview } from '@/components/preview/WebPreview';
import { PortsPanel } from '@/components/workspace/PortsPanel';
import { EnvironmentModal } from '@/components/workspace/EnvironmentModal';
import { DiagnosticsModal } from '@/components/workspace/DiagnosticsModal';
import { YouTubePlayer } from '@/components/tutorial/YouTubePlayer';
import { TranscriptPanel } from '@/components/tutorial/TranscriptPanel';
import { NotesPanel } from '@/components/tutorial/NotesPanel';
import { SocraticAIPanel } from '@/components/tutorial/SocraticAIPanel';
import { CheckpointsList } from '@/components/tutorial/CheckpointsList';
import { RebuildSpecView } from '@/components/tutorial/RebuildSpecView';
import { ShortcutsModal } from '@/components/modal/ShortcutsModal';
import { ImportTutorialModal } from '@/components/modal/ImportTutorialModal';
import { ActiveSidePanel, ActiveBottomTab, ActiveRightTab } from '@/types';
import { Terminal, Bug, Play, Globe, Loader2, Youtube, BrainCircuit, FileText, Target, Sparkles, Network } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function IDEPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  // State: Project & Tutorial
  const [project, setProject] = useState<Project | null>(null);
  const [tutorial, setTutorial] = useState<TutorialMetadata | null>(null);
  const [detectedProject, setDetectedProject] = useState<DetectedProjectType | null>(null);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State: Editor & Tabs
  const [tabs, setTabs] = useState<EditorTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });

  // State: Video & Blindfold Mode
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const [isBlindfoldEnabled, setIsBlindfoldEnabled] = useState(true);
  const [isActivelyTyping, setIsActivelyTyping] = useState(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // State: Layout & Panels
  const [activeSidePanel, setActiveSidePanel] = useState<ActiveSidePanel | null>('explorer');
  const [activeBottomTab, setActiveBottomTab] = useState<ActiveBottomTab>('terminal');
  const [activeRightTab, setActiveRightTab] = useState<ActiveRightTab>('tutorial');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isBottomPanelOpen, setIsBottomPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(230);
  const [rightPanelWidth, setRightPanelWidth] = useState(480);

  // State: Modals
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEnvModalOpen, setIsEnvModalOpen] = useState(false);
  const [isDiagnosticsModalOpen, setIsDiagnosticsModalOpen] = useState(false);

  // State: Terminal & Execution
  const [isTerminalConnected, setIsTerminalConnected] = useState(false);
  const [executionStatus, setExecutionStatus] = useState<ExecutionStatus>('STOPPED');
  const [executionOutput, setExecutionOutput] = useState('');
  const [problems, setProblems] = useState<ProblemMarker[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [htmlStaticContent, setHtmlStaticContent] = useState<string>('');

  const execSocketRef = useRef<WebSocket | null>(null);

  // Load project & tutorial metadata
  const loadProjectData = useCallback(async () => {
    try {
      setIsLoading(true);
      const proj = await ApiClient.getProject(projectId);
      setProject(proj);

      // Load tutorial if this is a tutorial workspace
      try {
        const tut = await ApiClient.getTutorial(projectId);
        if (tut) {
          setTutorial(tut);
          if (tut.rebuildMode) {
            setActiveRightTab('rebuild');
          } else {
            setActiveRightTab('tutorial');
          }
          setIsRightPanelOpen(true);
        }
      } catch (_) {
        // Not a tutorial workspace
      }

      const files = await ApiClient.getFiles(projectId);
      setFileTree(files);

      // Detect project type & framework
      ApiClient.detectProject(projectId).then(setDetectedProject).catch(() => {});

      if (proj.entryFile) {
        openFileByPath(proj.entryFile, files);
      } else if (files.length > 0) {
        const firstFile = findFirstFile(files);
        if (firstFile) openFileNode(firstFile);
      }
    } catch (err: any) {
      console.error('Failed to load project:', err);
      alert('Error loading workspace: ' + err.message);
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      loadProjectData();
    }
  }, [projectId, loadProjectData]);

  const findFirstFile = (nodes: FileNode[]): FileNode | null => {
    for (const node of nodes) {
      if (node.type === 'file') return node;
      if (node.children) {
        const found = findFirstFile(node.children);
        if (found) return found;
      }
    }
    return null;
  };

  const openFileByPath = async (filePath: string, tree = fileTree) => {
    const existingTab = tabs.find((t) => t.filePath === filePath);
    if (existingTab) {
      setActiveTabId(existingTab.id);
      return;
    }

    try {
      const res = await ApiClient.getFileContent(projectId, filePath);
      const name = filePath.split('/').pop() || filePath;
      const language = getLanguageFromFilename(name);

      const newTab: EditorTab = {
        id: filePath,
        filePath,
        name,
        language,
        isDirty: false,
        content: res.content,
        originalContent: res.content,
      };

      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(newTab.id);

      if (language === 'html' || filePath.endsWith('.html')) {
        updateStaticHtmlPreview(res.content, filePath);
      }
    } catch (err) {
      console.error('Error reading file:', err);
    }
  };

  const openFileNode = async (node: FileNode) => {
    if (node.type === 'directory') return;
    await openFileByPath(node.path);
  };

  const updateStaticHtmlPreview = async (html: string, currentPath: string) => {
    try {
      let combinedHtml = html;
      try {
        const cssFile = await ApiClient.getFileContent(projectId, 'style.css').catch(() => null);
        const jsFile = await ApiClient.getFileContent(projectId, 'script.js').catch(() => null);

        if (cssFile) {
          combinedHtml = combinedHtml.replace(
            /<link\s+rel=["']stylesheet["']\s+href=["']style\.css["']\s*\/?>/i,
            `<style>${cssFile.content}</style>`
          );
        }
        if (jsFile) {
          combinedHtml = combinedHtml.replace(
            /<script\s+src=["']script\.js["']\s*><\/script>/i,
            `<script>${jsFile.content}</script>`
          );
        }
      } catch (_) {}

      setHtmlStaticContent(combinedHtml);
    } catch (err) {
      console.error('Error generating preview:', err);
    }
  };

  // Monaco Editor Change Handler & Blindfold State Machine
  const handleEditorChange = (newContent: string) => {
    if (!activeTabId) return;

    // Trigger Blindfold typing detection
    if (isBlindfoldEnabled && tutorial && !tutorial.rebuildMode) {
      setIsActivelyTyping(true);

      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }

      // Reset typing status after 3.5s of no keypresses
      typingTimerRef.current = setTimeout(() => {
        setIsActivelyTyping(false);
      }, 3500);
    }

    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id === activeTabId) {
          return {
            ...tab,
            content: newContent,
            isDirty: newContent !== tab.originalContent,
          };
        }
        return tab;
      })
    );
  };

  const handleSaveTab = async (tabToSave?: EditorTab) => {
    const target = tabToSave || tabs.find((t) => t.id === activeTabId);
    if (!target) return;

    try {
      await ApiClient.saveFile(projectId, target.filePath, target.content);
      setTabs((prev) =>
        prev.map((tab) =>
          tab.id === target.id
            ? { ...tab, isDirty: false, originalContent: target.content }
            : tab
        )
      );

      if (target.language === 'html' || target.name.endsWith('.html')) {
        updateStaticHtmlPreview(target.content, target.filePath);
      }
    } catch (err: any) {
      alert('Error saving file: ' + err.message);
    }
  };

  const handleSaveAll = async () => {
    const dirtyTabs = tabs.filter((t) => t.isDirty);
    for (const tab of dirtyTabs) {
      await handleSaveTab(tab);
    }
  };

  const handleCloseTab = (tabId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const tabToClose = tabs.find((t) => t.id === tabId);
    if (tabToClose?.isDirty) {
      if (!confirm(`Save changes to ${tabToClose.name} before closing?`)) {
        return;
      }
    }

    const nextTabs = tabs.filter((t) => t.id !== tabId);
    setTabs(nextTabs);

    if (activeTabId === tabId) {
      setActiveTabId(nextTabs.length > 0 ? nextTabs[nextTabs.length - 1].id : null);
    }
  };

  // Explorer File Actions
  const handleCreateFile = async (parentPath: string, fileName: string) => {
    const fullPath = parentPath ? `${parentPath}/${fileName}` : fileName;
    await ApiClient.createFile(projectId, fullPath);
    const updated = await ApiClient.getFiles(projectId);
    setFileTree(updated);
    await openFileByPath(fullPath);
  };

  const handleCreateFolder = async (parentPath: string, folderName: string) => {
    const fullPath = parentPath ? `${parentPath}/${folderName}` : folderName;
    await ApiClient.createDirectory(projectId, fullPath);
    const updated = await ApiClient.getFiles(projectId);
    setFileTree(updated);
  };

  const handleRename = async (oldPath: string, newPath: string) => {
    await ApiClient.renamePath(projectId, oldPath, newPath);
    const updated = await ApiClient.getFiles(projectId);
    setFileTree(updated);

    setTabs((prev) =>
      prev.map((t) => {
        if (t.filePath === oldPath) {
          return {
            ...t,
            id: newPath,
            filePath: newPath,
            name: newPath.split('/').pop() || newPath,
          };
        }
        return t;
      })
    );
  };

  const handleDeletePath = async (targetPath: string) => {
    if (!confirm(`Are you sure you want to delete ${targetPath}?`)) return;
    await ApiClient.deletePath(projectId, targetPath);
    const updated = await ApiClient.getFiles(projectId);
    setFileTree(updated);
    setTabs((prev) => prev.filter((t) => !t.filePath.startsWith(targetPath)));
  };

  // Execution Handlers
  const handleRun = async () => {
    await handleSaveAll();

    const activeTab = tabs.find((t) => t.id === activeTabId);
    const entryFile = activeTab?.filePath || project?.entryFile;

    if (project?.template === 'html' || entryFile?.endsWith('.html')) {
      setActiveRightTab('preview');
      setIsRightPanelOpen(true);
      if (activeTab) {
        updateStaticHtmlPreview(activeTab.content, activeTab.filePath);
      }
      return;
    }

    setIsBottomPanelOpen(true);
    setActiveBottomTab('output');
    setExecutionStatus('RUNNING');
    setExecutionOutput('🚀 Running execution in isolated environment...\n');

    try {
      const { executionId } = await ApiClient.runCode(projectId, entryFile);
      connectExecutionSocket(executionId);
    } catch (err: any) {
      setExecutionStatus('FAILED');
      setExecutionOutput((prev) => prev + `\n❌ Failed to run: ${err.message}\n`);
    }
  };

  const connectExecutionSocket = (executionId: string) => {
    if (execSocketRef.current) {
      execSocketRef.current.close();
    }

    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000'}/ws/execute?executionId=${executionId}`;
    const ws = new WebSocket(wsUrl);
    execSocketRef.current = ws;

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'stdout' || msg.type === 'stderr' || msg.type === 'system') {
          setExecutionOutput((prev) => prev + msg.data);
        } else if (msg.type === 'status') {
          setExecutionStatus(msg.status);
        }
      } catch (_) {
        setExecutionOutput((prev) => prev + e.data);
      }
    };

    ws.onclose = () => {
      setExecutionStatus((prev) => (prev === 'RUNNING' ? 'SUCCESS' : prev));
    };
  };

  const handleStop = async () => {
    try {
      await ApiClient.stopExecution(projectId);
      setExecutionStatus('STOPPED');
      setExecutionOutput((prev) => prev + '\n🛑 Execution stopped by user.\n');
    } catch (err: any) {
      console.error('Error stopping execution:', err);
    }
  };

  // Checkpoints toggle
  const handleToggleCheckpoint = async (checkpointId: string, completed: boolean) => {
    await ApiClient.completeCheckpoint(projectId, checkpointId, completed);
    if (tutorial) {
      setTutorial({
        ...tutorial,
        checkpoints: tutorial.checkpoints.map((c) =>
          c.id === checkpointId ? { ...c, completed } : c
        ),
      });
    }
  };

  // Rebuild from Memory Trigger
  const handleStartRebuild = async () => {
    if (
      !confirm(
        'Ready to Rebuild From Memory?\n\nThis will hide the tutorial video and transcript, generate functional requirements specifications, and test your independent implementation capability.'
      )
    ) {
      return;
    }

    try {
      const res = await ApiClient.startRebuild(projectId);
      if (tutorial) {
        setTutorial({
          ...tutorial,
          rebuildMode: true,
          rebuildSpec: res.spec,
        });
      }
      setActiveRightTab('rebuild');
      setIsRightPanelOpen(true);
    } catch (err: any) {
      alert('Error initiating rebuild mode: ' + err.message);
    }
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveAll();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        setIsBottomPanelOpen((prev) => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b' && !e.shiftKey) {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      }
      // Project Breakout shortcuts:
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsBlindfoldEnabled((prev) => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setActiveRightTab('ai');
        setIsRightPanelOpen(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setActiveRightTab('notes');
        setIsRightPanelOpen(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleStartRebuild();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tabs, activeTabId, project, isBlindfoldEnabled, tutorial]);

  const activeTab = tabs.find((t) => t.id === activeTabId) || null;
  const hasDirtyFiles = tabs.some((t) => t.isDirty);
  const isBlindfoldedNow = isBlindfoldEnabled && isActivelyTyping && !!tutorial && !tutorial.rebuildMode;

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-ide-bg text-zinc-400 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-sky-400 mb-3" />
        <p className="text-sm font-medium">Opening Project Breakout Workspace...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-ide-bg overflow-hidden text-zinc-200 font-sans">
      {/* 1. Top Navigation Bar */}
      <TopBar
        project={project}
        tutorial={tutorial}
        detectedProject={detectedProject}
        executionStatus={executionStatus}
        isSidebarOpen={isSidebarOpen}
        isBottomPanelOpen={isBottomPanelOpen}
        isRightPanelOpen={isRightPanelOpen}
        activeRightTab={activeRightTab}
        isBlindfoldEnabled={isBlindfoldEnabled}
        hasDirtyFiles={hasDirtyFiles}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onToggleBottomPanel={() => setIsBottomPanelOpen((prev) => !prev)}
        onToggleRightPanel={() => setIsRightPanelOpen((prev) => !prev)}
        onSelectRightTab={setActiveRightTab}
        onToggleBlindfold={() => setIsBlindfoldEnabled(!isBlindfoldEnabled)}
        onStartRebuild={handleStartRebuild}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onOpenEnvModal={() => setIsEnvModalOpen(true)}
        onOpenDiagnostics={() => setIsDiagnosticsModalOpen(true)}
        onRun={handleRun}
        onStop={handleStop}
        onSaveAll={handleSaveAll}
      />

      {/* 2. Main Middle Workspace Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Leftmost Activity Bar */}
        <ActivityBar
          activePanel={activeSidePanel}
          onSelectPanel={(panel) => {
            if (activeSidePanel === panel && isSidebarOpen) {
              setIsSidebarOpen(false);
            } else {
              setActiveSidePanel(panel);
              setIsSidebarOpen(true);
            }
          }}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
          onOpenSettings={() => alert('Project Breakout: Socratic Active Learning Active')}
        />

        {/* Collapsible Sidebar (File Explorer / Search) */}
        {isSidebarOpen && (
          <div
            className="h-full shrink-0 relative"
            style={{ width: `${sidebarWidth}px` }}
          >
            {activeSidePanel === 'explorer' && (
              <FileTree
                project={project}
                files={fileTree}
                activeFilePath={activeTab?.filePath || null}
                onOpenFile={openFileNode}
                onCreateFile={handleCreateFile}
                onCreateFolder={handleCreateFolder}
                onRename={handleRename}
                onDelete={handleDeletePath}
                onRefresh={async () => {
                  const updated = await ApiClient.getFiles(projectId);
                  setFileTree(updated);
                }}
              />
            )}
            {activeSidePanel === 'search' && (
              <div className="p-3 text-xs text-zinc-400">
                <h4 className="font-semibold text-zinc-200 mb-2">Search in Workspace</h4>
                <input
                  type="text"
                  placeholder="Search filename or pattern..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1 text-xs text-zinc-100 outline-none focus:border-sky-500"
                />
              </div>
            )}
          </div>
        )}

        {/* Center: Editor & Bottom Panel Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Editor Area */}
          <div className="flex-1 flex flex-col min-h-0 bg-ide-editor overflow-hidden">
            <EditorTabs
              tabs={tabs}
              activeTabId={activeTabId}
              onSelectTab={setActiveTabId}
              onCloseTab={handleCloseTab}
            />

            <div className="flex-1 overflow-hidden">
              <MonacoEditorPane
                activeTab={activeTab}
                onChangeContent={handleEditorChange}
                onSave={() => handleSaveTab()}
                onRun={handleRun}
                onCursorChange={setCursorPosition}
              />
            </div>
          </div>

          {/* Bottom Panel (Terminal / Output / Problems) */}
          {isBottomPanelOpen && (
            <div
              className="bg-ide-panel border-t border-ide-border flex flex-col shrink-0 overflow-hidden"
              style={{ height: `${bottomPanelHeight}px` }}
            >
              <div className="h-8 bg-ide-activity border-b border-ide-border flex items-center px-2 space-x-1 select-none shrink-0">
                <button
                  onClick={() => setActiveBottomTab('terminal')}
                  className={cn(
                    'flex items-center space-x-1.5 px-3 py-1 rounded-sm text-xs font-medium transition-colors',
                    activeBottomTab === 'terminal'
                      ? 'text-zinc-100 bg-zinc-800/80'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  )}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Terminal</span>
                </button>

                <button
                  onClick={() => setActiveBottomTab('ports')}
                  className={cn(
                    'flex items-center space-x-1.5 px-3 py-1 rounded-sm text-xs font-medium transition-colors',
                    activeBottomTab === 'ports'
                      ? 'text-zinc-100 bg-zinc-800/80'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  )}
                >
                  <Network className="w-3.5 h-3.5" />
                  <span>Ports</span>
                </button>

                <button
                  onClick={() => setActiveBottomTab('output')}
                  className={cn(
                    'flex items-center space-x-1.5 px-3 py-1 rounded-sm text-xs font-medium transition-colors',
                    activeBottomTab === 'output'
                      ? 'text-zinc-100 bg-zinc-800/80'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  )}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Output</span>
                </button>

                <button
                  onClick={() => setActiveBottomTab('problems')}
                  className={cn(
                    'flex items-center space-x-1.5 px-3 py-1 rounded-sm text-xs font-medium transition-colors',
                    activeBottomTab === 'problems'
                      ? 'text-zinc-100 bg-zinc-800/80'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  )}
                >
                  <Bug className="w-3.5 h-3.5" />
                  <span>Problems ({problems.length})</span>
                </button>
              </div>

              <div className="flex-1 overflow-hidden">
                {activeBottomTab === 'terminal' && (
                  <XTermTerminal
                    projectId={projectId}
                    onConnectionChange={setIsTerminalConnected}
                  />
                )}
                {activeBottomTab === 'ports' && (
                  <PortsPanel
                    projectId={projectId}
                    onOpenPreview={(port) => {
                      const url = `http://localhost:4000/api/proxy/${projectId}/${port}/`;
                      setPreviewUrl(url);
                      setActiveRightTab('preview');
                      setIsRightPanelOpen(true);
                    }}
                  />
                )}
                {activeBottomTab === 'output' && (
                  <OutputPanel
                    output={executionOutput}
                    status={executionStatus}
                    onClear={() => setExecutionOutput('')}
                  />
                )}
                {activeBottomTab === 'problems' && (
                  <div className="p-4 text-xs text-zinc-500">
                    No compilation or runtime errors detected in project.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Split Panel: Tutorial / Transcript / AI Tutor / Notes / Preview / Rebuild */}
        {isRightPanelOpen && (
          <div
            className="h-full shrink-0 relative flex flex-col bg-zinc-950 border-l border-ide-border overflow-hidden"
            style={{ width: `${rightPanelWidth}px` }}
          >
            {/* If tutorial is present and not rebuild mode, show player at top of right panel */}
            {tutorial && !tutorial.rebuildMode && activeRightTab !== 'preview' && (
              <YouTubePlayer
                videoId={tutorial.videoId}
                currentTime={currentVideoTime}
                onTimeUpdate={setCurrentVideoTime}
                isBlindfolded={isBlindfoldedNow}
              />
            )}

            {/* Right Pane Tab Body */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {activeRightTab === 'tutorial' && tutorial && !tutorial.rebuildMode && (
                <TranscriptPanel
                  segments={tutorial.transcript || []}
                  currentTime={currentVideoTime}
                  onSeek={(s) => setCurrentVideoTime(s)}
                />
              )}

              {activeRightTab === 'transcript' && tutorial && (
                <TranscriptPanel
                  segments={tutorial.transcript || []}
                  currentTime={currentVideoTime}
                  onSeek={(s) => setCurrentVideoTime(s)}
                />
              )}

              {activeRightTab === 'notes' && (
                <NotesPanel
                  projectId={projectId}
                  currentTime={currentVideoTime}
                  onSeek={(s) => setCurrentVideoTime(s)}
                />
              )}

              {activeRightTab === 'ai' && (
                <SocraticAIPanel
                  projectId={projectId}
                  currentTime={currentVideoTime}
                  activeFilePath={activeTab?.filePath}
                  activeFileContent={activeTab?.content}
                  recentTerminalOutput={executionOutput}
                  onSeek={(s) => setCurrentVideoTime(s)}
                />
              )}

              {activeRightTab === 'checkpoints' && tutorial && (
                <CheckpointsList
                  projectId={projectId}
                  checkpoints={tutorial.checkpoints || []}
                  currentTime={currentVideoTime}
                  onSeek={(s) => setCurrentVideoTime(s)}
                  onToggleComplete={handleToggleCheckpoint}
                />
              )}

              {activeRightTab === 'rebuild' && tutorial?.rebuildSpec && (
                <RebuildSpecView specification={tutorial.rebuildSpec} />
              )}

              {activeRightTab === 'preview' && (
                <WebPreview
                  projectId={projectId}
                  previewUrl={previewUrl}
                  htmlContent={htmlStaticContent}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. Bottom Status Bar */}
      <StatusBar
        language={activeTab?.language || project?.language || 'plaintext'}
        cursorPosition={cursorPosition}
        executionStatus={executionStatus}
        previewUrl={previewUrl}
        isTerminalConnected={isTerminalConnected}
        isBlindfoldActive={isBlindfoldedNow}
        videoTimestamp={tutorial ? currentVideoTime : undefined}
        isRebuildMode={tutorial?.rebuildMode}
        onOpenTerminal={() => {
          setIsBottomPanelOpen(true);
          setActiveBottomTab('terminal');
        }}
        onOpenPreview={() => {
          setActiveRightTab('preview');
          setIsRightPanelOpen(true);
        }}
      />

      {/* Shortcuts & Import Modals */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <ImportTutorialModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={async (payload) => {
          const newProj = await ApiClient.importTutorial(payload);
          router.push(`/ide/${newProj.id}`);
        }}
      />

      <EnvironmentModal
        isOpen={isEnvModalOpen}
        onClose={() => setIsEnvModalOpen(false)}
        projectId={projectId}
      />

      <DiagnosticsModal
        isOpen={isDiagnosticsModalOpen}
        onClose={() => setIsDiagnosticsModalOpen(false)}
      />
    </div>
  );
}
