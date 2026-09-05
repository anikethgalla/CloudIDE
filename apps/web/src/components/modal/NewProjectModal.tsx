'use client';

import React, { useState } from 'react';
import {
  X,
  Code2,
  FileCode,
  Flame,
  Globe,
  Terminal,
  Layers,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { PROJECT_TEMPLATES } from '@cloud-ide/shared';
import { TemplateId } from '@cloud-ide/shared';
import { cn } from '@/lib/utils';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, template: TemplateId, description?: string) => Promise<void>;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('nodejs');
  const [projectName, setProjectName] = useState('my-awesome-project');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) {
      setError('Please provide a project name.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onCreate(projectName.trim(), selectedTemplate, description.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTemplateIcon = (id: TemplateId) => {
    switch (id) {
      case 'nodejs':
        return <FileCode className="w-5 h-5 text-yellow-400" />;
      case 'python':
        return <Terminal className="w-5 h-5 text-emerald-400" />;
      case 'cpp':
        return <Code2 className="w-5 h-5 text-blue-400" />;
      case 'java':
        return <Flame className="w-5 h-5 text-orange-400" />;
      case 'html':
        return <Globe className="w-5 h-5 text-orange-400" />;
      case 'react':
        return <Sparkles className="w-5 h-5 text-cyan-400" />;
      case 'nextjs':
        return <Layers className="w-5 h-5 text-white" />;
      default:
        return <Code2 className="w-5 h-5 text-zinc-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100">Create New Project</h3>
              <p className="text-xs text-zinc-400">Select a runtime or framework template</p>
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-400">
              {error}
            </div>
          )}

          {/* Project Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. data-analyzer, web-app"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-sky-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Description (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description of this project"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-sky-500 transition-colors"
              />
            </div>
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-2">
              Select Language / Template
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PROJECT_TEMPLATES.map((tpl) => {
                const isSelected = selectedTemplate === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl.id)}
                    className={cn(
                      'p-3.5 rounded-xl border cursor-pointer transition-all flex items-start space-x-3',
                      isSelected
                        ? 'bg-sky-500/10 border-sky-500 shadow-md ring-1 ring-sky-500'
                        : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/40'
                    )}
                  >
                    <div className="mt-0.5 p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                      {getTemplateIcon(tpl.id)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-100">
                          {tpl.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2">
                        {tpl.description}
                      </p>
                    </div>
                  </div>
                );
              })}
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
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-md transition-all active:scale-95"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isSubmitting ? 'Creating...' : 'Create Project'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
