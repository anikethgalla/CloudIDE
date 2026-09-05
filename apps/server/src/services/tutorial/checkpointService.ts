import { TranscriptSegment, LearningCheckpoint } from '@cloud-ide/shared';

export class CheckpointService {
  /**
   * Generates conceptual checkpoints and active recall challenges from timestamped transcript segments.
   */
  static generateCheckpoints(segments: TranscriptSegment[]): LearningCheckpoint[] {
    if (!segments || segments.length === 0) {
      return [
        {
          id: 'cp-1',
          title: 'Project Setup & Understanding',
          timestamp: 0,
          concept: 'Initial Architecture',
          challenge: 'Set up the starter files and explain the overall system architecture from memory.',
          completed: false,
        },
      ];
    }

    const checkpoints: LearningCheckpoint[] = [];
    const totalDuration = segments[segments.length - 1].start + segments[segments.length - 1].duration;

    // Identify semantic boundaries using keywords
    const keywords = [
      { term: 'component', title: 'Component Architecture', challenge: 'Implement the component structure and props interface from memory.' },
      { term: 'state', title: 'State Management & Reactivity', challenge: 'Declare state variables and reactive handlers without looking at the video.' },
      { term: 'route', title: 'Routing & Endpoints', challenge: 'Implement the route handler and response payload independently.' },
      { term: 'auth', title: 'Authentication & Security', challenge: 'Write the authentication verification logic from first principles.' },
      { term: 'database', title: 'Data Layer & Models', challenge: 'Construct the data schema and query operations from memory.' },
      { term: 'function', title: 'Core Logic Implementation', challenge: 'Write the core algorithm/function logic and handle input edge cases.' },
      { term: 'style', title: 'Layout & Styling', challenge: 'Reconstruct the UI layout and responsiveness from memory.' },
      { term: 'test', title: 'Testing & Verification', challenge: 'Write test cases to verify expected behavior.' },
    ];

    let lastTimestamp = -120; // Minimum 2 minutes between checkpoints

    for (const seg of segments) {
      if (seg.start - lastTimestamp < 120) continue;

      const lower = seg.text.toLowerCase();
      for (const kw of keywords) {
        if (lower.includes(kw.term)) {
          const minutes = Math.floor(seg.start / 60);
          const seconds = Math.floor(seg.start % 60);
          const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

          checkpoints.push({
            id: `cp-${checkpoints.length + 1}`,
            title: `${kw.title} [${timeFormatted}]`,
            timestamp: seg.start,
            concept: kw.term.toUpperCase(),
            challenge: kw.challenge,
            completed: false,
          });

          lastTimestamp = seg.start;
          break;
        }
      }
    }

    // If fewer than 2 checkpoints were detected, divide the video into 3-4 structured intervals
    if (checkpoints.length < 2) {
      const step = Math.max(180, totalDuration / 4);
      for (let t = step; t < totalDuration; t += step) {
        const seg = segments.find((s) => s.start >= t) || segments[segments.length - 1];
        const minutes = Math.floor(seg.start / 60);
        const seconds = Math.floor(seg.start % 60);
        const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        checkpoints.push({
          id: `cp-${checkpoints.length + 1}`,
          title: `Checkpoint ${checkpoints.length + 1} [${timeFormatted}]`,
          timestamp: seg.start,
          concept: 'Active Recall Phase',
          challenge: 'Pause the video and implement the code segment covered in the last section.',
          completed: false,
        });
      }
    }

    return checkpoints;
  }
}
