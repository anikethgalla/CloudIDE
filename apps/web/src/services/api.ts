import {
  Project,
  FileNode,
  ProjectTemplate,
  ExecutionResult,
  TemplateId,
  TutorialMetadata,
  TranscriptSegment,
  TimestampedNote,
  SocraticRequest,
  SocraticResponse,
  RebuildSpecification,
  LearningEventType,
} from '@cloud-ide/shared';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export class ApiClient {
  private static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!res.ok) {
      let errorMsg = `HTTP Error ${res.status}`;
      try {
        const errorJson = await res.json();
        errorMsg = errorJson.message || errorJson.error || errorMsg;
      } catch (_) {
        errorMsg = await res.text();
      }
      throw new Error(errorMsg);
    }

    return res.json();
  }

  // Projects
  static async getProjects(): Promise<Project[]> {
    return this.request<Project[]>('/api/projects');
  }

  static async getProject(id: string): Promise<Project> {
    return this.request<Project>(`/api/projects/${id}`);
  }

  static async createProject(payload: { name: string; template: TemplateId; description?: string }): Promise<Project> {
    return this.request<Project>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static async deleteProject(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Templates
  static async getTemplates(): Promise<ProjectTemplate[]> {
    return this.request<ProjectTemplate[]>('/api/templates');
  }

  // Files
  static async getFiles(projectId: string): Promise<FileNode[]> {
    return this.request<FileNode[]>(`/api/projects/${projectId}/files`);
  }

  static async getFileContent(projectId: string, filePath: string): Promise<{ content: string; path: string }> {
    const encodedPath = encodeURIComponent(filePath);
    return this.request<{ content: string; path: string }>(`/api/projects/${projectId}/file?path=${encodedPath}`);
  }

  static async saveFile(projectId: string, filePath: string, content: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/projects/${projectId}/file`, {
      method: 'PUT',
      body: JSON.stringify({ path: filePath, content }),
    });
  }

  static async createFile(projectId: string, filePath: string, content = ''): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/projects/${projectId}/file`, {
      method: 'POST',
      body: JSON.stringify({ path: filePath, content }),
    });
  }

  static async createDirectory(projectId: string, dirPath: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/projects/${projectId}/directory`, {
      method: 'POST',
      body: JSON.stringify({ path: dirPath }),
    });
  }

  static async deletePath(projectId: string, targetPath: string): Promise<{ success: boolean }> {
    const encodedPath = encodeURIComponent(targetPath);
    return this.request<{ success: boolean }>(`/api/projects/${projectId}/resource?path=${encodedPath}`, {
      method: 'DELETE',
    });
  }

  static async renamePath(projectId: string, oldPath: string, newPath: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/projects/${projectId}/rename`, {
      method: 'POST',
      body: JSON.stringify({ oldPath, newPath }),
    });
  }

  // Execution
  static async runCode(projectId: string, entryFile?: string): Promise<{ executionId: string }> {
    return this.request<{ executionId: string }>(`/api/projects/${projectId}/run`, {
      method: 'POST',
      body: JSON.stringify({ entryFile }),
    });
  }

  static async stopExecution(projectId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/projects/${projectId}/stop`, {
      method: 'POST',
    });
  }

  // ==========================================
  // PROJECT BREAKOUT: TUTORIAL & LEARNING APIS
  // ==========================================

  static async importTutorial(payload: {
    url: string;
    template?: TemplateId;
    languageCode?: string;
    customName?: string;
  }): Promise<Project> {
    return this.request<Project>('/api/tutorials/import', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static async getTutorial(projectId: string): Promise<TutorialMetadata> {
    return this.request<TutorialMetadata>(`/api/tutorials/${projectId}`);
  }

  static async getTranscript(projectId: string, search?: string): Promise<TranscriptSegment[]> {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request<TranscriptSegment[]>(`/api/tutorials/${projectId}/transcript${q}`);
  }

  static async completeCheckpoint(
    projectId: string,
    checkpointId: string,
    completed = true
  ): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(
      `/api/tutorials/${projectId}/checkpoints/${checkpointId}/complete`,
      {
        method: 'POST',
        body: JSON.stringify({ completed }),
      }
    );
  }

  static async startRebuild(projectId: string): Promise<{ success: boolean; spec: RebuildSpecification }> {
    return this.request<{ success: boolean; spec: RebuildSpecification }>(
      `/api/tutorials/${projectId}/rebuild/start`,
      {
        method: 'POST',
      }
    );
  }

  static async recordEvent(
    projectId: string,
    type: LearningEventType,
    timestamp: number,
    metadata?: Record<string, any>
  ): Promise<any> {
    return this.request('/api/tutorials/${projectId}/events', {
      method: 'POST',
      body: JSON.stringify({ type, timestamp, metadata }),
    }).catch(() => {}); // silent fail for telemetry
  }

  static async getNotes(projectId: string): Promise<TimestampedNote[]> {
    return this.request<TimestampedNote[]>(`/api/tutorials/${projectId}/notes`);
  }

  static async saveNote(
    projectId: string,
    content: string,
    timestamp?: number,
    noteId?: string
  ): Promise<TimestampedNote> {
    return this.request<TimestampedNote>(`/api/tutorials/${projectId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ content, timestamp, noteId }),
    });
  }

  static async deleteNote(projectId: string, noteId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/tutorials/${projectId}/notes/${noteId}`, {
      method: 'DELETE',
    });
  }

  static async getSocraticGuidance(req: SocraticRequest): Promise<SocraticResponse> {
    return this.request<SocraticResponse>(`/api/tutorials/${req.projectId}/socratic-ai`, {
      method: 'POST',
      body: JSON.stringify(req),
    });
  }
}
