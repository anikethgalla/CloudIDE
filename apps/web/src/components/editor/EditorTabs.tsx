'use client';

import React from 'react';
import { X, Circle } from 'lucide-react';
import { EditorTab } from '@cloud-ide/shared';
import { getFileIcon } from '@/lib/fileIcons';
import { cn } from '@/lib/utils';

interface EditorTabsProps {
  tabs: EditorTab[];
  activeTabId: string | null;
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tabId: string, e?: React.MouseEvent) => void;
  onCloseOthers?: (tabId: string) => void;
  onCloseAll?: () => void;
}

export const EditorTabs: React.FC<EditorTabsProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
}) => {
  if (tabs.length === 0) return null;

  return (
    <div className="h-9 bg-ide-activity border-b border-ide-border flex items-center overflow-x-auto select-none no-scrollbar z-10">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;

        return (
          <div
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            onAuxClick={(e) => {
              // Middle-click to close
              if (e.button === 1) {
                e.preventDefault();
                onCloseTab(tab.id, e);
              }
            }}
            className={cn(
              'group h-full flex items-center space-x-2 px-3 border-r border-ide-border cursor-pointer text-xs transition-colors shrink-0 max-w-[200px]',
              isActive
                ? 'bg-ide-editor text-zinc-100 border-t-2 border-t-sky-500 font-medium'
                : 'bg-ide-sidebar/70 text-zinc-400 hover:bg-ide-sidebar hover:text-zinc-200'
            )}
            title={tab.filePath}
          >
            {/* File Icon */}
            <span>{getFileIcon(tab.name, false)}</span>

            {/* Tab Name */}
            <span className="truncate flex-1">{tab.name}</span>

            {/* Close Button / Dirty Indicator */}
            <div
              className="w-4 h-4 flex items-center justify-center rounded hover:bg-zinc-700/60 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(tab.id, e);
              }}
            >
              {tab.isDirty ? (
                <span className="w-2 h-2 rounded-full bg-sky-400 group-hover:hidden" />
              ) : null}
              <X
                className={cn(
                  'w-3 h-3 text-zinc-400 hover:text-zinc-100',
                  tab.isDirty ? 'hidden group-hover:block' : 'opacity-0 group-hover:opacity-100'
                )}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
