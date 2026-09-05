import { spawn } from 'child_process';
import { TranscriptSegment } from '@cloud-ide/shared';

export interface FetchedTranscriptResult {
  videoId: string;
  language: string;
  languageCode: string;
  isGenerated: boolean;
  segments: TranscriptSegment[];
}

export class TranscriptService {
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

      const pyProcess = spawn('python', ['-c', pyScript, videoId, languages.join(',')], {
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
