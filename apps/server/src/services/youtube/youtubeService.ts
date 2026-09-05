export class YouTubeService {
  /**
   * Extracts the 11-character YouTube video ID from various URL formats.
   * Supports:
   * - https://www.youtube.com/watch?v=VIDEO_ID
   * - https://youtu.be/VIDEO_ID
   * - https://www.youtube.com/embed/VIDEO_ID
   * - https://www.youtube.com/v/VIDEO_ID
   * - https://youtube.com/shorts/VIDEO_ID
   * - Raw 11-character video IDs
   */
  static extractVideoId(urlOrId: string): string | null {
    if (!urlOrId || typeof urlOrId !== 'string') return null;

    const trimmed = urlOrId.trim();

    // Direct 11-character alphanumeric/dash/underscore ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return trimmed;
    }

    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = trimmed.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Fetches video title and thumbnail using YouTube's official oEmbed API without requiring an API key.
   */
  static async fetchVideoMetadata(videoId: string): Promise<{
    title: string;
    thumbnailUrl: string;
    authorName: string;
  }> {
    const videoUrl = `https://www.youtube.com/watch?v=v=${videoId}`;
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

    try {
      const res = await fetch(oembedUrl);
      if (!res.ok) {
        throw new Error(`oEmbed request failed with status ${res.status}`);
      }
      const data = (await res.json()) as any;
      return {
        title: data.title || `YouTube Tutorial (${videoId})`,
        thumbnailUrl:
          data.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        authorName: data.author_name || 'YouTube Creator',
      };
    } catch (err: any) {
      // Fallback metadata if oEmbed fails or is offline
      return {
        title: `YouTube Tutorial (${videoId})`,
        thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        authorName: 'YouTube Creator',
      };
    }
  }
}
