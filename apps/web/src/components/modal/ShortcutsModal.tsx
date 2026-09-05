'use client';

import React from 'react';
import { X, Command, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + S', action: 'Save current active file' },
    { key: 'Ctrl + Enter', action: 'Run active file / project' },
    { key: 'Ctrl + `', action: 'Toggle Terminal & Output panel' },
    { key: 'Ctrl + B', action: 'Toggle File Explorer sidebar' },
    { key: 'Ctrl + Shift + F', action: 'Find across project' },
    { key: 'Ctrl + P', action: 'Quick open file' },
    { key: 'Alt + Click', action: 'Multi-cursor selection in Monaco' },
    { key: 'Ctrl + /', action: 'Toggle line comment' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Keyboard className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-100">Keyboard Shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="p-5 space-y-2.5">
          {shortcuts.map((sc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/80 text-xs"
            >
              <span className="text-zinc-300">{sc.action}</span>
              <kbd className="px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-[11px] font-mono text-sky-400">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-zinc-950/60 border-t border-zinc-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
