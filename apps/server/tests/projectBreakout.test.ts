import { YouTubeService } from '../src/services/youtube/youtubeService';
import { TranscriptService } from '../src/services/youtube/transcriptService';
import { CheckpointService } from '../src/services/tutorial/checkpointService';
import { ContextService } from '../src/services/ai/contextService';
import { SocraticService } from '../src/services/ai/socraticService';
import { NotesService } from '../src/services/notes/notesService';
import { LearningEventService } from '../src/services/learning/learningEventService';
import { SpecificationService } from '../src/services/ai/specificationService';
import { TranscriptSegment } from '@cloud-ide/shared';

describe('Project Breakout: Core Services & AI Socratic Engine', () => {
  const testProjectId = 'test-breakout-proj';

  test('YouTubeService should extract video ID from multiple URL variants', () => {
    const urls = [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtu.be/dQw4w9WgXcQ',
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=120s',
      'https://youtube.com/shorts/dQw4w9WgXcQ',
      'dQw4w9WgXcQ',
    ];

    for (const u of urls) {
      const extracted = YouTubeService.extractVideoId(u);
      expect(extracted).toBe('dQw4w9WgXcQ');
    }

    expect(YouTubeService.extractVideoId('https://google.com')).toBeNull();
  });

  test('TranscriptService should preserve exact timestamps and support search', () => {
    const sampleSegments: TranscriptSegment[] = [
      { id: '1', start: 0, duration: 4.5, text: 'Welcome to this tutorial' },
      { id: '2', start: 10, duration: 5.2, text: 'Now we implement the authentication middleware' },
      { id: '3', start: 20, duration: 3.8, text: 'Next we validate the JWT token' },
      { id: '4', start: 60, duration: 4.0, text: 'Finally we test the endpoint in terminal' },
    ];

    // Search query
    const results = TranscriptService.searchTranscript(sampleSegments, 'authentication');
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('2');

    // Context window extraction (around timestamp 12s with radius 10s -> [2, 22])
    const contextWin = TranscriptService.getContextWindow(sampleSegments, 12, 10);
    expect(contextWin.some((s) => s.id === '2')).toBe(true);
    expect(contextWin.some((s) => s.id === '3')).toBe(true);
    expect(contextWin.some((s) => s.id === '4')).toBe(false); // 60s is outside window
  });

  test('CheckpointService should generate semantic milestones from transcript', () => {
    const sampleSegments: TranscriptSegment[] = [
      { id: '1', start: 10, duration: 5, text: 'Let us declare the state variable for user input' },
      { id: '2', start: 150, duration: 5, text: 'Now we define the route handler' },
      { id: '3', start: 300, duration: 5, text: 'Here is the database schema for posts' },
    ];

    const checkpoints = CheckpointService.generateCheckpoints(sampleSegments);
    expect(checkpoints.length).toBeGreaterThanOrEqual(2);
    expect(checkpoints[0].challenge).toBeDefined();
    expect(checkpoints[0].completed).toBe(false);
  });

  test('NotesService should save timestamped markdown notes', async () => {
    const note = await NotesService.saveNote(
      testProjectId,
      'Review JWT verification flow [03:42]',
      222.0
    );

    expect(note.id).toBeDefined();
    expect(note.content).toContain('[03:42]');
    expect(note.timestamp).toBe(222.0);

    const notes = await NotesService.getNotes(testProjectId);
    expect(notes.some((n) => n.id === note.id)).toBe(true);

    await NotesService.deleteNote(testProjectId, note.id);
    const updatedNotes = await NotesService.getNotes(testProjectId);
    expect(updatedNotes.some((n) => n.id === note.id)).toBe(false);
  });

  test('SocraticService should return progressive hints without raw code solutions', async () => {
    const guidance = await SocraticService.getGuidance({
      projectId: testProjectId,
      currentTimestamp: 140,
      question: 'How do I implement user login?',
      hintLevel: 1,
      learningMode: 'tutorial',
    });

    expect(guidance.type).toBe('socratic_hint');
    expect(guidance.question).toBeDefined();
    expect(guidance.hint).toBeDefined();
    expect(guidance.concept).toBeDefined();
    // Verify it doesn't give away full code solutions
    expect(guidance.hint).not.toContain('function solution(');
  });

  test('SpecificationService should generate functional requirements for Rebuild mode', async () => {
    const spec = await SpecificationService.generateSpecification(testProjectId);

    expect(spec.title).toBeDefined();
    expect(spec.summary).toBeDefined();
    expect(spec.features.length).toBeGreaterThan(0);
    expect(spec.recommendedSteps.length).toBeGreaterThan(0);
  });

  test('LearningEventService should record learning telemetry', () => {
    const event = LearningEventService.recordEvent(
      testProjectId,
      'VIDEO_STARTED',
      15.5,
      { title: 'Intro' }
    );

    expect(event.type).toBe('VIDEO_STARTED');
    expect(event.timestamp).toBe(15.5);

    const stats = LearningEventService.getStats(testProjectId);
    expect(stats.totalEvents).toBeGreaterThanOrEqual(1);
  });
});
