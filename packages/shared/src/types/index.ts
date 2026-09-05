export type Language =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'java'
  | 'cpp'
  | 'c'
  | 'html'
  | 'css'
  | 'json'
  | 'markdown'
  | 'react'
  | 'nextjs';

export type TemplateId =
  | 'empty'
  | 'nodejs'
  | 'python'
  | 'cpp'
  | 'java'
  | 'html'
  | 'react'
  | 'nextjs';

export interface ProjectTemplate {
  id: TemplateId;
  name: string;
  description: string;
  language: Language;
  icon: string;
  defaultEntryFile: string;
  files: Record<string, string>;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  template: TemplateId;
  language: Language;
  createdAt: string;
  updatedAt: string;
  entryFile?: string;
}

export interface FileNode {
  id: string; // relative path from project root
  name: string;
  path: string; // relative path, e.g. "src/index.ts"
  type: 'file' | 'directory';
  children?: FileNode[];
  size?: number;
  updatedAt?: string;
}

export interface EditorTab {
  id: string;
  filePath: string;
  name: string;
  language: string;
  isDirty: boolean;
  content: string;
  originalContent: string;
}

export type ExecutionStatus =
  | 'QUEUED'
  | 'RUNNING'
  | 'SUCCESS'
  | 'FAILED'
  | 'TIMEOUT'
  | 'STOPPED';

export interface ExecutionRequest {
  projectId: string;
  language: Language;
  entryFile?: string;
  stdin?: string;
}

export interface ExecutionOutputChunk {
  type: 'stdout' | 'stderr' | 'system';
  data: string;
  timestamp: number;
}

export interface ExecutionResult {
  executionId: string;
  projectId: string;
  status: ExecutionStatus;
  exitCode: number | null;
  output: string;
  durationMs: number;
  error?: string;
}

export interface TerminalMessage {
  type: 'input' | 'resize' | 'ping';
  data?: string;
  cols?: number;
  rows?: number;
}

export interface ProblemMarker {
  filePath: string;
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  source?: string;
}

export interface WebPreviewConfig {
  projectId: string;
  port: number;
  url: string;
  isRunning: boolean;
  type: 'static' | 'react' | 'nextjs';
}
