'use client';

import React, { useEffect, useRef } from 'react';
import {
  FilePlus,
  FolderPlus,
  Edit2,
  Trash2,
  Copy,
  Download,
} from 'lucide-react';
import { FileNode } from '@cloud-ide/shared';

interface ContextMenuProps {
  x: number;
  y: number;
  targetNode: FileNode | null; // null means root project folder
  onClose: () => void;
  onNewFile: (parentPath: string) => void;
  onNewFolder: (parentPath: string) => void;
  onRename: (node: FileNode) => void;
  onDelete: (node: FileNode) => void;
  onCopyPath?: (node: FileNode) => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  targetNode,
  onClose,
  onNewFile,
  onNewFolder,
  onRename,
  onDelete,
  onCopyPath,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const parentPath = targetNode
    ? targetNode.type === 'directory'
      ? targetNode.path
      : targetNode.path.split('/').slice(0, -1).join('/')
    : '';

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[160px] bg-ide-sidebar border border-ide-border rounded-lg shadow-xl py-1 text-xs text-zinc-300 backdrop-blur-md"
      style={{
        left: `${Math.min(x, window.innerWidth - 180)}px`,
        top: `${Math.min(y, window.innerHeight - 200)}px`,
      }}
    >
      <button
        onClick={() => {
          onNewFile(parentPath);
          onClose();
        }}
        className="w-full px-3 py-1.5 text-left flex items-center space-x-2 hover:bg-sky-600/20 hover:text-sky-300 transition-colors"
      >
        <FilePlus className="w-3.5 h-3.5 text-sky-400" />
        <span>New File</span>
      </button>

      <button
        onClick={() => {
          onNewFolder(parentPath);
          onClose();
        }}
        className="w-full px-3 py-1.5 text-left flex items-center space-x-2 hover:bg-amber-600/20 hover:text-amber-300 transition-colors"
      >
        <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
        <span>New Folder</span>
      </button>

      {targetNode && (
        <>
          <div className="h-[1px] bg-ide-border my-1" />

          <button
            onClick={() => {
              onRename(targetNode);
              onClose();
            }}
            className="w-full px-3 py-1.5 text-left flex items-center space-x-2 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5 text-zinc-400" />
            <span>Rename</span>
          </button>

          <button
            onClick={() => {
              if (onCopyPath) onCopyPath(targetNode);
              navigator.clipboard.writeText(targetNode.path);
              onClose();
            }}
            className="w-full px-3 py-1.5 text-left flex items-center space-x-2 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-zinc-400" />
            <span>Copy Path</span>
          </button>

          <div className="h-[1px] bg-ide-border my-1" />

          <button
            onClick={() => {
              onDelete(targetNode);
              onClose();
            }}
            className="w-full px-3 py-1.5 text-left flex items-center space-x-2 text-rose-400 hover:bg-rose-500/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </>
      )}
    </div>
  );
};
