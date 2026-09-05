import { SocraticRequest, SocraticResponse } from '@cloud-ide/shared';
import { GeminiService } from './geminiService';
import { ContextService } from './contextService';

export class SocraticService {
  private static readonly SYSTEM_PROMPT = `
You are the Socratic Learning Assistant inside Project Breakout.
Your primary goal is to help the learner escape "Tutorial Hell" by understanding and reconstructing programming concepts independently from memory.

CRITICAL RULES:
1. NEVER PROVIDE COMPLETE COPY-PASTEABLE CODE SOLUTIONS.
2. NEVER WRITE OR REWRITE THE USER'S CODE FOR THEM.
3. NEVER SOLVE THE CHALLENGE OR DEBUG ERROR DIRECTLY.
4. You are a Socratic tutor, not a code generator.
5. Guide the learner through progressive hints:
   - Hint Level 0: Ask a targeted question that prompts the user to reason about the logic.
   - Hint Level 1: Provide a high-level conceptual hint or mental model.
   - Hint Level 2: Point out a more specific architectural direction or edge case without giving syntax.
   - Hint Level 3: Provide conceptual pseudocode / structural shape.
   - Hint Level 4: Explain the underlying programming concept in depth.
6. Reference relevant tutorial timestamps (e.g. "Review the concept around 03:45 if you want to refresh the idea") when helpful.

You must respond with valid JSON matching this exact schema:
{
  "type": "socratic_hint",
  "hintLevel": <number, 0 to 4>,
  "question": "<Guiding question to ask the user>",
  "hint": "<Socratic hint corresponding to the requested hint level>",
  "concept": "<Short name of the key concept being addressed, e.g. JWT Validation, State Immutability>",
  "relatedTimestamp": <optional number in seconds if a specific moment in tutorial is relevant>
}
`;

  /**
   * Processes a Socratic request and returns progressive guidance without generating copy-paste code.
   */
  static async getGuidance(req: SocraticRequest): Promise<SocraticResponse> {
    const ctx = await ContextService.buildPromptContext(req);

    const userPrompt = `
Learner's Question: "${req.question}"
Requested Hint Level: ${req.hintLevel} (0 to 4)
Learning Mode: ${req.learningMode || 'tutorial'}

--- TUTORIAL CONTEXT ---
Tutorial Title: ${ctx.tutorialTitle}
Current Video Timestamp: ${ctx.formattedTime} (${ctx.currentTimestamp}s)

Surrounding Transcript Window:
${ctx.transcriptSnippet}

Learner's Notes:
${ctx.notesSnippet}

Active File & Code in Editor:
${ctx.codeSnippet}

Recent Terminal Output / Errors:
${ctx.terminalSnippet}
---

Provide a Socratic response that guides the learner to solve this without giving them the code solution.
`;

    if (!GeminiService.hasApiKey()) {
      // Fallback Socratic guidance if GEMINI_API_KEY is not set yet
      return {
        type: 'socratic_hint',
        hintLevel: req.hintLevel,
        question: `What specific data structure or output is expected at this step in ${ctx.tutorialTitle}?`,
        hint: `Think about the flow discussed around ${ctx.formattedTime}. Try breaking down the problem into input, transformation, and output steps before writing code.`,
        concept: 'Independent Problem Decomposition',
        relatedTimestamp: req.currentTimestamp,
      };
    }

    try {
      const response = await GeminiService.generateJson<SocraticResponse>(
        this.SYSTEM_PROMPT,
        userPrompt
      );

      return {
        type: 'socratic_hint',
        hintLevel: response.hintLevel !== undefined ? response.hintLevel : req.hintLevel,
        question: response.question || 'What do you expect the function to return here?',
        hint: response.hint || 'Consider how data flows through this part of your code.',
        concept: response.concept || 'Core Logic',
        relatedTimestamp: response.relatedTimestamp,
      };
    } catch (err: any) {
      console.warn('Socratic Gemini call failed, returning structured fallback:', err.message);
      return {
        type: 'socratic_hint',
        hintLevel: req.hintLevel,
        question: `Before implementing, what is the prerequisite state needed at ${ctx.formattedTime}?`,
        hint: `Consider how the tutorial structured this logic. What step must happen before processing the result?`,
        concept: 'Algorithmic Reasoning',
        relatedTimestamp: req.currentTimestamp,
      };
    }
  }
}
