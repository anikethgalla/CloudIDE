import { v4 as uuidv4 } from 'uuid';
import { TimestampedNote } from '@cloud-ide/shared';
import { TutorialService } from '../tutorial/tutorialService';

export class NotesService {
  private static notesStore: Map<string, TimestampedNote[]> = new Map();

  static async getNotes(projectId: string): Promise<TimestampedNote[]> {
    const directNotes = this.notesStore.get(projectId);
    if (directNotes) return directNotes;

    const tutorial = await TutorialService.getTutorial(projectId);
    if (tutorial && tutorial.notes) {
      this.notesStore.set(projectId, tutorial.notes);
      return tutorial.notes;
    }

    return [];
  }

  static async saveNote(
    projectId: string,
    content: string,
    timestamp?: number,
    noteId?: string
  ): Promise<TimestampedNote> {
    const list = (await this.getNotes(projectId)) || [];
    const now = new Date().toISOString();

    if (noteId) {
      const existing = list.find((n) => n.id === noteId);
      if (existing) {
        existing.content = content;
        existing.timestamp = timestamp !== undefined ? timestamp : existing.timestamp;
        existing.updatedAt = now;
        return existing;
      }
    }

    const newNote: TimestampedNote = {
      id: noteId || uuidv4(),
      projectId,
      content,
      timestamp,
      createdAt: now,
      updatedAt: now,
    };

    list.unshift(newNote);
    this.notesStore.set(projectId, list);

    // Sync with tutorial metadata if available
    const tutorial = await TutorialService.getTutorial(projectId);
    if (tutorial) {
      tutorial.notes = list;
    }

    return newNote;
  }

  static async deleteNote(projectId: string, noteId: string): Promise<boolean> {
    const list = await this.getNotes(projectId);
    const filtered = list.filter((n) => n.id !== noteId);
    this.notesStore.set(projectId, filtered);

    const tutorial = await TutorialService.getTutorial(projectId);
    if (tutorial) {
      tutorial.notes = filtered;
    }

    return true;
  }
}
