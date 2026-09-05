import React from 'react';
import {
  FileCode,
  FileText,
  FileJson,
  FileCode2,
  FileTerminal,
  FileBadge,
  FileBox,
  FileDigit,
  FileImage,
  FilePlus,
  Folder,
  FolderOpen,
  Globe,
  Settings,
  Flame,
  Terminal,
} from 'lucide-react';

export function getFileIcon(filename: string, isFolder = false, isOpen = false) {
  if (isFolder) {
    return isOpen ? (
      <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
    ) : (
      <Folder className="w-4 h-4 text-amber-400 shrink-0" />
    );
  }

  const ext = filename.split('.').pop()?.toLowerCase() || '';

  switch (ext) {
    case 'js':
    case 'mjs':
    case 'cjs':
      return <FileCode className="w-4 h-4 text-yellow-400 shrink-0" />;
    case 'jsx':
      return <FileCode2 className="w-4 h-4 text-cyan-400 shrink-0" />;
    case 'ts':
      return <FileCode className="w-4 h-4 text-blue-400 shrink-0" />;
    case 'tsx':
      return <FileCode2 className="w-4 h-4 text-sky-400 shrink-0" />;
    case 'py':
      return <FileCode className="w-4 h-4 text-emerald-400 shrink-0" />;
    case 'cpp':
    case 'cc':
    case 'cxx':
    case 'c':
    case 'h':
    case 'hpp':
      return <FileBadge className="w-4 h-4 text-blue-500 shrink-0" />;
    case 'java':
      return <Flame className="w-4 h-4 text-orange-500 shrink-0" />;
    case 'html':
    case 'htm':
      return <Globe className="w-4 h-4 text-orange-400 shrink-0" />;
    case 'css':
    case 'scss':
    case 'less':
      return <FileCode className="w-4 h-4 text-indigo-400 shrink-0" />;
    case 'json':
      return <FileJson className="w-4 h-4 text-yellow-300 shrink-0" />;
    case 'md':
    case 'markdown':
      return <FileText className="w-4 h-4 text-neutral-300 shrink-0" />;
    case 'sh':
    case 'bash':
    case 'zsh':
      return <Terminal className="w-4 h-4 text-green-400 shrink-0" />;
    case 'yml':
    case 'yaml':
    case 'env':
      return <Settings className="w-4 h-4 text-rose-400 shrink-0" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'svg':
    case 'gif':
    case 'webp':
      return <FileImage className="w-4 h-4 text-purple-400 shrink-0" />;
    default:
      return <FileText className="w-4 h-4 text-zinc-400 shrink-0" />;
  }
}

export function getLanguageFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    java: 'java',
    cpp: 'cpp',
    cc: 'cpp',
    c: 'c',
    h: 'cpp',
    hpp: 'cpp',
    html: 'html',
    css: 'css',
    scss: 'scss',
    json: 'json',
    md: 'markdown',
    yml: 'yaml',
    yaml: 'yaml',
    sh: 'shell',
    bash: 'shell',
    sql: 'sql',
    txt: 'plaintext',
  };
  return map[ext] || 'plaintext';
}
