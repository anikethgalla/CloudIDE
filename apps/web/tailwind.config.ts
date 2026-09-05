import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ide: {
          bg: '#18181b',
          editor: '#1e1e1e',
          sidebar: '#141416',
          activity: '#0f0f11',
          panel: '#18181b',
          border: '#27272a',
          tabActive: '#1e1e1e',
          tabInactive: '#141416',
          tabHover: '#1f1f23',
          statusbar: '#007acc',
          accent: '#3b82f6',
          accentHover: '#2563eb',
          textMuted: '#71717a',
          textMain: '#f4f4f5',
        },
      },
      fontFamily: {
        mono: ['var(--font-mono)', 'Consolas', 'Monaco', 'Courier New', 'monospace'],
        sans: ['var(--font-sans)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
