export type Language =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'java'
  | 'cpp'
  | 'c'
  | 'go'
  | 'rust'
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
  | 'go'
  | 'rust'
  | 'html'
  | 'react'
  | 'nextjs';

export interface WorkspacePort {
  port: number;
  processName?: string;
  protocol: 'http' | 'https' | 'ws';
  status: 'open' | 'closed';
  url?: string;
}

export interface WorkspaceEnvVar {
  key: string;
  value: string;
  isSecret?: boolean;
}

export interface ToolchainItem {
  name: string;
  command: string;
  version: string | null;
  available: boolean;
  category: 'runtime' | 'package_manager' | 'compiler' | 'vcs';
}

export interface ToolchainDiagnostics {
  tools: ToolchainItem[];
  timestamp: string;
}

export interface DetectedProjectType {
  type: string;
  name: string;
  language: Language;
  buildTool?: string;
  packageManager?: string;
  suggestedRunCommands: Array<{ label: string; command: string }>;
  framework?: string;
}

export interface WorkspaceProcess {
  id: string;
  projectId: string;
  name: string;
  command: string;
  args: string[];
  pid?: number;
  status: 'running' | 'stopped' | 'failed' | 'completed';
  startTime: string;
  endTime?: string;
  exitCode?: number | null;
  port?: number;
}

export interface User {
  id: string;
  name?: string;
  email: string;
  image?: string;
  avatar?: string;
  provider?: 'github' | 'google' | 'developer';
  createdAt: string;
  updatedAt?: string;
}

export type JobStatus =
  | 'QUEUED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'RETRYING';

export interface JobRecord {
  id: string;
  userId?: string;
  type: string;
  status: JobStatus;
  progress: number; // 0 to 100
  payload?: any;
  result?: any;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

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
  userId?: string;
  name: string;
  description?: string;
  template: TemplateId;
  language: Language;
  createdAt: string;
  updatedAt: string;
  entryFile?: string;
  // Tutorial metadata if project is a Project Breakout workspace
  tutorial?: TutorialMetadata;
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

// ==========================================
// PROJECT BREAKOUT: TUTORIAL & LEARNING TYPES
// ==========================================

export interface TranscriptSegment {
  id: string;
  text: string;
  start: number; // in seconds
  duration: number; // in seconds
}

export interface LearningCheckpoint {
  id: string;
  title: string;
  timestamp: number; // in seconds
  concept: string;
  challenge: string;
  completed: boolean;
}

export interface TutorialMetadata {
  id: string;
  userId?: string;
  projectId: string;
  youtubeUrl: string;
  videoId: string;
  title: string;
  thumbnailUrl: string;
  durationSeconds: number;
  language: string;
  languageCode: string;
  isGenerated: boolean;
  transcript: TranscriptSegment[];
  checkpoints: LearningCheckpoint[];
  notes: TimestampedNote[];
  rebuildMode?: boolean;
  rebuildSpec?: RebuildSpecification;
}

export interface TimestampedNote {
  id: string;
  projectId: string;
  content: string;
  timestamp?: number; // Video timestamp in seconds
  createdAt: string;
  updatedAt: string;
}

export interface SocraticRequest {
  projectId: string;
  currentTimestamp: number;
  question: string;
  hintLevel: number; // 0 to 4
  currentFile?: string;
  currentCode?: string;
  recentTerminalOutput?: string;
  learningMode?: 'tutorial' | 'recall' | 'rebuild';
}

export interface SocraticResponse {
  type: 'socratic_hint';
  hintLevel: number;
  question: string;
  hint: string;
  concept: string;
  relatedTimestamp?: number;
}

export interface RebuildSpecification {
  projectId: string;
  title: string;
  summary: string;
  features: Array<{ title: string; requirements: string[] }>;
  edgeCases: string[];
  recommendedSteps: string[];
  createdAt: string;
}

export type LearningEventType =
  | 'VIDEO_STARTED'
  | 'VIDEO_PAUSED'
  | 'VIDEO_SEEKED'
  | 'EDITOR_FOCUSED'
  | 'CODE_CHANGED'
  | 'NOTE_CREATED'
  | 'TIMESTAMP_BOOKMARKED'
  | 'CHALLENGE_STARTED'
  | 'CHALLENGE_COMPLETED'
  | 'AI_HINT_REQUESTED'
  | 'TERMINAL_RUN'
  | 'TERMINAL_ERROR'
  | 'TUTORIAL_COMPLETED'
  | 'REBUILD_STARTED'
  | 'REBUILD_COMPLETED';

export interface LearningEvent {
  id: string;
  projectId: string;
  type: LearningEventType;
  timestamp: number; // Video timestamp
  metadata?: Record<string, any>;
  createdAt: string;
}


