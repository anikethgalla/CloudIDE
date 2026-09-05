'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Clock, PlayCircle, Copy, Check, Lock, Unlock } from 'lucide-react';
import { TranscriptSegment } from '@cloud-ide/shared';
import { cn } from '@/lib/utils';

interface TranscriptPanelProps {
  segments: TranscriptSegment[];
  currentTime: number;
  onSeek: (seconds: number) => void;
}

export const TranscriptPanel: React.FC<TranscriptPanelProps> = ({
  segments,
  currentTime,
  onSeek,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);

  // Filter segments if search query is active
  const filteredSegments = searchQuery.trim()
    ? segments.filter((seg) =>
        seg.text.toLowerCase().includes(searchQuery.toLowerCase().trim())
      )
    : segments;

  // Find active segment
  const activeSegment = segments.find(
    (seg) => currentTime >= seg.start && currentTime < seg.start + seg.duration
  );

  // Auto-scroll to active segment
  useEffect(() => {
    if (autoScroll && activeItemRef.current && !searchQuery) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeSegment?.id, autoScroll, searchQuery]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleCopy = (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="h-full w-full flex flex-col bg-zinc-950 text-zinc-300 select-none overflow-hidden font-sans">
      {/* Search & Header Bar */}
      <div className="p-2.5 bg-zinc-900 border-b border-ide-border flex items-center space-x-2 shrink-0">
        <div className="flex-1 relative flex items-center">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5" />
          <input
            type="text"
            placeholder="Search transcript keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-md pl-8 pr-3 py-1 text-xs text-zinc-200 outline-none focus:border-sky-500 transition-colors"
          />
        </div>

        <button
          onClick={() => setAutoScroll(!autoScroll)}
          className={cn(
            'p-1.5 rounded-md border text-xs transition-colors',
            autoScroll
              ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
              : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200'
          )}
          title={autoScroll ? 'Auto-scroll is ON' : 'Auto-scroll is OFF'}
        >
          {autoScroll ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Snippets List */}
      <div
        ref={listRef}
        className="flex-1 p-2 overflow-y-auto custom-scrollbar space-y-1"
      >
        {filteredSegments.length > 0 ? (
          filteredSegments.map((seg) => {
            const isActive = activeSegment?.id === seg.id;
            return (
              <div
                key={seg.id}
                ref={isActive ? activeItemRef : null}
                onClick={() => onSeek(seg.start)}
                className={cn(
                  'group p-2 rounded-lg cursor-pointer transition-all duration-150 text-xs flex items-start space-x-2.5',
                  isActive
                    ? 'bg-sky-500/15 border border-sky-500/40 text-sky-200 shadow-sm'
                    : 'hover:bg-zinc-900 border border-transparent text-zinc-400 hover:text-zinc-200'
                )}
              >
                {/* Timestamp Pill */}
                <span
                  className={cn(
                    'font-mono text-[11px] px-1.5 py-0.5 rounded shrink-0 flex items-center gap-1 transition-colors',
                    isActive
                      ? 'bg-sky-500 text-white font-semibold'
                      : 'bg-zinc-900 group-hover:bg-zinc-800 text-zinc-400'
                  )}
                >
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(seg.start)}</span>
                </span>

                {/* Text Content */}
                <p className="flex-1 text-xs leading-relaxed select-text">{seg.text}</p>

                {/* Action Buttons */}
                <button
                  onClick={(e) => handleCopy(seg.text, seg.id, e)}
                  className="p-1 opacity-0 group-hover:opacity-100 hover:text-zinc-100 transition-opacity"
                  title="Copy snippet"
                >
                  {copiedId === seg.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-zinc-500" />
                  )}
                </button>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-zinc-500 text-xs">
            No matching transcript snippets found for &quot;{searchQuery}&quot;
          </div>
        )}
      </div>
    </div>
  );
};
