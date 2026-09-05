import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cloud IDE - Browser-based Development Environment',
  description: 'Full-stack cloud IDE with Monaco Editor, Docker sandbox, xterm.js terminal, and live previews',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-ide-bg text-ide-textMain antialiased overflow-hidden select-none">
        {children}
      </body>
    </html>
  );
}
