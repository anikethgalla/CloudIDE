'use client';

import React from 'react';
import { CheckCircle2, Circle, Clock, Target, ArrowRight } from 'lucide-react';
import { LearningCheckpoint } from '@cloud-ide/shared';
import { ApiClient } from '@/services/api';
import { cn } from '@/lib/utils';

interface CheckpointsListProps {
  projectId: string;
  checkpoints: LearningCheckpoint[];
  currentTime: number;
  onSeek: (seconds: number) => void;
  onToggleComplete: (checkpointId: string, completed: boolean) => void;
}

export const CheckpointsList: React.FC<CheckpointsListProps> = ({
  projectId,
  checkpoints,
  currentTime,
  onSeek,
  onToggleComplete,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const completedCount = checkpoints.filter((c) => c.completed).length;
  const progressPercent =
    checkpoints.length > 0 ? Math.round((completedCount / checkpoints.length) * 100) : 0;

  return (
    <div className="h-full w-full flex flex-col bg-zinc-950 text-zinc-300 select-none overflow-hidden font-sans">
      {/* Header with Progress Bar */}
      <div className="p-3 bg-zinc-900 border-b border-ide-border shrink-0 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-sky-400" />
            <span className="font-semibold text-zinc-100">Learning Checkpoints</span>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">
            {completedCount} / {checkpoints.length} ({progressPercent}%)
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-sky-500 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-2.5">
        {checkpoints.map((cp, idx) => {
          const isPassed = currentTime >= cp.timestamp;
          return (
            <div
              key={cp.id}
              className={cn(
                'p-3 rounded-xl border transition-all space-y-2',
                cp.completed
                  ? 'bg-emerald-500/5 border-emerald-500/30'
                  : isPassed
                  ? 'bg-zinc-900 border-sky-500/30'
                  : 'bg-zinc-900/40 border-zinc-800/80 text-zinc-400'
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onToggleComplete(cp.id, !cp.completed)}
                    className="mt-0.5 text-zinc-400 hover:text-emerald-400 transition-colors"
                  >
                    {cp.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </button>

                  <div>
                    <h4
                      className={cn(
                        'text-xs font-semibold',
                        cp.completed ? 'text-emerald-300 line-through' : 'text-zinc-200'
                      )}
                    >
                      {cp.title}
                    </h4>
                    <span className="text-[10px] text-zinc-500 uppercase font-mono">
                      {cp.concept}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onSeek(cp.timestamp)}
                  className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] text-sky-400 font-mono transition-colors"
                  title="Seek video to checkpoint"
                >
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(cp.timestamp)}</span>
                </button>
              </div>

              {/* Challenge description */}
              <div className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800/80 text-[11px] text-zinc-300 leading-relaxed">
                <span className="text-amber-400 font-semibold block mb-0.5">
                  Recall Challenge:
                </span>
                {cp.challenge}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
