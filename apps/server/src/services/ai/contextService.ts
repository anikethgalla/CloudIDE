import { SocraticRequest } from '@cloud-ide/shared';
import { TutorialService } from '../tutorial/tutorialService';
import { TranscriptService } from '../youtube/transcriptService';
import { NotesService } from '../notes/notesService';

export class ContextService {
  /**
   * Constructs an optimized, compact context payload for the Socratic AI tutor.
   */
  static async buildPromptContext(req: SocraticRequest): Promise<{
    tutorialTitle: string;
    currentTimestamp: number;
    formattedTime: string;
    transcriptSnippet: string;
    notesSnippet: string;
    codeSnippet: string;
    terminalSnippet: string;
  }> {
    const tutorial = await TutorialService.getTutorial(req.projectId);
    const notes = await NotesService.getNotes(req.projectId);

    // Format current video time (MM:SS)
    const minutes = Math.floor(req.currentTimestamp / 60);
    const seconds = Math.floor(req.currentTimestamp % 60);
    const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    // Extract surrounding transcript context (±35s window)
    let transcriptSnippet = 'No transcript context available.';
    if (tutorial?.transcript && tutorial.transcript.length > 0) {
      const windowSegments = TranscriptService.getContextWindow(
        tutorial.transcript,
        req.currentTimestamp,
        35
      );
      if (windowSegments.length > 0) {
        transcriptSnippet = windowSegments
          .map((s) => {
            const m = Math.floor(s.start / 60);
            const sec = Math.floor(s.start % 60);
            return `[${m}:${sec < 10 ? '0' : ''}${sec}] ${s.text}`;
          })
          .join('\n');
      }
    }

    // Recent notes snippet
    let notesSnippet = 'None';
    if (notes && notes.length > 0) {
      notesSnippet = notes
        .slice(0, 3)
        .map((n) => `- ${n.content}`)
        .join('\n');
    }

    // Code snippet
    let codeSnippet = 'No file open';
    if (req.currentFile && req.currentCode) {
      const truncatedCode =
        req.currentCode.length > 1200
          ? req.currentCode.slice(0, 1200) + '\n...[truncated]'
          : req.currentCode;
      codeSnippet = `File: ${req.currentFile}\n\`\`\`\n${truncatedCode}\n\`\`\``;
    }

    // Terminal snippet
    let terminalSnippet = 'None';
    if (req.recentTerminalOutput) {
      terminalSnippet =
        req.recentTerminalOutput.length > 600
          ? req.recentTerminalOutput.slice(-600)
          : req.recentTerminalOutput;
    }

    return {
      tutorialTitle: tutorial?.title || 'Programming Tutorial',
      currentTimestamp: req.currentTimestamp,
      formattedTime,
      transcriptSnippet,
      notesSnippet,
      codeSnippet,
      terminalSnippet,
    };
  }
}
