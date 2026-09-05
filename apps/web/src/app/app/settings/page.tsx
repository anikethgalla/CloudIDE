'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AppNavbar } from '@/components/layout/AppNavbar';
import {
  Settings,
  Key,
  User,
  Shield,
  EyeOff,
  Sparkles,
  Save,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [blindfoldDelay, setBlindfoldDelay] = useState('3500');
  const [defaultLanguage, setDefaultLanguage] = useState('javascript');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('breakout_gemini_api_key') || '';
    const savedDelay = localStorage.getItem('breakout_blindfold_delay') || '3500';
    const savedLang = localStorage.getItem('breakout_default_lang') || 'javascript';

    setGeminiApiKey(savedKey);
    setBlindfoldDelay(savedDelay);
    setDefaultLanguage(savedLang);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('breakout_gemini_api_key', geminiApiKey);
    localStorage.setItem('breakout_blindfold_delay', blindfoldDelay);
    localStorage.setItem('breakout_default_lang', defaultLanguage);

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <AppNavbar />

      <main className="max-w-4xl mx-auto px-6 py-8 pb-20 flex-1 w-full space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Account & Preferences</h1>
          <p className="text-xs text-zinc-400">Configure your active learning parameters, API credentials, and developer profile.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* User Profile Card */}
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
            <div className="flex items-center space-x-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
              <User className="w-4 h-4" />
              <span>User Profile</span>
            </div>

            <div className="flex items-center space-x-4 pt-2">
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  className="w-14 h-14 rounded-full border border-zinc-700 object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 font-bold text-lg">
                  {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}

              <div className="space-y-0.5">
                <div className="font-bold text-sm text-white">{session?.user?.name || 'Developer'}</div>
                <div className="text-xs text-zinc-400">{session?.user?.email || 'No email attached'}</div>
                <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 pt-1">
                  <Shield className="w-3 h-3" /> OAuth Authenticated Session
                </div>
              </div>
            </div>
          </div>

          {/* AI Credentials Card */}
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                <Key className="w-4 h-4" />
                <span>Google Gemini API Configuration</span>
              </div>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1"
              >
                <span>Get API Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Provides the Socratic AI Tutor and Rebuild Specification Generator with your personal Gemini API key. If left blank, the server’s configured environment key is used.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Gemini API Key</label>
              <input
                type="password"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-sky-500 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 outline-none transition-colors font-mono"
              />
            </div>
          </div>

          {/* Active Learning Preferences Card */}
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <EyeOff className="w-4 h-4" />
              <span>Active Recall & Blindfold Mode</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Blindfold Auto-Reveal Delay (ms)</label>
                <select
                  value={blindfoldDelay}
                  onChange={(e) => setBlindfoldDelay(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-sky-500 rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none transition-colors"
                >
                  <option value="2000">2.0 seconds (Fast)</option>
                  <option value="3500">3.5 seconds (Recommended)</option>
                  <option value="5000">5.0 seconds (Deep Focus)</option>
                  <option value="8000">8.0 seconds (Hardcore Recall)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Default Programming Language</label>
                <select
                  value={defaultLanguage}
                  onChange={(e) => setDefaultLanguage(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-sky-500 rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none transition-colors"
                >
                  <option value="javascript">JavaScript (Node.js)</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                  <option value="cpp">C / C++</option>
                  <option value="java">Java</option>
                </select>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-zinc-500">
              Preferences are synchronized with your local workspace.
            </div>

            <button
              type="submit"
              className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-600/20 transition-all duration-150 active:scale-95"
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Preferences Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Preferences</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
