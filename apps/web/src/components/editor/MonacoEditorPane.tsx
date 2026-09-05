'use client';

import React, { useRef } from 'react';
import Editor, { OnMount, OnChange } from '@monaco-editor/react';
import { ChevronRight, Code2, FileCode, Sparkles } from 'lucide-react';
import { EditorTab } from '@cloud-ide/shared';
import { getFileIcon } from '@/lib/fileIcons';

interface MonacoEditorPaneProps {
  activeTab: EditorTab | null;
  onChangeContent: (content: string) => void;
  onSave: () => void;
  onRun: () => void;
  onCursorChange: (pos: { line: number; column: number }) => void;
}

export const MonacoEditorPane: React.FC<MonacoEditorPaneProps> = ({
  activeTab,
  onChangeContent,
  onSave,
  onRun,
  onCursorChange,
}) => {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Track cursor movement
    editor.onDidChangeCursorPosition((e) => {
      onCursorChange({
        line: e.position.lineNumber,
        column: e.position.column,
      });
    });

    // Custom Keybindings
    // Ctrl + S (Save)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onSave();
    });

    // Ctrl + Enter (Run)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRun();
    });

    // Editor formatting & styling options
    editor.updateOptions({
      fontSize: 14,
      fontFamily: "'Fira Code', 'Consolas', 'Courier New', monospace",
      fontLigatures: true,
      tabSize: 2,
      minimap: { enabled: true, maxColumn: 80, scale: 0.75 },
      scrollBeyondLastLine: false,
      smoothScrolling: true,
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      bracketPairColorization: { enabled: true },
      lineNumbers: 'on',
      renderLineHighlight: 'all',
      automaticLayout: true,
      padding: { top: 12, bottom: 12 },
    });
  };

  const handleContentChange: OnChange = (value) => {
    if (value !== undefined) {
      onChangeContent(value);
    }
  };

  if (!activeTab) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-ide-editor text-zinc-500 select-none p-6">
        <div className="w-16 h-16 rounded-2xl bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center mb-4 text-sky-400">
          <Code2 className="w-8 h-8" />
        </div>
        <h3 className="text-base font-medium text-zinc-300 mb-1">No File Open</h3>
        <p className="text-xs text-zinc-500 max-w-sm text-center mb-6">
          Select a file from the explorer on the left or create a new one to start editing.
        </p>

        <div className="grid grid-cols-2 gap-3 text-xs text-zinc-400 max-w-md w-full">
          <div className="bg-zinc-800/40 border border-zinc-800 p-3 rounded-lg flex items-center justify-between">
            <span>Save File</span>
            <kbd className="px-2 py-0.5 bg-zinc-900 border border-zinc-700 rounded text-[10px] font-mono text-zinc-300">
              Ctrl + S
            </kbd>
          </div>
          <div className="bg-zinc-800/40 border border-zinc-800 p-3 rounded-lg flex items-center justify-between">
            <span>Run Code</span>
            <kbd className="px-2 py-0.5 bg-zinc-900 border border-zinc-700 rounded text-[10px] font-mono text-zinc-300">
              Ctrl + ↵
            </kbd>
          </div>
          <div className="bg-zinc-800/40 border border-zinc-800 p-3 rounded-lg flex items-center justify-between">
            <span>Toggle Terminal</span>
            <kbd className="px-2 py-0.5 bg-zinc-900 border border-zinc-700 rounded text-[10px] font-mono text-zinc-300">
              Ctrl + `
            </kbd>
          </div>
          <div className="bg-zinc-800/40 border border-zinc-800 p-3 rounded-lg flex items-center justify-between">
            <span>Toggle Sidebar</span>
            <kbd className="px-2 py-0.5 bg-zinc-900 border border-zinc-700 rounded text-[10px] font-mono text-zinc-300">
              Ctrl + B
            </kbd>
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbs = activeTab.filePath.split('/');

  return (
    <div className="h-full w-full flex flex-col bg-ide-editor overflow-hidden">
      {/* Breadcrumbs bar */}
      <div className="h-6 bg-ide-editor border-b border-zinc-800/60 flex items-center px-3 text-[11px] text-zinc-400 select-none space-x-1 shrink-0">
        <span className="text-zinc-500">project</span>
        {breadcrumbs.map((segment, idx) => (
          <React.Fragment key={idx}>
            <ChevronRight className="w-3 h-3 text-zinc-600" />
            <span
              className={
                idx === breadcrumbs.length - 1
                  ? 'text-zinc-200 font-medium flex items-center gap-1'
                  : 'text-zinc-400'
              }
            >
              {idx === breadcrumbs.length - 1 && getFileIcon(segment, false)}
              {segment}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Monaco Editor Container */}
      <div className="flex-1 w-full h-full relative">
        <Editor
          height="100%"
          language={activeTab.language}
          value={activeTab.content}
          theme="vs-dark"
          onChange={handleContentChange}
          onMount={handleEditorDidMount}
          loading={
            <div className="h-full w-full flex items-center justify-center bg-ide-editor text-zinc-400 text-xs">
              Loading editor...
            </div>
          }
        />
      </div>
    </div>
  );
};
