'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
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
  Clock,
  CheckCircle2,
  Target,
  BrainCircuit,
  Search,
} from 'lucide-react';
import { Project, ProjectTemplate, TemplateId, PROJECT_TEMPLATES } from '@cloud-ide/shared';
import { ApiClient } from '@/services/api';
import { AppNavbar } from '@/components/layout/AppNavbar';
import { NewProjectModal } from '@/components/modal/NewProjectModal';
import { ImportTutorialModal } from '@/components/modal/ImportTutorialModal';

export default function AppDashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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
    router.push(`/app/projects/${newProject.id}`);
  };

  const handleImportTutorial = async (payload: {
    url: string;
    template?: TemplateId;
    languageCode?: string;
    customName?: string;
  }) => {
    const res = await ApiClient.importTutorial(payload);
    // If returned an immediate project ID or job response
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
      case 'go':
        return <Code2 className="w-5 h-5 text-cyan-400" />;
      case 'rust':
        return <Code2 className="w-5 h-5 text-orange-400" />;
      default:
        return <Code2 className="w-5 h-5 text-zinc-400" />;
    }
  };

  const tutorialProjects = projects.filter((p) => p.tutorial);
  const regularProjects = projects.filter((p) => !p.tutorial);
  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.language.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* App Navbar */}
      <AppNavbar
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
      />

      {/* Main Dashboard Content */}
      <main className="max-w-6xl mx-auto px-6 py-8 pb-20 flex-1 w-full space-y-10">
        {/* Welcome Banner */}
        <section className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-sky-950/40 via-indigo-950/30 to-zinc-900 border border-sky-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-4 h-4" />
              <span>Project Breakout Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {session?.user?.name || 'Developer'}
            </h1>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Continue your active recall challenges, reconstruct tutorials from first principles, or spin up a fresh development workspace.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all active:scale-95"
            >
              <Youtube className="w-4 h-4" />
              <span>Import Tutorial</span>
            </button>
            <button
              onClick={() => setIsNewProjectModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-bold rounded-xl transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          </div>
        </section>

        {/* Learning Stats Cards */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Youtube className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-bold text-white">{tutorialProjects.length}</div>
              <div className="text-[11px] text-zinc-400">Tutorials Imported</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-bold text-white">
                {tutorialProjects.reduce((acc, p) => acc + (p.tutorial?.checkpoints?.filter((c) => c.completed).length || 0), 0)}
              </div>
              <div className="text-[11px] text-zinc-400">Checkpoints Solved</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-bold text-white">
                {tutorialProjects.filter((p) => p.tutorial?.rebuildMode).length}
              </div>
              <div className="text-[11px] text-zinc-400">Rebuilds Active</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-bold text-white">{projects.length}</div>
              <div className="text-[11px] text-zinc-400">Total Workspaces</div>
            </div>
          </div>
        </section>

        {/* Continue Learning Section (Tutorial Workspaces) */}
        {tutorialProjects.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BrainCircuit className="w-4 h-4 text-sky-400" />
                <h2 className="text-base font-bold text-white">Continue Learning</h2>
              </div>
              <span className="text-xs text-zinc-500">{tutorialProjects.length} active tutorials</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tutorialProjects.map((proj) => (
                <Link
                  key={proj.id}
                  href={`/app/projects/${proj.id}`}
                  className="group p-5 bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800 hover:border-sky-500/50 rounded-xl transition-all duration-200 hover:shadow-xl flex flex-col justify-between"
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
                            {proj.language} • {proj.tutorial?.rebuildMode ? 'Rebuild Mode' : 'Tutorial Sync'}
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
                      {proj.description || 'Project Breakout active recall workspace.'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(proj.updatedAt).toLocaleDateString()}
                    </span>
                    <span className="text-sky-400 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      Resume IDE <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* All Workspaces / Projects Section */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white">Your Workspaces</h2>
              <p className="text-xs text-zinc-500">All local development sandboxes and cloud environments.</p>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-sky-500 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-zinc-500 flex flex-col items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-sky-400 mb-2" />
              <p className="text-xs">Loading workspaces...</p>
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((proj) => (
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
                            {proj.language}
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
            <div className="p-12 text-center rounded-2xl bg-zinc-900/30 border border-zinc-800/60 space-y-3">
              <FolderOpen className="w-8 h-8 text-zinc-600 mx-auto" />
              <div className="text-sm font-semibold text-zinc-300">No workspaces found</div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                {searchQuery ? 'No workspaces match your search filter.' : 'Get started by importing a coding tutorial or creating a blank project.'}
              </p>
            </div>
          )}
        </section>

        {/* Quick-Start Blank Templates Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Quick Start Blank Runtimes</h2>
            <span className="text-xs text-zinc-500">Fast-boot isolated environments</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
                <div className="flex items-center justify-between mb-2.5">
                  <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 group-hover:border-zinc-700 transition-colors">
                    {getTemplateIcon(tpl.id)}
                  </div>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800">
                    {tpl.language}
                  </span>
                </div>

                <h3 className="text-xs font-semibold text-zinc-200 group-hover:text-sky-300 transition-colors">
                  {tpl.name}
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2">
                  {tpl.description}
                </p>
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
