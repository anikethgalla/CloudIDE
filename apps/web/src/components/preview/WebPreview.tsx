'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  RotateCw,
  ExternalLink,
  Smartphone,
  Tablet,
  Monitor,
  Globe,
  Loader2,
  Terminal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WebPreviewProps {
  projectId: string;
  previewUrl?: string | null;
  htmlContent?: string;
  isDevServerRunning?: boolean;
}

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export const WebPreview: React.FC<WebPreviewProps> = ({
  projectId,
  previewUrl,
  htmlContent,
  isDevServerRunning = false,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [key, setKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const refreshPreview = () => {
    setIsLoading(true);
    setKey((prev) => prev + 1);
  };

  const getContainerWidth = () => {
    switch (deviceMode) {
      case 'mobile':
        return 'max-w-[375px]';
      case 'tablet':
        return 'max-w-[768px]';
      default:
        return 'w-full';
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-zinc-950 border-l border-ide-border overflow-hidden">
      {/* Browser Bar */}
      <div className="h-9 px-3 bg-zinc-900 border-b border-ide-border flex items-center justify-between space-x-2 select-none shrink-0">
        <div className="flex items-center space-x-1.5">
          <button
            onClick={refreshPreview}
            className="p-1 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors text-zinc-400"
            title="Reload Preview"
          >
            <RotateCw className={cn('w-3.5 h-3.5', isLoading && 'animate-spin')} />
          </button>
        </div>

        {/* Address Bar */}
        <div className="flex-1 max-w-md mx-2 flex items-center bg-zinc-950 border border-zinc-800 rounded-md px-2.5 py-1 text-xs text-zinc-400 font-mono">
          <Globe className="w-3 h-3 text-emerald-400 mr-2 shrink-0" />
          <span className="truncate text-zinc-300">
            {previewUrl || `preview://${projectId}.local`}
          </span>
        </div>

        {/* Device Controls & External Link */}
        <div className="flex items-center space-x-1 text-zinc-400">
          <button
            onClick={() => setDeviceMode('desktop')}
            className={cn(
              'p-1 rounded transition-colors',
              deviceMode === 'desktop'
                ? 'text-sky-400 bg-zinc-800'
                : 'hover:text-zinc-200'
            )}
            title="Desktop View"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeviceMode('tablet')}
            className={cn(
              'p-1 rounded transition-colors',
              deviceMode === 'tablet'
                ? 'text-sky-400 bg-zinc-800'
                : 'hover:text-zinc-200'
            )}
            title="Tablet View"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeviceMode('mobile')}
            className={cn(
              'p-1 rounded transition-colors',
              deviceMode === 'mobile'
                ? 'text-sky-400 bg-zinc-800'
                : 'hover:text-zinc-200'
            )}
            title="Mobile View"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>

          {previewUrl && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors ml-1"
              title="Open Preview in New Tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Frame Viewer */}
      <div className="flex-1 bg-zinc-900/50 flex items-center justify-center p-2 overflow-auto">
        <div
          className={cn(
            'h-full bg-white transition-all shadow-2xl rounded overflow-hidden relative flex flex-col',
            getContainerWidth()
          )}
        >
          {previewUrl ? (
            <iframe
              key={key}
              ref={iframeRef}
              src={previewUrl}
              onLoad={() => setIsLoading(false)}
              className="w-full h-full border-none bg-white"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
              title="Live Project Preview"
            />
          ) : htmlContent ? (
            <iframe
              key={key}
              ref={iframeRef}
              srcDoc={htmlContent}
              onLoad={() => setIsLoading(false)}
              className="w-full h-full border-none bg-white"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
              title="Live Static Preview"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 text-zinc-400 p-6 text-center">
              <Globe className="w-10 h-10 text-zinc-600 mb-3" />
              <h4 className="text-sm font-medium text-zinc-200 mb-1">
                Preview Not Started
              </h4>
              <p className="text-xs text-zinc-500 max-w-xs">
                For web projects, click Run or start the dev server to view the live preview.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
