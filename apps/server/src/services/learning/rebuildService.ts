import { RebuildSpecification } from '@cloud-ide/shared';
import { TutorialService } from '../tutorial/tutorialService';
import { SpecificationService } from '../ai/specificationService';
import { LearningEventService } from './learningEventService';

export class RebuildService {
  /**
   * Activates Rebuild From Memory mode, generates functional specs, and hides tutorial video references.
   */
  static async startRebuild(projectId: string): Promise<RebuildSpecification> {
    const spec = await SpecificationService.generateSpecification(projectId);
    await TutorialService.setRebuildMode(projectId, true, spec);

    LearningEventService.recordEvent(
      projectId,
      'REBUILD_STARTED',
      0,
      { title: spec.title }
    );

    return spec;
  }
}
