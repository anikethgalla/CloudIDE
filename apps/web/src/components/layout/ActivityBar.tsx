'use client';

import React from 'react';
import {
  Files,
  Search,
  Settings,
  HelpCircle,
  PlaySquare,
  TerminalSquare,
  Layers,
} from 'lucide-react';
import { ActiveSidePanel } from '@/types';
import { cn } from '@/lib/utils';

interface ActivityBarProps {
  activePanel: ActiveSidePanel | null;
  onSelectPanel: (panel: ActiveSidePanel) => void;
  onOpenShortcuts: () => void;
  onOpenSettings: () => void;
}

export const ActivityBar: React.FC<ActivityBarProps> = ({
  activePanel,
  onSelectPanel,
  onOpenShortcuts,
  onOpenSettings,
}) => {
  return (
    <aside className="w-12 bg-ide-activity border-r border-ide-border flex flex-col justify-between py-2 items-center shrink-0 select-none z-20">
      {/* Top Icons */}
      <div className="flex flex-col space-y-2 w-full items-center">
        <button
          onClick={() => onSelectPanel('explorer')}
          className={cn(
            'relative w-10 h-10 flex items-center justify-center rounded-lg transition-colors group',
            activePanel === 'explorer'
              ? 'text-zinc-100 bg-zinc-800/80'
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40'
          )}
          title="Explorer (Ctrl + Shift + E)"
        >
          {activePanel === 'explorer' && (
            <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-sky-500 rounded-r" />
          )}
          <Files className="w-5 h-5" />
        </button>

        <button
          onClick={() => onSelectPanel('search')}
          className={cn(
            'relative w-10 h-10 flex items-center justify-center rounded-lg transition-colors group',
            activePanel === 'search'
              ? 'text-zinc-100 bg-zinc-800/80'
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40'
          )}
          title="Search in Files (Ctrl + Shift + F)"
        >
          {activePanel === 'search' && (
            <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-sky-500 rounded-r" />
          )}
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Icons */}
      <div className="flex flex-col space-y-2 w-full items-center">
        <button
          onClick={onOpenShortcuts}
          className="w-10 h-10 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40 transition-colors"
          title="Keyboard Shortcuts & Help"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        <button
          onClick={onOpenSettings}
          className="w-10 h-10 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40 transition-colors"
          title="IDE Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
};
