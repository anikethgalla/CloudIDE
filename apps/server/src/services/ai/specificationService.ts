import { RebuildSpecification } from '@cloud-ide/shared';
import { TutorialService } from '../tutorial/tutorialService';
import { GeminiService } from './geminiService';

export class SpecificationService {
  private static readonly SYSTEM_PROMPT = `
You are the Lead Systems Architect in Project Breakout.
Your job is to generate a comprehensive, professional FUNCTIONAL SPECIFICATION for an application based on a programming tutorial.

CRITICAL INSTRUCTIONS:
1. Focus entirely on WHAT the application should do, NOT HOW the instructor coded it.
2. DO NOT mention specific file names, variable names, or instructor idioms unless standard for the framework.
3. DO NOT output code snippets or solutions.
4. Output functional requirements, expected user interactions, edge cases to handle, and architectural milestones.

Respond with valid JSON matching this schema:
{
  "title": "<Project Title>",
  "summary": "<Short overview of what the application does from a product/user standpoint>",
  "features": [
    {
      "title": "<Feature Area, e.g. User Authentication, Data Visualization>",
      "requirements": [
        "<Requirement 1>",
        "<Requirement 2>"
      ]
    }
  ],
  "edgeCases": [
    "<Edge case 1, e.g. Handling expired tokens>",
    "<Edge case 2, e.g. Empty input validation>"
  ],
  "recommendedSteps": [
    "<Step 1: Set up core data models>",
    "<Step 2: Implement business logic>",
    "<Step 3: Connect UI and verify end-to-end>"
  ]
}
`;

  /**
   * Generates a functional specification for the Rebuild From Memory mode.
   */
  static async generateSpecification(
    projectId: string
  ): Promise<RebuildSpecification> {
    const tutorial = await TutorialService.getTutorial(projectId);
    const title = tutorial?.title || 'Full-Stack Application';

    let transcriptSummary = '';
    if (tutorial?.transcript && tutorial.transcript.length > 0) {
      // Sample transcript segments across the video
      const step = Math.max(1, Math.floor(tutorial.transcript.length / 20));
      transcriptSummary = tutorial.transcript
        .filter((_, idx) => idx % step === 0)
        .map((s) => s.text)
        .join('; ');
    }

    const userPrompt = `
Tutorial Title: "${title}"
Video Overview / Topics covered in transcript:
${transcriptSummary}

Generate a clear functional specification to allow a developer to rebuild this project completely from scratch without referencing the video.
`;

    if (!GeminiService.hasApiKey()) {
      // Fallback specification if GEMINI_API_KEY is not configured
      return {
        projectId,
        title: `Rebuild: ${title}`,
        summary: `Reconstruct the full functionality of "${title}" from first principles. Test each component independently as you build.`,
        features: [
          {
            title: 'Core Architecture & Logic',
            requirements: [
              'Design modular functions with clear input parameters and expected return values.',
              'Implement proper state management and data validation.',
            ],
          },
          {
            title: 'User Interface & Interaction',
            requirements: [
              'Render a responsive layout that presents necessary state clearly.',
              'Handle loading states, user input triggers, and error feedback gracefully.',
            ],
          },
        ],
        edgeCases: [
          'Invalid or empty user inputs.',
          'Asynchronous latency and error handling.',
        ],
        recommendedSteps: [
          '1. Define the data contracts and type interfaces.',
          '2. Implement core algorithmic or business logic.',
          '3. Build the presentation layer and verify interactions in the terminal / preview.',
        ],
        createdAt: new Date().toISOString(),
      };
    }

    try {
      const generated = await GeminiService.generateJson<any>(
        this.SYSTEM_PROMPT,
        userPrompt
      );

      return {
        projectId,
        title: generated.title || `Rebuild Specification: ${title}`,
        summary: generated.summary || 'Functional rebuild requirements.',
        features: generated.features || [],
        edgeCases: generated.edgeCases || [],
        recommendedSteps: generated.recommendedSteps || [],
        createdAt: new Date().toISOString(),
      };
    } catch (err: any) {
      console.warn('Specification generation failed, using fallback:', err.message);
      return {
        projectId,
        title: `Rebuild: ${title}`,
        summary: `Reconstruct "${title}" independently from memory.`,
        features: [
          {
            title: 'Core Requirements',
            requirements: [
              'Recreate all user flows covered in the tutorial.',
              'Ensure all edge cases and error states are handled properly.',
            ],
          },
        ],
        edgeCases: ['Missing parameters', 'Network disconnection'],
        recommendedSteps: [
          '1. Set up data structures',
          '2. Implement business logic',
          '3. Test end-to-end',
        ],
        createdAt: new Date().toISOString(),
      };
    }
  }
}
