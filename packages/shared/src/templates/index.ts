import { ProjectTemplate } from '../types';

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'nodejs',
    name: 'Node.js',
    description: 'JavaScript backend environment with Node.js runtime',
    language: 'javascript',
    icon: 'nodejs',
    defaultEntryFile: 'index.js',
    files: {
      'index.js': `// Welcome to your Node.js Project!
const os = require('os');

console.log('🚀 Running Node.js project');
console.log('System:', os.type(), os.arch(), os.release());
console.log('Node Version:', process.version);

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log('\\nCalculating Fibonacci numbers:');
for (let i = 0; i <= 10; i++) {
  console.log(\`Fibonacci(\${i}) = \${fibonacci(i)}\`);
}

console.log('\\nDone! Click Run or use the terminal below.');
`,
      'package.json': `{
  "name": "nodejs-starter",
  "version": "1.0.0",
  "description": "Node.js Starter in Cloud IDE",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {}
}
`,
      'README.md': `# Node.js Project

Run this project using the **Run** button or execute in the terminal:

\`\`\`bash
node index.js
\`\`\`
`
    }
  },
  {
    id: 'python',
    name: 'Python',
    description: 'Python 3 environment for scripts, algorithms, and data processing',
    language: 'python',
    icon: 'python',
    defaultEntryFile: 'main.py',
    files: {
      'main.py': `# Welcome to Python in Cloud IDE!
import sys
import time

print(f"🐍 Python {sys.version.split()[0]} running in sandbox")
print("-" * 40)

def greet(name: str) -> str:
    return f"Hello, {name}! Welcome to the online IDE."

print(greet("Developer"))

# Sample data structure manipulation
items = ["Monaco Editor", "Docker Sandbox", "xterm.js Terminal", "PostgreSQL"]
print("\nSupported IDE components:")
for idx, item in enumerate(items, start=1):
    print(f"  {idx}. {item}")

print("\nSimulating computation...")
total = sum(i ** 2 for i in range(1, 101))
print(f"Sum of squares (1..100): {total}")
`,
      'utils.py': `"""Utility helper functions."""

def add(a: int, b: int) -> int:
    return a + b

def multiply(a: int, b: int) -> int:
    return a * b
`,
      'requirements.txt': `# Add pip dependencies here
`,
      'README.md': `# Python 3 Project

Run this project using the **Run** button or in the terminal:

\`\`\`bash
python main.py
\`\`\`
`
    }
  },
  {
    id: 'cpp',
    name: 'C++',
    description: 'Modern C++ (g++ / C++20) compiled environment',
    language: 'cpp',
    icon: 'cpp',
    defaultEntryFile: 'main.cpp',
    files: {
      'main.cpp': `#include <iostream>
#include <vector>
#include <numeric>
#include <string>

int main() {
    std::cout << "⚡ Modern C++ in Cloud IDE" << std::endl;
    std::cout << "---------------------------------" << std::endl;

    std::vector<std::string> features = {
        "High Performance",
        "Direct Memory Control",
        "Compiled Binary Execution",
        "Docker Isolated Sandbox"
    };

    std::cout << "C++ Features in this environment:" << std::endl;
    for (size_t i = 0; i < features.size(); ++i) {
        std::cout << " [" << (i + 1) << "] " << features[i] << std::endl;
    }

    std::vector<int> numbers = {10, 20, 30, 40, 50};
    int sum = std::accumulate(numbers.begin(), numbers.end(), 0);
    std::cout << "\\nSum of elements: " << sum << std::endl;

    return 0;
}
`,
      'README.md': `# C++ Project

Compile and run using the **Run** button, or via the interactive terminal:

\`\`\`bash
g++ -std=c++20 main.cpp -o main
./main
\`\`\`
`
    }
  },
  {
    id: 'java',
    name: 'Java',
    description: 'Java (OpenJDK) environment with javac & java runtime',
    language: 'java',
    icon: 'java',
    defaultEntryFile: 'Main.java',
    files: {
      'Main.java': `import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        System.out.println("☕ Welcome to Java in Cloud IDE!");
        System.out.println("Java Version: " + System.getProperty("java.version"));
        System.out.println("----------------------------------------");

        List<String> items = new ArrayList<>();
        items.add("Compile with javac");
        items.add("Run on JVM");
        items.add("Isolated in Docker container");

        System.out.println("Execution Pipeline:");
        for (int i = 0; i < items.size(); i++) {
            System.out.printf("  (%d) %s%n", i + 1, items.get(i));
        }

        long sum = 0;
        for (int i = 1; i <= 1000; i++) {
            sum += i;
        }
        System.out.println("\\nSum from 1 to 1000 = " + sum);
    }
}
`,
      'README.md': `# Java Project

Compile and run with the **Run** button or in the terminal:

\`\`\`bash
javac Main.java
java Main
\`\`\`
`
    }
  },
  {
    id: 'html',
    name: 'HTML / CSS / JS',
    description: 'Static web application with live interactive preview',
    language: 'html',
    icon: 'html',
    defaultEntryFile: 'index.html',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cloud IDE Web Preview</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="container">
    <header>
      <div class="badge">Live Web Preview</div>
      <h1>Interactive Web Project</h1>
      <p>Edit HTML, CSS, and JS in Monaco — preview updates automatically.</p>
    </header>

    <main class="card">
      <h2>Counter Demo</h2>
      <div class="counter-display">
        <span id="counter-value">0</span>
      </div>
      <div class="button-group">
        <button id="btn-decrement" class="btn btn-secondary">-1</button>
        <button id="btn-reset" class="btn btn-danger">Reset</button>
        <button id="btn-increment" class="btn btn-primary">+1</button>
      </div>
    </main>

    <footer>
      <p>Built with Cloud IDE • Powered by WebSockets & Docker</p>
    </footer>
  </div>

  <script src="script.js"></script>
</body>
</html>
`,
      'style.css': `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
  color: #f8fafc;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.container {
  width: 100%;
  max-width: 500px;
  text-align: center;
}

header {
  margin-bottom: 2rem;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: rgba(99, 102, 241, 0.2);
  color: #818cf8;
  border: 1px solid rgba(99, 102, 241, 0.4);
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

h1 {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #ffffff;
}

header p {
  color: #94a3b8;
  font-size: 0.95rem;
}

.card {
  background: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
  margin-bottom: 1.5rem;
}

.card h2 {
  font-size: 1.1rem;
  color: #cbd5e1;
  margin-bottom: 1.5rem;
}

.counter-display {
  margin-bottom: 1.5rem;
}

#counter-value {
  font-size: 4rem;
  font-weight: 800;
  color: #38bdf8;
  font-variant-numeric: tabular-nums;
  transition: transform 0.15s ease;
  display: inline-block;
}

.button-group {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.btn {
  border: none;
  padding: 0.75rem 1.25rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn:active {
  transform: scale(0.95);
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #475569;
  color: white;
}

.btn-secondary:hover {
  background: #334155;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

footer {
  color: #64748b;
  font-size: 0.8rem;
}
`,
      'script.js': `let count = 0;

const counterDisplay = document.getElementById('counter-value');
const btnIncrement = document.getElementById('btn-increment');
const btnDecrement = document.getElementById('btn-decrement');
const btnReset = document.getElementById('btn-reset');

function updateDisplay() {
  counterDisplay.textContent = count;
  counterDisplay.style.transform = 'scale(1.2)';
  setTimeout(() => {
    counterDisplay.style.transform = 'scale(1)';
  }, 100);
}

btnIncrement.addEventListener('click', () => {
  count++;
  updateDisplay();
});

btnDecrement.addEventListener('click', () => {
  count--;
  updateDisplay();
});

btnReset.addEventListener('click', () => {
  count = 0;
  updateDisplay();
});

console.log('Live web project loaded successfully!');
`,
      'README.md': `# HTML / CSS / JavaScript Project

Click the **Preview** tab or button to view the live web preview in real time!
`
    }
  },
  {
    id: 'react',
    name: 'React (Vite)',
    description: 'Modern React application with JSX, hooks, and hot module reloading',
    language: 'react',
    icon: 'react',
    defaultEntryFile: 'src/App.jsx',
    files: {
      'package.json': `{
  "name": "react-starter",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 0.0.0.0 --port 3000",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.2.0"
  }
}
`,
      'vite.config.js': `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000
  }
});
`,
      'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React App - Cloud IDE</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`,
      'src/main.jsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,
      'src/App.jsx': `import React, { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app-container">
      <div className="card">
        <div className="react-badge">⚛️ React 18 + Vite</div>
        <h1>Cloud IDE React Sandbox</h1>
        <p className="subtitle">Edit <code>src/App.jsx</code> and preview hot reloads!</p>

        <div className="counter-box">
          <button className="btn" onClick={() => setCount((c) => c + 1)}>
            Count is: <strong>{count}</strong>
          </button>
        </div>

        <div className="tags">
          <span className="tag">Fast Refresh</span>
          <span className="tag">Vite Dev Server</span>
          <span className="tag">Isolated Container</span>
        </div>
      </div>
    </div>
  );
}
`,
      'src/index.css': `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #0f172a;
  color: #f8fafc;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.app-container {
  padding: 2rem;
  max-width: 480px;
  width: 100%;
}

.card {
  background: #1e293b;
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid #334155;
  text-align: center;
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5);
}

.react-badge {
  color: #38bdf8;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

h1 {
  font-size: 1.5rem;
  margin: 0.5rem 0;
}

.subtitle {
  color: #94a3b8;
  font-size: 0.9rem;
}

.counter-box {
  margin: 1.5rem 0;
}

.btn {
  background: #0284c7;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn:hover {
  background: #0369a1;
}

.tags {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 1.5rem;
}

.tag {
  background: #334155;
  color: #cbd5e1;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}
`,
      'README.md': `# React Project

Run the development server using:

\`\`\`bash
npm install
npm run dev
\`\`\`
`
    }
  },
  {
    id: 'nextjs',
    name: 'Next.js (App Router)',
    description: 'Full-stack React framework with App Router and server rendering',
    language: 'nextjs',
    icon: 'nextjs',
    defaultEntryFile: 'app/page.tsx',
    files: {
      'package.json': `{
  "name": "nextjs-starter",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -H 0.0.0.0 -p 3000",
    "build": "next build",
    "start": "next start -H 0.0.0.0 -p 3000"
  },
  "dependencies": {
    "next": "14.2.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "typescript": "^5"
  }
}
`,
      'next.config.js': `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
`,
      'tsconfig.json': `{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
`,
      'app/layout.tsx': `import React from 'react';
import './globals.css';

export const metadata = {
  title: 'Next.js Cloud IDE Project',
  description: 'Running in Cloud IDE container sandbox',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`,
      'app/page.tsx': `export default function Home() {
  return (
    <main className="container">
      <div className="card">
        <span className="badge">▲ Next.js 14 App Router</span>
        <h1>Cloud IDE Next.js Workspace</h1>
        <p>Edit <code>app/page.tsx</code> to see instant updates in preview.</p>
        
        <div className="features">
          <div className="feature-item">
            <h3>Server & Client Components</h3>
            <p>Full support for React 18 & Next.js rendering modes.</p>
          </div>
          <div className="feature-item">
            <h3>Docker Isolation</h3>
            <p>Safe sandbox execution with isolated node_modules.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
`,
      'app/globals.css': `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: #09090b;
  color: #fafafa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.container {
  max-width: 600px;
  padding: 2rem;
}

.card {
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.4);
}

.badge {
  display: inline-block;
  background: #27272a;
  color: #a1a1aa;
  font-size: 0.8rem;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}

h1 {
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
}

p {
  color: #a1a1aa;
  margin-bottom: 1.5rem;
}

.features {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.feature-item {
  background: #09090b;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #27272a;
}

.feature-item h3 {
  font-size: 0.95rem;
  margin-bottom: 0.4rem;
  color: #e4e4e7;
}

.feature-item p {
  font-size: 0.8rem;
  color: #71717a;
  margin: 0;
}
`,
      'README.md': `# Next.js Project

Run development server:

\`\`\`bash
npm run dev
\`\`\`
`
    }
  },
  {
    id: 'empty',
    name: 'Empty Project',
    description: 'A clean slate with no predefined files',
    language: 'javascript',
    icon: 'code',
    defaultEntryFile: 'index.js',
    files: {
      'README.md': `# Empty Project

Create new files and folders using the file explorer on the left.
`
    }
  }
];
