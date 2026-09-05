import {
  FileNode,
  Project,
  EditorTab,
  ExecutionStatus,
  ProblemMarker,
  TutorialMetadata,
  TranscriptSegment,
  TimestampedNote,
  LearningCheckpoint,
  RebuildSpecification,
} from '@cloud-ide/shared';

export type ActiveSidePanel = 'explorer' | 'search' | 'github' | 'settings';
export type ActiveBottomTab = 'terminal' | 'output' | 'problems' | 'preview';
export type ActiveRightTab =
  | 'tutorial'
  | 'transcript'
  | 'notes'
  | 'ai'
  | 'checkpoints'
  | 'preview'
  | 'rebuild';

export interface UIState {
  activeSidePanel: ActiveSidePanel | null;
  activeBottomTab: ActiveBottomTab;
  activeRightTab: ActiveRightTab;
  isSidebarOpen: boolean;
  isBottomPanelOpen: boolean;
  isRightPanelOpen: boolean;
  isBlindfolded: boolean;
  sidebarWidth: number;
  bottomPanelHeight: number;
  rightPanelWidth: number;
}

export interface IDEContextState {
  project: Project | null;
  tutorial: TutorialMetadata | null;
  fileTree: FileNode[];
  tabs: EditorTab[];
  activeTabId: string | null;
  activeFile: FileNode | null;
  cursorPosition: { line: number; column: number };
  currentVideoTime: number;
  isBlindfoldActive: boolean;
  executionStatus: ExecutionStatus;
  executionOutput: string;
  problems: ProblemMarker[];
  previewUrl: string | null;
}
