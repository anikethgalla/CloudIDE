import { v4 as uuidv4 } from 'uuid';
import { LearningEvent, LearningEventType } from '@cloud-ide/shared';

export class LearningEventService {
  private static eventLog: LearningEvent[] = [];

  static recordEvent(
    projectId: string,
    type: LearningEventType,
    timestamp: number,
    metadata?: Record<string, any>
  ): LearningEvent {
    const event: LearningEvent = {
      id: uuidv4(),
      projectId,
      type,
      timestamp,
      metadata,
      createdAt: new Date().toISOString(),
    };

    this.eventLog.push(event);

    // Keep log at reasonable size
    if (this.eventLog.length > 2000) {
      this.eventLog.splice(0, 500);
    }

    return event;
  }

  static getEvents(projectId: string): LearningEvent[] {
    return this.eventLog.filter((e) => e.projectId === projectId);
  }

  static getStats(projectId: string) {
    const projectEvents = this.getEvents(projectId);
    return {
      totalEvents: projectEvents.length,
      hintsRequested: projectEvents.filter((e) => e.type === 'AI_HINT_REQUESTED').length,
      challengesCompleted: projectEvents.filter((e) => e.type === 'CHALLENGE_COMPLETED').length,
      notesCreated: projectEvents.filter((e) => e.type === 'NOTE_CREATED').length,
      codeChanges: projectEvents.filter((e) => e.type === 'CODE_CHANGED').length,
    };
  }
}
