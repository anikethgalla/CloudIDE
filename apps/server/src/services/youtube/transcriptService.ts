import { spawn, spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { TranscriptSegment } from '@cloud-ide/shared';

export interface FetchedTranscriptResult {
  videoId: string;
  language: string;
  languageCode: string;
  isGenerated: boolean;
  segments: TranscriptSegment[];
}

export class TranscriptService {
  private static resolvedPythonPath: string | null = null;

  /**
   * Discovers a Python executable that has youtube_transcript_api installed.
   */
  static getPythonExecutable(): string {
    if (this.resolvedPythonPath) {
      return this.resolvedPythonPath;
    }

    const candidates: string[] = [];

    // 1. Explicit environment variable
    if (process.env.PYTHON_PATH) {
      candidates.push(process.env.PYTHON_PATH);
    }

    // 2. Windows standard python installation locations
    const localAppData = process.env.LOCALAPPDATA || 'C:\\Users\\Aniketh Galla\\AppData\\Local';
    const pyDirs = ['Python311', 'Python312', 'Python310', 'Python313', 'Python39'];
    for (const ver of pyDirs) {
      candidates.push(path.join(localAppData, 'Programs', 'Python', ver, 'python.exe'));
    }

    // 3. Common system names
    candidates.push('py', 'python3', 'python');

    for (const candidate of candidates) {
      try {
        if (candidate.includes('\\') || candidate.includes('/')) {
          if (!fs.existsSync(candidate)) continue;
        }

        const testArgs = candidate === 'py' ? ['-3', '-c', 'import youtube_transcript_api'] : ['-c', 'import youtube_transcript_api'];
        const res = spawnSync(candidate, testArgs, { timeout: 3000, encoding: 'utf-8' });
        if (res.status === 0) {
          this.resolvedPythonPath = candidate;
          console.log(`[TranscriptService] Using verified Python executable: ${candidate}`);
          return candidate;
        }
      } catch {
        // Continue probing
      }
    }

    // Default fallback
    this.resolvedPythonPath = process.env.PYTHON_PATH || 'python';
    return this.resolvedPythonPath;
  }

  /**
   * Fetches transcript for a YouTube video using the youtube-transcript-api Python module.
   * Preserves exact timestamps, duration, and text snippets.
   */
  static async fetchTranscript(
    videoId: string,
    languages: string[] = ['en']
  ): Promise<FetchedTranscriptResult> {
    return new Promise((resolve, reject) => {
      // Python script snippet that calls youtube-transcript-api exactly as documented
      const pyScript = `
import json
import sys
from youtube_transcript_api import YouTubeTranscriptApi

video_id = sys.argv[1]
languages = sys.argv[2].split(',') if len(sys.argv) > 2 and sys.argv[2] else ['en']

try:
    ytt_api = YouTubeTranscriptApi()
    
    # Try fetching with preferred languages
    try:
        fetched = ytt_api.fetch(video_id, languages=languages)
        is_gen = False
        lang_code = languages[0]
    except Exception:
        # Fallback: list available transcripts and fetch the first available one
        transcript_list = ytt_api.list(video_id)
        transcript = None
        
        # Try finding manually created or generated
        try:
            transcript = transcript_list.find_transcript(languages)
        except Exception:
            # Pick whatever is available
            for t in transcript_list:
                transcript = t
                break
                
        if transcript:
            fetched = transcript.fetch()
            is_gen = getattr(transcript, 'is_generated', False)
            lang_code = getattr(transcript, 'language_code', 'en')
        else:
            raise Exception("No transcript found for video " + video_id)
            
    raw_data = fetched.to_raw_data() if hasattr(fetched, 'to_raw_data') else [
        {'text': s.text, 'start': s.start, 'duration': s.duration} for s in fetched
    ]
    
    output = {
        'status': 'success',
        'videoId': video_id,
        'languageCode': lang_code,
        'isGenerated': is_gen,
        'snippets': raw_data
    }
    print(json.dumps(output))
except Exception as e:
    err_output = {
        'status': 'error',
        'message': str(e)
    }
    print(json.dumps(err_output))
`;

      const pyExe = this.getPythonExecutable();
      const spawnArgs = pyExe === 'py'
        ? ['-3', '-c', pyScript, videoId, languages.join(',')]
        : ['-c', pyScript, videoId, languages.join(',')];

      const pyProcess = spawn(pyExe, spawnArgs, {
        env: {
          ...process.env,
          PYTHONIOENCODING: 'utf-8',
        },
      });

      let stdout = '';
      let stderr = '';

      pyProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pyProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pyProcess.on('close', (code) => {
        if (code !== 0 && !stdout) {
          return reject(
            new Error(
              `Failed to execute transcript extractor: ${stderr || 'Unknown Python process failure'}`
            )
          );
        }

        try {
          const result = JSON.parse(stdout.trim());
          if (result.status === 'error') {
            return reject(new Error(result.message || 'No transcript available for this video.'));
          }

          const segments: TranscriptSegment[] = (result.snippets || []).map(
            (item: any, idx: number) => ({
              id: `ts-${idx + 1}`,
              text: (item.text || '').replace(/\n/g, ' ').trim(),
              start: parseFloat(Number(item.start || 0).toFixed(2)),
              duration: parseFloat(Number(item.duration || 0).toFixed(2)),
            })
          );

          resolve({
            videoId,
            language: result.languageCode || 'English',
            languageCode: result.languageCode || 'en',
            isGenerated: !!result.isGenerated,
            segments,
          });
        } catch (parseErr) {
          reject(
            new Error(
              `Malformed transcript response: ${stdout.slice(0, 200)}... (${stderr})`
            )
          );
        }
      });
    });
  }

  /**
   * Helper to retrieve a context window of transcript segments surrounding a given timestamp.
   * e.g., radiusSeconds = 30 retrieves segments in [targetTimestamp - 30, targetTimestamp + 30].
   */
  static getContextWindow(
    segments: TranscriptSegment[],
    targetTimestamp: number,
    radiusSeconds = 35
  ): TranscriptSegment[] {
    const minTime = Math.max(0, targetTimestamp - radiusSeconds);
    const maxTime = targetTimestamp + radiusSeconds;

    return segments.filter(
      (seg) => seg.start + seg.duration >= minTime && seg.start <= maxTime
    );
  }

  /**
   * Search transcript for keywords.
   */
  static searchTranscript(
    segments: TranscriptSegment[],
    query: string
  ): TranscriptSegment[] {
    if (!query || !query.trim()) return [];
    const q = query.toLowerCase().trim();
    return segments.filter((seg) => seg.text.toLowerCase().includes(q));
  }
}
