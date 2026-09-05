import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';

export const metadata: Metadata = {
  title: 'Project Breakout - Escape Tutorial Hell • Code From First Principles',
  description: 'Active learning browser-based IDE and developer environment. Turn passive video watching into permanent retention with Blindfold Mode, Socratic AI tutor, and Rebuild-from-memory.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-ide-bg text-ide-textMain antialiased min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
