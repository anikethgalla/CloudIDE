'use client';

import React, { useState } from 'react';
import {
  Layers,
  CheckSquare,
  Square,
  AlertTriangle,
  ListOrdered,
  FileCheck,
  Sparkles,
} from 'lucide-react';
import { RebuildSpecification } from '@cloud-ide/shared';
import { cn } from '@/lib/utils';

interface RebuildSpecViewProps {
  specification: RebuildSpecification;
}

export const RebuildSpecView: React.FC<RebuildSpecViewProps> = ({
  specification,
}) => {
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setCompletedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="h-full w-full flex flex-col bg-zinc-950 text-zinc-300 overflow-y-auto custom-scrollbar p-4 space-y-6 font-sans select-none">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/40 via-indigo-950/30 to-zinc-900 border border-sky-500/30 space-y-2 shadow-lg">
        <div className="flex items-center space-x-2 text-sky-400">
          <Sparkles className="w-5 h-5" />
          <span className="text-xs uppercase font-bold tracking-wider">
            Rebuild From Memory Mode
          </span>
        </div>
        <h2 className="text-base font-bold text-zinc-100">
          {specification.title}
        </h2>
        <p className="text-xs text-zinc-400 leading-relaxed">
          {specification.summary}
        </p>
      </div>

      {/* Features & Functional Requirements */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-xs font-bold text-zinc-200">
          <Layers className="w-4 h-4 text-sky-400" />
          <span>Functional Requirements</span>
        </div>

        <div className="space-y-3">
          {specification.features.map((feature, fIdx) => (
            <div
              key={fIdx}
              className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-2.5"
            >
              <h3 className="text-xs font-semibold text-zinc-100">
                {feature.title}
              </h3>

              <div className="space-y-2">
                {feature.requirements.map((req, rIdx) => {
                  const key = `f-${fIdx}-r-${rIdx}`;
                  const isDone = !!completedItems[key];
                  return (
                    <div
                      key={rIdx}
                      onClick={() => toggleItem(key)}
                      className="flex items-start space-x-2.5 cursor-pointer group"
                    >
                      <button className="mt-0.5 text-zinc-500 group-hover:text-sky-400 transition-colors">
                        {isDone ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                      <span
                        className={cn(
                          'text-xs leading-relaxed transition-all',
                          isDone ? 'text-zinc-500 line-through' : 'text-zinc-300'
                        )}
                      >
                        {req}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Architecture Steps */}
      {specification.recommendedSteps && specification.recommendedSteps.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-zinc-200">
            <ListOrdered className="w-4 h-4 text-amber-400" />
            <span>Recommended Construction Milestones</span>
          </div>

          <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-2 text-xs text-zinc-300">
            {specification.recommendedSteps.map((step, idx) => (
              <div key={idx} className="flex items-start space-x-2">
                <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-mono flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <p className="leading-relaxed">{step.replace(/^\d+\.\s*/, '')}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edge Cases to Handle */}
      {specification.edgeCases && specification.edgeCases.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Edge Cases to Verify</span>
          </div>

          <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-1.5 text-xs text-zinc-300">
            {specification.edgeCases.map((ec, idx) => (
              <div key={idx} className="flex items-start space-x-2">
                <span className="text-amber-400 mt-1">•</span>
                <p>{ec}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
