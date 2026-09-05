export const EXTENSION_TO_LANGUAGE_MAP: Record<string, string> = {
  js: 'javascript',
  jsx: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  py: 'python',
  java: 'java',
  cpp: 'cpp',
  cc: 'cpp',
  cxx: 'cpp',
  c: 'c',
  h: 'cpp',
  hpp: 'cpp',
  html: 'html',
  htm: 'html',
  css: 'css',
  scss: 'scss',
  json: 'json',
  md: 'markdown',
  markdown: 'markdown',
  yml: 'yaml',
  yaml: 'yaml',
  txt: 'plaintext',
  sh: 'shell',
  bash: 'shell',
  dockerfile: 'dockerfile',
  gitignore: 'ignore',
};

export const LANGUAGE_DISPLAY_NAMES: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
  c: 'C',
  html: 'HTML',
  css: 'CSS',
  json: 'JSON',
  markdown: 'Markdown',
  react: 'React',
  nextjs: 'Next.js',
};

export const DEFAULT_ENTRY_FILES: Record<string, string> = {
  nodejs: 'index.js',
  javascript: 'index.js',
  typescript: 'index.ts',
  python: 'main.py',
  cpp: 'main.cpp',
  c: 'main.c',
  java: 'Main.java',
  html: 'index.html',
  react: 'src/App.jsx',
  nextjs: 'app/page.tsx',
};

export const EXECUTION_LIMITS = {
  DEFAULT_TIMEOUT_MS: 15000,
  MAX_TIMEOUT_MS: 60000,
  MEMORY_LIMIT_BYTES: 512 * 1024 * 1024, // 512 MB
  CPU_QUOTA: 1.0,
  PIDS_LIMIT: 100,
  MAX_OUTPUT_SIZE_BYTES: 1024 * 1024 * 5, // 5 MB
};
