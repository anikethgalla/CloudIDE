'use client';

import React, { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Code2, Github, Sparkles, ArrowRight, ShieldCheck, Terminal, Loader2 } from 'lucide-react';
import Link from 'next/link';

function SignInContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get('callbackUrl') || '/app';
  const [devEmail, setDevEmail] = useState('developer@projectbreakout.dev');
  const [devName, setDevName] = useState('Lead Developer');
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleOAuthSignIn = async (provider: 'github' | 'google') => {
    try {
      setIsLoading(provider);
      await signIn(provider, { callbackUrl });
    } catch (err) {
      console.error(`Sign in with ${provider} failed:`, err);
    } finally {
      setIsLoading(null);
    }
  };

  const handleDevSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading('dev');
      const res = await signIn('dev-login', {
        email: devEmail,
        name: devName,
        callbackUrl,
        redirect: true,
      });
      if (res?.ok) {
        router.push(callbackUrl);
      }
    } catch (err) {
      console.error('Dev sign in failed:', err);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="max-w-md w-full relative z-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center space-x-2.5 mb-2 group">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform shadow-lg shadow-sky-500/5">
            <Code2 className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white flex items-center gap-1.5">
            Project <span className="text-sky-400">Breakout</span>
          </span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Welcome to Project Breakout
        </h1>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto">
          Escape Tutorial Hell. Turn passive video watching into permanent retention with active recall challenges.
        </p>
      </div>

      {/* Card */}
      <div className="p-8 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-2xl backdrop-blur-xl space-y-6">
        {/* OAuth Providers */}
        <div className="space-y-3">
          <button
            onClick={() => handleOAuthSignIn('github')}
            disabled={!!isLoading}
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-zinc-800 hover:bg-zinc-700/80 text-white text-xs font-semibold rounded-xl border border-zinc-700 transition-all duration-150 hover:shadow-lg disabled:opacity-50"
          >
            <Github className="w-4 h-4 text-white" />
            <span>Continue with GitHub</span>
          </button>

          <button
            onClick={() => handleOAuthSignIn('google')}
            disabled={!!isLoading}
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-zinc-800 hover:bg-zinc-700/80 text-white text-xs font-semibold rounded-xl border border-zinc-700 transition-all duration-150 hover:shadow-lg disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.8 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 11.5 0 14s.6 4.8 1.6 6.8l3.7-3.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.8-2.5 1.2-4.3 1.2-3.2 0-5.8-2.3-6.7-5.3L1.6 16.1C3.5 19.9 7.4 23 12 23z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-zinc-800 w-full" />
          <span className="bg-zinc-900 px-3 text-[11px] uppercase tracking-wider font-mono text-zinc-500 shrink-0">
            or instant developer access
          </span>
          <div className="border-t border-zinc-800 w-full" />
        </div>

        {/* Quick Dev Login */}
        <form onSubmit={handleDevSignIn} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Developer Email</label>
            <input
              type="email"
              value={devEmail}
              onChange={(e) => setDevEmail(e.target.value)}
              required
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-sky-500 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 outline-none transition-colors"
              placeholder="developer@projectbreakout.dev"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Display Name</label>
            <input
              type="text"
              value={devName}
              onChange={(e) => setDevName(e.target.value)}
              required
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-sky-500 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 outline-none transition-colors"
              placeholder="Your Name"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading === 'dev'}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-600/20 transition-all duration-150 active:scale-95 disabled:opacity-50"
          >
            <Terminal className="w-4 h-4" />
            <span>Launch Session</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Security Notice */}
        <div className="flex items-center space-x-2 text-[11px] text-zinc-500 justify-center">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Secure server-side authentication & multi-tenant isolation</span>
        </div>
      </div>

      {/* Footer Link */}
      <div className="text-center text-xs text-zinc-500">
        <Link href="/" className="hover:text-zinc-300 transition-colors">
          ← Back to Project Breakout Homepage
        </Link>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center px-4 py-12 font-sans relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <Suspense
        fallback={
          <div className="p-12 text-center text-zinc-500 flex flex-col items-center">
            <Loader2 className="w-6 h-6 animate-spin text-sky-400 mb-2" />
            <p className="text-xs">Preparing sign in...</p>
          </div>
        }
      >
        <SignInContent />
      </Suspense>
    </div>
  );
}
