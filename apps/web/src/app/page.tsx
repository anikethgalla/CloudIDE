'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Code2,
  Youtube,
  BrainCircuit,
  EyeOff,
  Target,
  Sparkles,
  Terminal,
  Layers,
  ArrowRight,
  Shield,
  Zap,
  CheckCircle2,
  FileText,
  Flame,
  PlayCircle,
  ExternalLink,
  Laptop,
  Compass,
  Cpu,
  RefreshCw,
  GitBranch,
} from 'lucide-react';

export default function LandingPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200">
      {/* 1. Header / Navbar */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform shadow-lg shadow-sky-500/10">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                Project <span className="text-sky-400">Breakout</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  Active Recall
                </span>
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-xs font-medium text-zinc-400">
            <a href="#how-it-works" className="hover:text-zinc-200 transition-colors">
              How It Works
            </a>
            <a href="#features" className="hover:text-zinc-200 transition-colors">
              Features
            </a>
            <a href="#toolchains" className="hover:text-zinc-200 transition-colors">
              Developer Toolchains
            </a>
          </nav>

          <div className="flex items-center space-x-3">
            {session ? (
              <Link
                href="/app"
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-600/20 transition-all duration-150 active:scale-95"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signin"
                  className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-600/20 transition-all duration-150 active:scale-95"
                >
                  <span>Start Building</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-20 pb-24 px-6 overflow-hidden flex flex-col items-center text-center">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-sky-600/20 to-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-700/80 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-medium text-zinc-300">
              Escape Tutorial Hell • Build from Memory
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
            Stop watching tutorials.{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-indigo-300 to-cyan-400">
              Start building.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Project Breakout turns passive YouTube programming tutorials into active recall challenges inside a full-stack, browser-based development environment.
          </p>

          {/* Core Philosophy Highlights */}
          <div className="pt-2 flex items-center justify-center gap-6 text-xs font-mono font-semibold tracking-wider uppercase text-zinc-400">
            <span className="text-sky-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Watch Less
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-indigo-400 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5" /> Build More
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-emerald-400 flex items-center gap-1.5">
              <BrainCircuit className="w-3.5 h-3.5" /> Remember Everything
            </span>
          </div>

          {/* Primary CTAs */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={session ? '/app' : '/auth/signin'}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-sm font-bold rounded-xl shadow-xl shadow-sky-600/25 transition-all duration-150 active:scale-95 flex items-center justify-center space-x-2"
            >
              <span>Start Building Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-sm font-semibold rounded-xl border border-zinc-800 transition-all duration-150 flex items-center justify-center space-x-2"
            >
              <PlayCircle className="w-4 h-4 text-sky-400" />
              <span>See How It Works</span>
            </a>
          </div>
        </div>
      </section>

      {/* 3. Product Paradigm Visualization */}
      <section className="py-16 px-6 bg-zinc-900/40 border-y border-zinc-800/60">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              The 4 Pillars of Active Recall
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
              How Project Breakout replaces passive copy-pasting with cognitive retrieval.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between space-y-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Youtube className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-white">1. Timestamped Video</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Interactive YouTube video player synchronized to precise transcript timestamps and milestones.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between space-y-4">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Laptop className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-white">2. Browser IDE</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Real Monaco code editor, interactive xterm terminal, filesystem tree, and live web preview.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between space-y-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <EyeOff className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-white">3. Blindfold Mode</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Automatically blurs or pauses the video the moment you type, preventing passive copy-pasting.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between space-y-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-white">4. Socratic AI Tutor</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Gemini-powered tutor that asks guided questions and progressive hints without spoiling code.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works (5 Steps) */}
      <section id="how-it-works" className="py-24 px-6 max-w-5xl mx-auto space-y-16">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 text-sky-400 text-xs font-bold uppercase tracking-wider font-mono">
            <span>The 5-Step Process</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How You Escape Tutorial Hell
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto">
            From passive watching to independently rebuilding complex full-stack apps.
          </p>
        </div>

        <div className="space-y-6">
          {[
            {
              step: '01',
              title: 'Import Any Coding Tutorial',
              desc: 'Paste any YouTube URL. Project Breakout parses the audio track, segments the transcript with sub-second timestamps, and provisions an isolated coding workspace.',
              icon: <Youtube className="w-5 h-5 text-rose-400" />,
            },
            {
              step: '02',
              title: 'Learn While Building in a Real IDE',
              desc: 'Write code in a real Monaco editor with full syntax highlighting, file explorer, and a native terminal running node, python, go, or cargo.',
              icon: <Code2 className="w-5 h-5 text-sky-400" />,
            },
            {
              step: '03',
              title: 'Tutorial Disappears While You Code (Blindfold Mode)',
              desc: 'The moment your hands touch the keyboard, the instructor’s code is blurred out. You are forced to recall the architecture rather than transcribe symbols.',
              icon: <EyeOff className="w-5 h-5 text-amber-400" />,
            },
            {
              step: '04',
              title: 'Rebuild from Memory with Socratic Guidance',
              desc: 'Stuck on a concept? The Socratic AI tutor provides 5 levels of mental models, conceptual pseudocode, and guiding questions without giving away answers.',
              icon: <BrainCircuit className="w-5 h-5 text-indigo-400" />,
            },
            {
              step: '05',
              title: 'Prove You Actually Learned It',
              desc: 'Activate Rebuild Mode. The video is locked, starter boilerplate is removed, and you reconstruct the entire application against a functional specification.',
              icon: <Target className="w-5 h-5 text-emerald-400" />,
            },
          ].map((item) => (
            <div
              key={item.step}
              className="p-6 rounded-2xl bg-zinc-900/60 hover:bg-zinc-900/90 border border-zinc-800 transition-all duration-200 flex flex-col md:flex-row items-start gap-5 group"
            >
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono text-xl font-extrabold text-zinc-600 group-hover:text-sky-400 transition-colors">
                  {item.step}
                </span>
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  {item.icon}
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Developer Environment & Toolchains */}
      <section id="toolchains" className="py-20 px-6 bg-zinc-900/50 border-t border-zinc-800">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Real Developer Environment, Right in the Browser
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
              Not a fake mockup. Run real compiler toolchains, package managers, and background servers.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { name: 'Node.js', desc: 'npm / npx', color: 'text-emerald-400' },
              { name: 'Python', desc: 'pip / 3.12', color: 'text-yellow-400' },
              { name: 'Go', desc: 'go run / mod', color: 'text-cyan-400' },
              { name: 'Rust', desc: 'cargo / rustc', color: 'text-orange-400' },
              { name: 'C / C++', desc: 'gcc / g++', color: 'text-blue-400' },
              { name: 'Java', desc: 'javac / jdk', color: 'text-rose-400' },
            ].map((t) => (
              <div
                key={t.name}
                className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 text-center space-y-1 hover:border-zinc-700 transition-colors"
              >
                <div className={`font-bold text-sm ${t.color}`}>{t.name}</div>
                <div className="text-[10px] text-zinc-500 font-mono">{t.desc}</div>
              </div>
            ))}
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-2">
              <Terminal className="w-5 h-5 text-sky-400" />
              <h3 className="text-sm font-bold text-white">Full PTY Terminal</h3>
              <p className="text-xs text-zinc-400">
                Interactive command-line with ANSI color, arrow keys, resize, and native workspace shell execution.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-2">
              <Cpu className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Port Management & Preview</h3>
              <p className="text-xs text-zinc-400">
                Auto-discovers live web servers on ports 3000, 5000, 8080 with embedded HTTP reverse-proxy previews.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-2">
              <GitBranch className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Workspace .env Secrets</h3>
              <p className="text-xs text-zinc-400">
                Securely manage environment variables with secret masking and dynamic injection into runners.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Final Call to Action */}
      <section className="py-24 px-6 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Escape Tutorial Hell Today.
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto">
            Stop letting 4-hour tutorials give you the illusion of competence. Build, recall, and master code from first principles.
          </p>
          <div className="pt-4 flex justify-center">
            <Link
              href={session ? '/app' : '/auth/signin'}
              className="px-8 py-4 bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-600 hover:opacity-95 text-white text-sm font-bold rounded-xl shadow-2xl shadow-sky-600/30 transition-all duration-150 active:scale-95 flex items-center space-x-2"
            >
              <span>Start Building Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="border-t border-zinc-800/80 py-10 px-6 bg-zinc-950 text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Code2 className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-zinc-300">Project Breakout</span>
            <span>• Active Learning IDE</span>
          </div>

          <div className="flex items-center space-x-6 text-zinc-400">
            <a href="https://github.com/anikethgalla/CloudIDE" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              GitHub
            </a>
            <Link href="/auth/signin" className="hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/app" className="hover:text-white transition-colors">
              Dashboard
            </Link>
          </div>

          <div>
            © {new Date().getFullYear()} Project Breakout. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
