'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Project,
  FileNode,
  EditorTab,
  ExecutionStatus,
  ProblemMarker,
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
import { ShortcutsModal } from '@/components/modal/ShortcutsModal';
import { ActiveSidePanel, ActiveBottomTab } from '@/types';
import { Terminal, Bug, Play, Globe, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function IDEPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  // State: Project & Files
  const [project, setProject] = useState<Project | null>(null);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State: Editor & Tabs
  const [tabs, setTabs] = useState<EditorTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });

  // State: Layout & Panels
  const [activeSidePanel, setActiveSidePanel] = useState<ActiveSidePanel | null>('explorer');
  const [activeBottomTab, setActiveBottomTab] = useState<ActiveBottomTab>('terminal');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isBottomPanelOpen, setIsBottomPanelOpen] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(240);
  const [previewWidth, setPreviewWidth] = useState(500);

  // State: Modals
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // State: Terminal & Execution
  const [isTerminalConnected, setIsTerminalConnected] = useState(false);
  const [executionStatus, setExecutionStatus] = useState<ExecutionStatus>('STOPPED');
  const [executionOutput, setExecutionOutput] = useState('');
  const [problems, setProblems] = useState<ProblemMarker[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [htmlStaticContent, setHtmlStaticContent] = useState<string>('');

  const execSocketRef = useRef<WebSocket | null>(null);

  // Load project & files on mount
  const loadProjectData = useCallback(async () => {
    try {
      setIsLoading(true);
      const proj = await ApiClient.getProject(projectId);
      setProject(proj);

      const files = await ApiClient.getFiles(projectId);
      setFileTree(files);

      // If project has default entry file, open it
      if (proj.entryFile) {
        openFileByPath(proj.entryFile, files);
      } else if (files.length > 0) {
        // Find first file
        const firstFile = findFirstFile(files);
        if (firstFile) {
          openFileNode(firstFile);
        }
      }
    } catch (err: any) {
      console.error('Failed to load project:', err);
      alert('Error loading project: ' + err.message);
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

      // If HTML file, update static preview content
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
      // Find matching CSS / JS files in same directory to bundle inline for instant live preview
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

  const handleEditorChange = (newContent: string) => {
    if (!activeTabId) return;

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

      // If web project or HTML file, update preview immediately
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

    // Update open tabs
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

    // Close any tabs for deleted files
    setTabs((prev) => prev.filter((t) => !t.filePath.startsWith(targetPath)));
  };

  // Execution Handlers
  const handleRun = async () => {
    // Save all dirty files first
    await handleSaveAll();

    const activeTab = tabs.find((t) => t.id === activeTabId);
    const entryFile = activeTab?.filePath || project?.entryFile;

    // For HTML projects, open preview
    if (project?.template === 'html' || entryFile?.endsWith('.html')) {
      setIsPreviewOpen(true);
      if (activeTab) {
        updateStaticHtmlPreview(activeTab.content, activeTab.filePath);
      }
      return;
    }

    // Switch to output panel
    setIsBottomPanelOpen(true);
    setActiveBottomTab('output');
    setExecutionStatus('RUNNING');
    setExecutionOutput('🚀 Launching execution in isolated Docker sandbox...\n');

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
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tabs, activeTabId, project]);

  const activeTab = tabs.find((t) => t.id === activeTabId) || null;
  const hasDirtyFiles = tabs.some((t) => t.isDirty);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-ide-bg text-zinc-400">
        <Loader2 className="w-8 h-8 animate-spin text-sky-400 mb-3" />
        <p className="text-sm font-medium">Opening Cloud IDE Workspace...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-ide-bg overflow-hidden text-zinc-200">
      {/* 1. Top Navigation Bar */}
      <TopBar
        project={project}
        executionStatus={executionStatus}
        isSidebarOpen={isSidebarOpen}
        isBottomPanelOpen={isBottomPanelOpen}
        isPreviewOpen={isPreviewOpen}
        hasDirtyFiles={hasDirtyFiles}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onToggleBottomPanel={() => setIsBottomPanelOpen((prev) => !prev)}
        onTogglePreview={() => setIsPreviewOpen((prev) => !prev)}
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
          onOpenSettings={() => alert('IDE Settings: Dark VS Code theme active')}
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
                <h4 className="font-semibold text-zinc-200 mb-2">Search in Project</h4>
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

          {/* Bottom Panel (Terminal / Output / Problems / Preview Tab) */}
          {isBottomPanelOpen && (
            <div
              className="bg-ide-panel border-t border-ide-border flex flex-col shrink-0 overflow-hidden"
              style={{ height: `${bottomPanelHeight}px` }}
            >
              {/* Bottom Panel Tabs */}
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

              {/* Bottom Tab Contents */}
              <div className="flex-1 overflow-hidden">
                {activeBottomTab === 'terminal' && (
                  <XTermTerminal
                    projectId={projectId}
                    onConnectionChange={setIsTerminalConnected}
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
                    No syntax or build errors detected in workspace.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Split: Live Web Preview */}
        {isPreviewOpen && (
          <div
            className="h-full shrink-0 relative overflow-hidden"
            style={{ width: `${previewWidth}px` }}
          >
            <WebPreview
              projectId={projectId}
              previewUrl={previewUrl}
              htmlContent={htmlStaticContent}
            />
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
        onOpenTerminal={() => {
          setIsBottomPanelOpen(true);
          setActiveBottomTab('terminal');
        }}
        onOpenPreview={() => setIsPreviewOpen(true)}
      />

      {/* Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
