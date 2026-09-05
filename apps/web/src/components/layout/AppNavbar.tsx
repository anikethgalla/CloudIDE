'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Code2,
  LayoutDashboard,
  FolderOpen,
  Settings,
  LogOut,
  User,
  Plus,
  Youtube,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppNavbarProps {
  onOpenImportModal?: () => void;
  onOpenNewProjectModal?: () => void;
}

export const AppNavbar: React.FC<AppNavbarProps> = ({
  onOpenImportModal,
  onOpenNewProjectModal,
}) => {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [
    { label: 'Dashboard', href: '/app', icon: LayoutDashboard },
    { label: 'Projects', href: '/app/projects', icon: FolderOpen },
    { label: 'Settings', href: '/app/settings', icon: Settings },
  ];

  return (
    <header className="border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left: Brand & Nav Links */}
        <div className="flex items-center space-x-8">
          <Link href="/app" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
              <Code2 className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
              Project <span className="text-sky-400">Breakout</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1 text-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors',
                    isActive
                      ? 'bg-zinc-800 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Actions & User Menu */}
        <div className="flex items-center space-x-3">
          {onOpenImportModal && (
            <button
              onClick={onOpenImportModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-95"
            >
              <Youtube className="w-3.5 h-3.5" />
              <span>Import Tutorial</span>
            </button>
          )}

          {onOpenNewProjectModal && (
            <button
              onClick={onOpenNewProjectModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold rounded-lg transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Project</span>
            </button>
          )}

          {/* User Avatar & Logout */}
          <div className="flex items-center space-x-2 pl-3 border-l border-zinc-800">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || 'User'}
                className="w-7 h-7 rounded-full border border-zinc-700 object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 text-xs font-bold">
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
              </div>
            )}

            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              title="Sign Out"
              className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
