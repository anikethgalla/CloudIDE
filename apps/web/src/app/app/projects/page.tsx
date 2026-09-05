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
  Search,
  Filter,
} from 'lucide-react';
import { Project, TemplateId } from '@cloud-ide/shared';
import { ApiClient } from '@/services/api';
import { AppNavbar } from '@/components/layout/AppNavbar';
import { NewProjectModal } from '@/components/modal/NewProjectModal';
import { ImportTutorialModal } from '@/components/modal/ImportTutorialModal';

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'tutorials' | 'code'>('all');
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

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
    router.push(`/app/projects/${newProject.id}`);
  };

  const handleImportTutorial = async (payload: {
    url: string;
    template?: TemplateId;
    languageCode?: string;
    customName?: string;
  }) => {
    const res = await ApiClient.importTutorial(payload);
    if (res.id) {
      router.push(`/app/projects/${res.id}`);
    } else {
      await fetchProjects();
    }
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this workspace?')) return;

    try {
      await ApiClient.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert('Failed to delete workspace');
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
      case 'go':
        return <Code2 className="w-5 h-5 text-cyan-400" />;
      case 'rust':
        return <Code2 className="w-5 h-5 text-orange-400" />;
      default:
        return <Code2 className="w-5 h-5 text-zinc-400" />;
    }
  };

  const filtered = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.language.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedFilter === 'tutorials') return !!p.tutorial;
    if (selectedFilter === 'code') return !p.tutorial;
    return true;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <AppNavbar
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
      />

      <main className="max-w-6xl mx-auto px-6 py-8 pb-20 flex-1 w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Workspaces & Projects</h1>
            <p className="text-xs text-zinc-400">Manage all your active learning tutorials and isolated code environments.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-95"
            >
              <Youtube className="w-3.5 h-3.5" />
              <span>Import Tutorial</span>
            </button>
            <button
              onClick={() => setIsNewProjectModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold rounded-lg transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Project</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedFilter === 'all'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All ({projects.length})
            </button>
            <button
              onClick={() => setSelectedFilter('tutorials')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedFilter === 'tutorials'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Tutorials ({projects.filter((p) => p.tutorial).length})
            </button>
            <button
              onClick={() => setSelectedFilter('code')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedFilter === 'code'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Blank Runtimes ({projects.filter((p) => !p.tutorial).length})
            </button>
          </div>

          <div className="relative sm:w-72">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or language..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-sky-500 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 outline-none transition-colors"
            />
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="p-16 text-center text-zinc-500 flex flex-col items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-sky-400 mb-2" />
            <p className="text-xs">Loading projects...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((proj) => (
              <Link
                key={proj.id}
                href={`/app/projects/${proj.id}`}
                className="group p-5 bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all duration-150 hover:shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                        {getTemplateIcon(proj.template)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-zinc-100 group-hover:text-sky-300 transition-colors line-clamp-1">
                          {proj.name}
                        </h3>
                        <span className="text-[10px] uppercase font-mono text-zinc-400">
                          {proj.language} {proj.tutorial ? '• Tutorial' : ''}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDeleteProject(proj.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-rose-400 hover:bg-zinc-900 rounded transition-all text-zinc-500"
                      title="Delete Workspace"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2">
                    {proj.description || `Isolated ${proj.language} workspace`}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(proj.updatedAt).toLocaleDateString()}
                  </span>
                  <span className="text-sky-400 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Open IDE <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center rounded-2xl bg-zinc-900/30 border border-zinc-800/60 space-y-3">
            <FolderOpen className="w-8 h-8 text-zinc-600 mx-auto" />
            <div className="text-sm font-semibold text-zinc-300">No workspaces match your filter</div>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Try adjusting your search query or create a new project.
            </p>
          </div>
        )}
      </main>

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
