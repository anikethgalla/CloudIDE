'use client';

import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  FilePlus,
  FolderPlus,
  RotateCw,
  FolderTree,
  Check,
  X,
  Plus,
} from 'lucide-react';
import { FileNode, Project } from '@cloud-ide/shared';
import { getFileIcon } from '@/lib/fileIcons';
import { ContextMenu } from './ContextMenu';
import { cn } from '@/lib/utils';

interface FileTreeProps {
  project: Project | null;
  files: FileNode[];
  activeFilePath: string | null;
  onOpenFile: (file: FileNode) => void;
  onCreateFile: (parentPath: string, fileName: string) => Promise<void>;
  onCreateFolder: (parentPath: string, folderName: string) => Promise<void>;
  onRename: (oldPath: string, newPath: string) => Promise<void>;
  onDelete: (path: string) => Promise<void>;
  onRefresh: () => void;
}

export const FileTree: React.FC<FileTreeProps> = ({
  project,
  files,
  activeFilePath,
  onOpenFile,
  onCreateFile,
  onCreateFolder,
  onRename,
  onDelete,
  onRefresh,
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    '': true,
    src: true,
    app: true,
  });
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    target: FileNode | null;
  } | null>(null);

  // Inline creation / renaming state
  const [creationState, setCreationState] = useState<{
    parentPath: string;
    type: 'file' | 'folder';
  } | null>(null);
  const [creationName, setCreationName] = useState('');

  const [renamingNode, setRenamingNode] = useState<FileNode | null>(null);
  const [renamingValue, setRenamingValue] = useState('');

  const toggleFolder = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolders((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const handleContextMenu = (e: React.MouseEvent, node: FileNode | null) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      target: node,
    });
  };

  const handleStartCreation = (parentPath: string, type: 'file' | 'folder') => {
    if (parentPath && !expandedFolders[parentPath]) {
      setExpandedFolders((prev) => ({ ...prev, [parentPath]: true }));
    }
    setCreationState({ parentPath, type });
    setCreationName('');
  };

  const handleCommitCreation = async () => {
    if (!creationState || !creationName.trim()) {
      setCreationState(null);
      return;
    }

    try {
      if (creationState.type === 'file') {
        await onCreateFile(creationState.parentPath, creationName.trim());
      } else {
        await onCreateFolder(creationState.parentPath, creationName.trim());
      }
    } finally {
      setCreationState(null);
      setCreationName('');
    }
  };

  const handleStartRename = (node: FileNode) => {
    setRenamingNode(node);
    setRenamingValue(node.name);
  };

  const handleCommitRename = async () => {
    if (!renamingNode || !renamingValue.trim() || renamingValue === renamingNode.name) {
      setRenamingNode(null);
      return;
    }

    const segments = renamingNode.path.split('/');
    segments[segments.length - 1] = renamingValue.trim();
    const newPath = segments.join('/');

    try {
      await onRename(renamingNode.path, newPath);
    } finally {
      setRenamingNode(null);
    }
  };

  const renderNode = (node: FileNode, depth = 0) => {
    const isFolder = node.type === 'directory';
    const isExpanded = !!expandedFolders[node.path];
    const isActive = activeFilePath === node.path;
    const isBeingRenamed = renamingNode?.path === node.path;

    return (
      <div key={node.path} className="select-none">
        <div
          onClick={(e) => {
            if (isFolder) {
              toggleFolder(node.path, e);
            } else {
              onOpenFile(node);
            }
          }}
          onContextMenu={(e) => handleContextMenu(e, node)}
          className={cn(
            'group flex items-center h-7 px-2 cursor-pointer transition-colors text-xs rounded-sm mx-1',
            isActive && !isFolder
              ? 'bg-sky-500/15 text-sky-300 font-medium'
              : 'text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-100'
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {/* Chevron for folder */}
          {isFolder ? (
            <span
              onClick={(e) => toggleFolder(node.path, e)}
              className="mr-1 text-zinc-500 hover:text-zinc-300 p-0.5 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </span>
          ) : (
            <span className="w-4 mr-0.5" />
          )}

          {/* Icon */}
          <span className="mr-1.5">
            {getFileIcon(node.name, isFolder, isExpanded)}
          </span>

          {/* Label or Inline Rename Input */}
          {isBeingRenamed ? (
            <div className="flex items-center space-x-1 flex-1">
              <input
                autoFocus
                type="text"
                value={renamingValue}
                onChange={(e) => setRenamingValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCommitRename();
                  if (e.key === 'Escape') setRenamingNode(null);
                }}
                onBlur={handleCommitRename}
                className="bg-zinc-900 border border-sky-500 rounded px-1.5 py-0.5 text-xs text-zinc-100 w-full outline-none"
              />
            </div>
          ) : (
            <span className="truncate flex-1">{node.name}</span>
          )}
        </div>

        {/* Child items if directory is expanded */}
        {isFolder && isExpanded && (
          <div>
            {/* Inline creation form if inside this folder */}
            {creationState && creationState.parentPath === node.path && (
              <div
                className="flex items-center h-7 px-2 mx-1 my-0.5"
                style={{ paddingLeft: `${(depth + 1) * 12 + 8}px` }}
              >
                <span className="mr-1.5">
                  {getFileIcon(
                    creationName || 'temp',
                    creationState.type === 'folder',
                    false
                  )}
                </span>
                <input
                  autoFocus
                  type="text"
                  placeholder={
                    creationState.type === 'file' ? 'filename.ts' : 'folder-name'
                  }
                  value={creationName}
                  onChange={(e) => setCreationName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCommitCreation();
                    if (e.key === 'Escape') setCreationState(null);
                  }}
                  onBlur={handleCommitCreation}
                  className="bg-zinc-900 border border-sky-500 rounded px-1.5 py-0.5 text-xs text-zinc-100 w-full outline-none font-mono"
                />
              </div>
            )}

            {node.children && node.children.length > 0
              ? node.children
                  .sort((a, b) => {
                    // Folders first, then alphabetical
                    if (a.type === 'directory' && b.type !== 'directory') return -1;
                    if (a.type !== 'directory' && b.type === 'directory') return 1;
                    return a.name.localeCompare(b.name);
                  })
                  .map((child) => renderNode(child, depth + 1))
              : !creationState && (
                  <div
                    className="text-[11px] text-zinc-600 italic py-1"
                    style={{ paddingLeft: `${(depth + 1) * 12 + 16}px` }}
                  >
                    Empty folder
                  </div>
                )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="h-full flex flex-col bg-ide-sidebar border-r border-ide-border select-none overflow-hidden"
      onContextMenu={(e) => handleContextMenu(e, null)}
    >
      {/* Explorer Header */}
      <div className="h-9 px-3 flex items-center justify-between border-b border-ide-border text-xs font-semibold uppercase tracking-wider text-zinc-400 bg-ide-sidebar">
        <span className="truncate">{project?.name || 'Explorer'}</span>

        <div className="flex items-center space-x-1 text-zinc-400">
          <button
            onClick={() => handleStartCreation('', 'file')}
            className="p-1 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"
            title="New File"
          >
            <FilePlus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleStartCreation('', 'folder')}
            className="p-1 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"
            title="New Folder"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRefresh}
            className="p-1 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"
            title="Refresh Files"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto py-1 custom-scrollbar">
        {/* Inline creation at root */}
        {creationState && creationState.parentPath === '' && (
          <div className="flex items-center h-7 px-2 mx-1 my-0.5">
            <span className="mr-1.5">
              {getFileIcon(
                creationName || 'temp',
                creationState.type === 'folder',
                false
              )}
            </span>
            <input
              autoFocus
              type="text"
              placeholder={
                creationState.type === 'file' ? 'filename.ts' : 'folder-name'
              }
              value={creationName}
              onChange={(e) => setCreationName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCommitCreation();
                if (e.key === 'Escape') setCreationState(null);
              }}
              onBlur={handleCommitCreation}
              className="bg-zinc-900 border border-sky-500 rounded px-1.5 py-0.5 text-xs text-zinc-100 w-full outline-none font-mono"
            />
          </div>
        )}

        {files.length > 0 ? (
          files
            .sort((a, b) => {
              if (a.type === 'directory' && b.type !== 'directory') return -1;
              if (a.type !== 'directory' && b.type === 'directory') return 1;
              return a.name.localeCompare(b.name);
            })
            .map((node) => renderNode(node, 0))
        ) : (
          <div className="p-4 text-center text-zinc-500 text-xs">
            <FolderTree className="w-8 h-8 mx-auto mb-2 opacity-40 text-zinc-400" />
            <p>No files in project.</p>
            <button
              onClick={() => handleStartCreation('', 'file')}
              className="mt-2 text-sky-400 hover:underline flex items-center justify-center mx-auto space-x-1"
            >
              <Plus className="w-3 h-3" />
              <span>Create first file</span>
            </button>
          </div>
        )}
      </div>

      {/* Context Menu Modal */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          targetNode={contextMenu.target}
          onClose={() => setContextMenu(null)}
          onNewFile={(parent) => handleStartCreation(parent, 'file')}
          onNewFolder={(parent) => handleStartCreation(parent, 'folder')}
          onRename={(node) => handleStartRename(node)}
          onDelete={(node) => onDelete(node.path)}
        />
      )}
    </div>
  );
};
