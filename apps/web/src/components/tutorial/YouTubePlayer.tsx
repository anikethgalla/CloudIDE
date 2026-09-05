'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Zap,
  EyeOff,
  Video,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface YouTubePlayerProps {
  videoId: string;
  currentTime: number;
  onTimeUpdate: (seconds: number) => void;
  onPlayerReady?: () => void;
  isBlindfolded?: boolean;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  currentTime,
  onTimeUpdate,
  onPlayerReady,
  isBlindfolded = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const timeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSeekTimestampRef = useRef<number>(0);

  // Initialize YouTube IFrame Player API
  useEffect(() => {
    let isMounted = true;

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return;

      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (_) {}
      }

      playerRef.current = new window.YT.Player(`yt-player-${videoId}`, {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            if (!isMounted) return;
            setIsReady(true);
            setDuration(event.target.getDuration() || 0);
            onPlayerReady?.();
          },
          onStateChange: (event: any) => {
            if (!isMounted) return;
            // YT.PlayerState.PLAYING = 1, PAUSED = 2
            if (event.data === 1) {
              setIsPlaying(true);
            } else {
              setIsPlaying(false);
            }
          },
        },
      });
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = initPlayer;
    } else {
      initPlayer();
    }

    // High frequency time updater
    timeIntervalRef.current = setInterval(() => {
      // Don't overwrite if an external seek was requested in the last 600ms
      if (Date.now() - lastSeekTimestampRef.current < 600) return;

      if (playerRef.current && playerRef.current.getCurrentTime) {
        try {
          const t = playerRef.current.getCurrentTime();
          if (typeof t === 'number') {
            onTimeUpdate(t);
          }
        } catch (_) {}
      }
    }, 250);

    return () => {
      isMounted = false;
      if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (_) {}
      }
    };
  }, [videoId]);

  // Handle external seek requests (e.g. from notes or transcript clicks)
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.seekTo === 'function' && isReady) {
      try {
        const current = playerRef.current.getCurrentTime ? playerRef.current.getCurrentTime() : 0;
        if (Math.abs(current - currentTime) > 1.0) {
          lastSeekTimestampRef.current = Date.now();
          playerRef.current.seekTo(currentTime, true);
        }
      } catch (_) {}
    }
  }, [currentTime, isReady]);

  // Handle blindfold pause
  useEffect(() => {
    if (isBlindfolded && playerRef.current && playerRef.current.pauseVideo) {
      try {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } catch (_) {}
    }
  }, [isBlindfolded]);

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const seekRelative = (deltaSeconds: number) => {
    if (!playerRef.current || !playerRef.current.getCurrentTime) return;
    const current = playerRef.current.getCurrentTime();
    playerRef.current.seekTo(Math.max(0, current + deltaSeconds), true);
  };

  const cycleSpeed = () => {
    if (!playerRef.current) return;
    const speeds = [1, 1.25, 1.5, 1.75, 2];
    const nextIndex = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextSpeed = speeds[nextIndex];
    playerRef.current.setPlaybackRate(nextSpeed);
    setPlaybackRate(nextSpeed);
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const totalSecs = Math.floor(seconds);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full flex flex-col bg-zinc-950 border-b border-ide-border overflow-hidden select-none">
      {/* Player Container */}
      <div className="relative aspect-video w-full bg-black overflow-hidden group">
        <div id={`yt-player-${videoId}`} className="w-full h-full" />

        {/* Blindfold Blur Effect if Active */}
        {isBlindfolded && (
          <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 shadow-lg">
              <EyeOff className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-zinc-100 mb-1">
              Blindfold Mode Active
            </h4>
            <p className="text-xs text-zinc-400 max-w-xs mb-4">
              Video is paused while you code. Recall and implement the concept from memory!
            </p>
            <div className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
              Stop typing to resume tutorial video
            </div>
          </div>
        )}
      </div>

      {/* Mini Control Bar */}
      <div className="h-8 px-3 bg-zinc-900 border-t border-ide-border flex items-center justify-between text-xs text-zinc-300">
        <div className="flex items-center space-x-2">
          <button
            onClick={togglePlay}
            disabled={isBlindfolded}
            className="p-1 hover:text-white transition-colors disabled:opacity-40"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
          </button>

          <button
            onClick={() => seekRelative(-10)}
            className="p-1 hover:text-white transition-colors text-zinc-400"
            title="Rewind 10s"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <span className="text-[11px] font-mono text-zinc-400 ml-1">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={cycleSpeed}
            className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] font-mono font-medium text-zinc-300 transition-colors"
            title="Playback Speed"
          >
            {playbackRate}x
          </button>

          <button
            onClick={toggleMute}
            className="p-1 hover:text-white transition-colors text-zinc-400"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
