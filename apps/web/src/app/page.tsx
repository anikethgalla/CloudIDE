'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Code2,
  Plus,
  Trash2,
  Calendar,
  Layers,
  Sparkles,
  Terminal,
  FileCode,
  Flame,
  Globe,
  Loader2,
  FolderOpen,
  ArrowRight,
  Youtube,
  GraduationCap,
  PlayCircle,
} from 'lucide-react';
import { Project, ProjectTemplate, TemplateId, PROJECT_TEMPLATES } from '@cloud-ide/shared';
import { ApiClient } from '@/services/api';
import { NewProjectModal } from '@/components/modal/NewProjectModal';
import { ImportTutorialModal } from '@/components/modal/ImportTutorialModal';

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const list = await ApiClient.getProjects();
      setProjects(list);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateStandardProject = async (
    name: string,
    template: TemplateId,
    description?: string
  ) => {
    const newProject = await ApiClient.createProject({ name, template, description });
    router.push(`/ide/${newProject.id}`);
  };

  const handleImportTutorial = async (payload: {
    url: string;
    template?: TemplateId;
    languageCode?: string;
    customName?: string;
  }) => {
    const newProject = await ApiClient.importTutorial(payload);
    router.push(`/ide/${newProject.id}`);
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this workspace?')) return;

    try {
      setDeletingId(id);
      await ApiClient.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert('Failed to delete workspace');
    } finally {
      setDeletingId(null);
    }
  };

  const getTemplateIcon = (tpl: TemplateId) => {
    switch (tpl) {
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col overflow-y-auto font-sans">
      {/* Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-sm">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                Project <span className="text-sky-400">Breakout</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  Active Recall
                </span>
              </span>
              <span className="text-xs text-zinc-400 block -mt-0.5">
                Escape Tutorial Hell • Code From First Principles
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center space-x-2 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg shadow-lg transition-all active:scale-95"
            >
              <Youtube className="w-4 h-4" />
              <span>Start Tutorial</span>
            </button>

            <button
              onClick={() => setIsNewProjectModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold rounded-lg transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Empty Project</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-10 flex-1 w-full space-y-12">
        {/* Hero Banner: Project Breakout Philosophy */}
        <section className="p-6 rounded-2xl bg-gradient-to-r from-sky-950/40 via-indigo-950/30 to-zinc-900 border border-sky-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-4 h-4" />
              <span>The Active-Learning Paradigm</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Turn passive tutorial watching into permanent retention.
            </h1>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Import any YouTube tutorial. Project Breakout syncs the timestamped transcript, activates <strong>Blindfold Mode</strong> while you code, provides <strong>Socratic AI hints</strong>, and lets you <strong>Rebuild from Memory</strong>.
            </p>
          </div>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-xs font-bold rounded-xl shadow-lg transition-all active:scale-95 shrink-0"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Paste YouTube URL</span>
          </button>
        </section>

        {/* Existing Projects / Workspaces Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-zinc-100">Your Workspaces</h2>
            <span className="text-xs text-zinc-500">
              {projects.length} {projects.length === 1 ? 'workspace' : 'workspaces'} found
            </span>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-zinc-500 flex flex-col items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-sky-400 mb-2" />
              <p className="text-xs">Loading workspaces...</p>
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((proj) => (
                <Link
                  key={proj.id}
                  href={`/ide/${proj.id}`}
                  className="group p-5 bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all duration-150 hover:shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                          {getTemplateIcon(proj.template)}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-zinc-200 group-hover:text-sky-300 transition-colors line-clamp-1">
                            {proj.name}
                          </h3>
                          <div className="flex items-center space-x-1.5 mt-0.5">
                            <span className="text-[10px] text-zinc-500 uppercase font-mono">
                              {proj.template}
                            </span>
                            {proj.description?.includes('Project Breakout') && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
                                Tutorial
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDeleteProject(proj.id, e)}
                        disabled={deletingId === proj.id}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete Workspace"
                      >
                        {deletingId === proj.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {proj.description && (
                      <p className="text-xs text-zinc-400 mt-3 line-clamp-2">
                        {proj.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(proj.updatedAt || proj.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className="text-sky-400 font-medium group-hover:translate-x-0.5 transition-transform flex items-center space-x-0.5">
                      <span>Open IDE</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-zinc-900/30 border border-zinc-800 rounded-2xl space-y-4">
              <Youtube className="w-12 h-12 text-rose-500/60 mx-auto" />
              <div>
                <h3 className="text-sm font-semibold text-zinc-200">No Workspaces Yet</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
                  Paste any YouTube programming tutorial or create a clean workspace to start building.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition-all"
                >
                  Start YouTube Tutorial
                </button>
                <button
                  onClick={() => setIsNewProjectModalOpen(true)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg border border-zinc-700 transition-all"
                >
                  Empty Workspace
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Quick-Start Blank Templates */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-zinc-100">
              Quick Start Blank Runtimes
            </h2>
            <span className="text-xs text-zinc-500">
              Fast-boot isolated environments
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROJECT_TEMPLATES.filter((t) => t.id !== 'empty').map((tpl) => (
              <div
                key={tpl.id}
                onClick={() =>
                  handleCreateStandardProject(
                    `${tpl.id}-app`,
                    tpl.id,
                    `Starter ${tpl.name} workspace`
                  )
                }
                className="group p-4 bg-zinc-900/60 hover:bg-zinc-800/60 border border-zinc-800 hover:border-sky-500/50 rounded-xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 group-hover:border-zinc-700 transition-colors">
                    {getTemplateIcon(tpl.id)}
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800">
                    {tpl.language}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-zinc-200 group-hover:text-sky-300 transition-colors">
                  {tpl.name}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                  {tpl.description}
                </p>

                <div className="mt-4 flex items-center text-xs text-sky-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity space-x-1">
                  <span>Create Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Modals */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onCreate={handleCreateStandardProject}
      />

      <ImportTutorialModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportTutorial}
      />
    </div>
  );
}
