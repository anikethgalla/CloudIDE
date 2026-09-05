'use client';

import React, { useState } from 'react';
import {
  X,
  Youtube,
  Sparkles,
  Layers,
  FileCode,
  Terminal,
  Code2,
  Globe,
  Flame,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { TemplateId, PROJECT_TEMPLATES } from '@cloud-ide/shared';
import { cn } from '@/lib/utils';

interface ImportTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (payload: {
    url: string;
    template?: TemplateId;
    languageCode?: string;
    customName?: string;
  }) => Promise<void>;
}

export const ImportTutorialModal: React.FC<ImportTutorialModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [url, setUrl] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId | 'auto'>('auto');
  const [languageCode, setLanguageCode] = useState('en');
  const [customName, setCustomName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Extract video ID preview
  const extractId = (u: string) => {
    const trimmed = u.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
    const match = trimmed.match(
      /(?:youtube\.com\/watch\?.*v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : null;
  };

  const detectedVideoId = extractId(url);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please provide a valid YouTube URL or Video ID.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await onImport({
        url: url.trim(),
        template: selectedTemplate === 'auto' ? undefined : selectedTemplate,
        languageCode,
        customName: customName.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to import YouTube tutorial');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 shadow-sm">
              <Youtube className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100">
                Start YouTube Tutorial
              </h3>
              <p className="text-xs text-zinc-400">
                Project Breakout workspace with timestamped transcript &amp; Socratic AI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-400">
              {error}
            </div>
          )}

          {/* YouTube URL Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-200">
              YouTube Video URL or ID
            </label>
            <input
              type="text"
              autoFocus
              placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-rose-500 transition-colors"
              required
            />
            {detectedVideoId && (
              <div className="flex items-center space-x-1.5 text-[11px] text-emerald-400 pt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Detected Video ID: <code>{detectedVideoId}</code></span>
              </div>
            )}
          </div>

          {/* Custom Project Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-200">
              Workspace Name (Optional)
            </label>
            <input
              type="text"
              placeholder="Leave blank to auto-name from YouTube video title"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          {/* Language & Template Options */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
                Transcript Language
              </label>
              <select
                value={languageCode}
                onChange={(e) => setLanguageCode(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none focus:border-sky-500 transition-colors"
              >
                <option value="en">English (Default)</option>
                <option value="es">Spanish (Español)</option>
                <option value="hi">Hindi (हिन्दी)</option>
                <option value="de">German (Deutsch)</option>
                <option value="fr">French (Français)</option>
                <option value="pt">Portuguese (Português)</option>
                <option value="ja">Japanese (日本語)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
                Starter Template
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none focus:border-sky-500 transition-colors"
              >
                <option value="auto">Auto-detect from title</option>
                <option value="react">React (Vite)</option>
                <option value="nextjs">Next.js 14</option>
                <option value="nodejs">Node.js</option>
                <option value="python">Python 3</option>
                <option value="cpp">C++ (GCC)</option>
                <option value="java">Java (OpenJDK)</option>
                <option value="html">HTML / CSS / JS</option>
              </select>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-950/60 border-t border-zinc-800 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading || !url.trim()}
            className="flex items-center space-x-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-md transition-all active:scale-95"
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isLoading ? 'Importing & Extracting...' : 'Launch Learning Workspace'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
