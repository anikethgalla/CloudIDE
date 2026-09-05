import { FileNode, Project, EditorTab, ExecutionStatus, ProblemMarker } from '@cloud-ide/shared';

export type ActiveSidePanel = 'explorer' | 'search' | 'github' | 'settings';
export type ActiveBottomTab = 'terminal' | 'output' | 'problems' | 'preview';

export interface UIState {
  activeSidePanel: ActiveSidePanel | null;
  activeBottomTab: ActiveBottomTab;
  isSidebarOpen: boolean;
  isBottomPanelOpen: boolean;
  isPreviewOpen: boolean;
  sidebarWidth: number;
  bottomPanelHeight: number;
  previewWidth: number;
}

export interface IDEContextState {
  project: Project | null;
  fileTree: FileNode[];
  tabs: EditorTab[];
  activeTabId: string | null;
  activeFile: FileNode | null;
  cursorPosition: { line: number; column: number };
  executionStatus: ExecutionStatus;
  executionOutput: string;
  problems: ProblemMarker[];
  previewUrl: string | null;
}
