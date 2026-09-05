import { Database } from '../db/db';
import { FileService } from '../services/fileService';
import { SecurePathResolver } from '../utils/securePath';
import { Project, TemplateId, Language } from '@cloud-ide/shared';
import fs from 'fs';
import path from 'path';

interface SampleProjectDef {
  id: string;
  name: string;
  description: string;
  template: TemplateId;
  language: Language;
  entryFile: string;
  files: Record<string, string>;
}

const SAMPLE_PROJECTS: SampleProjectDef[] = [
  // 1. GO PROJECT
  {
    id: 'sample-go-service',
    name: 'Go Concurrent Microservice',
    description: 'High-concurrency Go REST microservice with goroutines and worker channels',
    template: 'go',
    language: 'go',
    entryFile: 'main.go',
    files: {
      'go.mod': `module breakout/go-microservice

go 1.22
`,
      'main.go': `package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"runtime"
	"sync"
	"time"
)

type Task struct {
	ID        int    \`json:"id"\`
	Name      string \`json:"name"\`
	Completed bool   \`json:"completed"\`
	Duration  string \`json:"duration"\`
}

type ServerStats struct {
	GoVersion    string \`json:"goVersion"\`
	NumGoroutine int    \`json:"numGoroutine"\`
	NumCPU       int    \`json:"numCpu"\`
	Timestamp    string \`json:"timestamp"\`
}

var (
	tasks = []Task{
		{ID: 1, Name: "Initialize Cloud IDE Sandbox", Completed: true, Duration: "12ms"},
		{ID: 2, Name: "Run Goroutine Worker Pool", Completed: true, Duration: "45ms"},
		{ID: 3, Name: "Master Full-Stack Engineering", Completed: false, Duration: "Ongoing"},
	}
	mu sync.RWMutex
)

func main() {
	port := ":4001"
	fmt.Printf("🚀 Starting Go Concurrent Microservice on http://localhost%s\\n", port)
	fmt.Printf("OS: %s | Arch: %s | CPUs: %d\\n", runtime.GOOS, runtime.GOARCH, runtime.NumCPU())
	fmt.Println("--------------------------------------------------")

	http.HandleFunc("/", handleHome)
	http.HandleFunc("/api/tasks", handleTasks)
	http.HandleFunc("/api/stats", handleStats)
	http.HandleFunc("/api/compute", handleCompute)

	// Background worker demonstration
	go backgroundHeartbeat()

	if err := http.ListenAndServe(port, nil); err != nil {
		fmt.Printf("❌ Server failed to start: %v\\n", err)
	}
}

func handleHome(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":   "Welcome to the Go Concurrent Microservice in Cloud IDE!",
		"status":    "running",
		"endpoints": []string{"/api/tasks", "/api/stats", "/api/compute?n=40"},
	})
}

func handleTasks(w http.ResponseWriter, r *http.Request) {
	mu.RLock()
	defer mu.RUnlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tasks)
}

func handleStats(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	stats := ServerStats{
		GoVersion:    runtime.Version(),
		NumGoroutine: runtime.NumGoroutine(),
		NumCPU:       runtime.NumCPU(),
		Timestamp:    time.Now().Format(time.RFC3339),
	}
	json.NewEncoder(w).Encode(stats)
}

func handleCompute(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	// Run concurrent calculation using 4 goroutines
	var wg sync.WaitGroup
	results := make([]int64, 4)

	for i := 0; i < 4; i++ {
		wg.Add(1)
		go func(workerId int) {
			defer wg.Done()
			var sum int64 = 0
			for j := int64(1); j <= 2500000; j++ {
				sum += (j * int64(workerId+1)) % 9999
			}
			results[workerId] = sum
		}(i)
	}
	wg.Wait()

	elapsed := time.Since(start)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"workers":       4,
		"results":       results,
		"executionTime": elapsed.String(),
	})
}

func backgroundHeartbeat() {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		fmt.Printf("[Heartbeat %s] Active Goroutines: %d\\n",
			time.Now().Format("15:04:05"),
			runtime.NumGoroutine(),
		)
	}
}
`,
      'README.md': `# Go Concurrent Microservice

A fast, concurrent Go backend with an HTTP REST API and background worker channels.

## How to Run:
Run in the interactive terminal:
\`\`\`bash
go run main.go
\`\`\`

## Test API Endpoints:
\`\`\`bash
curl http://localhost:4001/
curl http://localhost:4001/api/tasks
curl http://localhost:4001/api/stats
curl http://localhost:4001/api/compute
\`\`\`
`,
    },
  },

  // 2. RUST PROJECT
  {
    id: 'sample-rust-engine',
    name: 'Rust High-Performance CLI Engine',
    description: 'Memory-safe Rust CLI application with multithreading, benchmarking, and custom data structures',
    template: 'rust',
    language: 'rust',
    entryFile: 'src/main.rs',
    files: {
      'Cargo.toml': `[package]
name = "rust-engine"
version = "0.1.0"
edition = "2021"

[dependencies]
`,
      'src/main.rs': `mod math_engine;
mod dataset;

use std::time::Instant;
use dataset::BenchmarkData;
use math_engine::MathEngine;

fn main() {
    println!("🦀 ===========================================");
    println!("🦀  Welcome to the Rust High-Performance Engine");
    println!("🦀 ===========================================");

    // 1. Immutable Data Processing
    let data = BenchmarkData::new(100_000);
    println!("Generated dataset with {} elements.", data.len());

    // 2. Multithreaded Sum & Variance Calculation
    let start = Instant::now();
    let sum = MathEngine::parallel_sum(&data.values, 4);
    let duration = start.elapsed();

    println!("⚡ Parallel Sum (4 threads): {}", sum);
    println!("⏱  Computation completed in: {:?}", duration);

    // 3. Fibonacci Sequence Verification
    println!("\\n🔢 Computing first 15 Fibonacci numbers:");
    for n in 0..=15 {
        print!("{} ", MathEngine::fibonacci(n));
    }
    println!("\\n\\n✅ All Rust memory safety and concurrency checks passed!");
}
`,
      'src/math_engine.rs': `use std::thread;

pub struct MathEngine;

impl MathEngine {
    pub fn fibonacci(n: u32) -> u64 {
        match n {
            0 => 0,
            1 => 1,
            _ => {
                let mut a = 0;
                let mut b = 1;
                for _ in 2..=n {
                    let temp = a + b;
                    a = b;
                    b = temp;
                }
                b
            }
        }
    }

    pub fn parallel_sum(values: &[i64], num_threads: usize) -> i64 {
        let chunk_size = (values.len() + num_threads - 1) / num_threads;
        let mut handles = Vec::new();

        for chunk in values.chunks(chunk_size) {
            let chunk_vec = chunk.to_vec();
            let handle = thread::spawn(move || {
                chunk_vec.iter().sum::<i64>()
            });
            handles.push(handle);
        }

        let mut total = 0;
        for handle in handles {
            total += handle.join().unwrap();
        }
        total
    }
}
`,
      'src/dataset.rs': `pub struct BenchmarkData {
    pub values: Vec<i64>,
}

impl BenchmarkData {
    pub fn new(count: usize) -> Self {
        let values: Vec<i64> = (1..=count as i64).map(|x| (x * 3) % 1000).collect();
        Self { values }
    }

    pub fn len(&self) -> usize {
        self.values.len()
    }
}
`,
      'README.md': `# Rust High-Performance Engine

An efficient Rust project showcasing memory safety, zero-cost abstractions, and multithreaded data processing.

## How to Run:
Execute in the terminal:
\`\`\`bash
cargo run
\`\`\`

## Run Tests:
\`\`\`bash
cargo test
\`\`\`
`,
    },
  },

  // 3. EXPRESS.JS REST API
  {
    id: 'sample-express-api',
    name: 'Express.js RESTful API & Store',
    description: 'Production-ready Express server with JSON routes, request logger, error handling, and in-memory store',
    template: 'express',
    language: 'javascript',
    entryFile: 'server.js',
    files: {
      'package.json': `{
  "name": "express-sample-store",
  "version": "1.0.0",
  "description": "Express REST API in Cloud IDE",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.19.2"
  }
}
`,
      'server.js': `const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Custom request logger middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  console.log(\`[\${timestamp}] \${req.method} \${req.url}\`);
  next();
});

// In-memory data store
let products = [
  { id: 1, name: 'Mechanical Keyboard', price: 129.99, category: 'Hardware', inStock: true },
  { id: 2, name: '4K UltraWide Monitor', price: 499.00, category: 'Displays', inStock: true },
  { id: 3, name: 'Ergonomic Chair', price: 299.50, category: 'Furniture', inStock: false },
  { id: 4, name: 'Cloud IDE Pro Subscription', price: 19.00, category: 'Software', inStock: true }
];

// Root documentation route
app.get('/', (req, res) => {
  res.json({
    name: '🛍️ Express.js Store API',
    status: 'ONLINE',
    version: '1.0.0',
    endpoints: {
      'GET /api/products': 'List all products (supports ?category= filter)',
      'GET /api/products/:id': 'Get product details',
      'POST /api/products': 'Create a new product { name, price, category }',
      'DELETE /api/products/:id': 'Delete product by ID',
      'GET /api/health': 'System health check'
    }
  });
});

// GET /api/products (with optional category filter)
app.get('/api/products', (req, res) => {
  const { category } = req.query;
  if (category) {
    const filtered = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    return res.json({ success: true, count: filtered.length, data: filtered });
  }
  res.json({ success: true, count: products.length, data: products });
});

// GET /api/products/:id
app.get('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const product = products.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }
  res.json({ success: true, data: product });
});

// POST /api/products
app.post('/api/products', (req, res) => {
  const { name, price, category } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ success: false, error: 'name and price are required' });
  }
  const newProduct = {
    id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
    name,
    price: parseFloat(price),
    category: category || 'General',
    inStock: true
  };
  products.push(newProduct);
  res.status(201).json({ success: true, message: 'Product created', data: newProduct });
});

// DELETE /api/products/:id
app.delete('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = products.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }
  const deleted = products.splice(index, 1)[0];
  res.json({ success: true, message: 'Product deleted', data: deleted });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(\`✅ Express server is listening on http://localhost:\${PORT}\`);
  console.log(\`🔗 Ready to accept requests in Cloud IDE container!\`);
});
`,
      'README.md': `# Express.js Store & REST API

A clean RESTful API built with Node.js and Express.

## Run Server:
\`\`\`bash
npm install
node server.js
\`\`\`

## Test API:
\`\`\`bash
# List all products
curl http://localhost:3000/api/products

# Filter by category
curl "http://localhost:3000/api/products?category=Hardware"

# Create a new product
curl -X POST http://localhost:3000/api/products -H "Content-Type: application/json" -d '{"name": "USB-C Hub", "price": 45.00, "category": "Hardware"}'
\`\`\`
`,
    },
  },

  // 4. HTML / CSS / JS WEB APP
  {
    id: 'sample-web-dashboard',
    name: 'Modern Web Dashboard (HTML/CSS/JS)',
    description: 'Glassmorphic interactive frontend dashboard with live counters, task management, and responsive CSS',
    template: 'html',
    language: 'html',
    entryFile: 'index.html',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Project Breakout - Developer Dashboard</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="dashboard-container">
    <!-- Header -->
    <header class="header">
      <div class="logo">
        <span class="logo-icon">⚡</span>
        <h1>Developer Command Center</h1>
      </div>
      <div class="header-badges">
        <span class="status-badge"><span class="pulse"></span> Live Sandbox</span>
      </div>
    </header>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Active Focus Time</div>
        <div class="stat-value" id="timer-display">00:00:00</div>
        <button id="btn-timer" class="btn btn-sm btn-primary">Start Session</button>
      </div>
      <div class="stat-card">
        <div class="stat-label">Tasks Completed</div>
        <div class="stat-value" id="completed-count">2 / 4</div>
        <div class="progress-bar"><div class="progress-fill" style="width: 50%;"></div></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Recall Multiplier</div>
        <div class="stat-value highlight">3.8x</div>
        <div class="stat-sub">Active Learning Mode</div>
      </div>
    </div>

    <!-- Interactive Task Tracker -->
    <section class="card main-card">
      <div class="card-header">
        <h2>Active Goals & Milestones</h2>
        <span class="badge">Realtime DOM Sync</span>
      </div>

      <div class="input-row">
        <input type="text" id="task-input" placeholder="Add a new milestone or challenge..." />
        <button id="btn-add" class="btn btn-primary">Add Task</button>
      </div>

      <ul id="task-list" class="task-list">
        <!-- Injected via JavaScript -->
      </ul>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <p>Rendered natively in Cloud IDE • Click Preview tab to view changes instantly</p>
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: radial-gradient(circle at top, #1e1b4b 0%, #090d16 100%);
  color: #f8fafc;
  min-height: 100vh;
  padding: 2rem 1rem;
  display: flex;
  justify-content: center;
}

.dashboard-container {
  max-width: 800px;
  width: 100%;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  font-size: 1.75rem;
}

.logo h1 {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #38bdf8, #818cf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
}

.pulse {
  width: 8px;
  height: 8px;
  background: #34d399;
  border-radius: 50%;
  animation: pulse-animation 2s infinite;
}

@keyframes pulse-animation {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(52, 211, 153, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(52, 211, 153, 0); }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 1.5rem;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.stat-label {
  color: #94a3b8;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 0.75rem;
  font-variant-numeric: tabular-nums;
}

.stat-value.highlight {
  color: #38bdf8;
}

.stat-sub {
  color: #64748b;
  font-size: 0.75rem;
}

.progress-bar {
  background: rgba(255, 255, 255, 0.1);
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  background: linear-gradient(90deg, #6366f1, #38bdf8);
  height: 100%;
}

.card {
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.75rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.badge {
  background: rgba(99, 102, 241, 0.2);
  color: #a5b4fc;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
}

.input-row {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

input[type="text"] {
  flex: 1;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  color: white;
  font-size: 0.95rem;
  outline: none;
}

input[type="text"]:focus {
  border-color: #6366f1;
}

.btn {
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1.25rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #4f46e5;
  color: white;
}

.btn-primary:hover {
  background: #4338ca;
}

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
}

.task-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 0.85rem 1rem;
  border-radius: 0.5rem;
}

.task-item.completed span {
  text-decoration: line-through;
  color: #64748b;
}

.footer {
  text-align: center;
  margin-top: 2rem;
  color: #64748b;
  font-size: 0.85rem;
}
`,
      'script.js': `// State
let tasks = [
  { id: 1, title: 'Understand Core Architecture', completed: true },
  { id: 2, title: 'Build Project without Tutorial copying', completed: true },
  { id: 3, title: 'Implement Socratic AI hints', completed: false },
  { id: 4, title: 'Test in Cloud IDE isolated sandbox', completed: false },
];

let timerInterval = null;
let secondsElapsed = 0;

// Elements
const taskList = document.getElementById('task-list');
const taskInput = document.getElementById('task-input');
const btnAdd = document.getElementById('btn-add');
const completedCount = document.getElementById('completed-count');
const timerDisplay = document.getElementById('timer-display');
const btnTimer = document.getElementById('btn-timer');

// Render Tasks
function renderTasks() {
  taskList.innerHTML = '';
  const completed = tasks.filter(t => t.completed).length;
  completedCount.textContent = \`\${completed} / \${tasks.length}\`;

  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = \`task-item \${task.completed ? 'completed' : ''}\`;
    
    li.innerHTML = \`
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <input type="checkbox" \${task.completed ? 'checked' : ''} data-id="\${task.id}" />
        <span>\${task.title}</span>
      </div>
      <button class="btn btn-sm" style="background: rgba(239, 68, 68, 0.2); color: #f87171;" data-delete="\${task.id}">✕</button>
    \`;

    taskList.appendChild(li);
  });

  // Attach event listeners
  taskList.querySelectorAll('input[type="checkbox"]').forEach(chk => {
    chk.addEventListener('change', (e) => {
      const id = parseInt(e.target.dataset.id, 10);
      const item = tasks.find(t => t.id === id);
      if (item) {
        item.completed = e.target.checked;
        renderTasks();
      }
    });
  });

  taskList.querySelectorAll('button[data-delete]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.dataset.delete, 10);
      tasks = tasks.filter(t => t.id !== id);
      renderTasks();
    });
  });
}

// Add task
btnAdd.addEventListener('click', () => {
  const text = taskInput.value.trim();
  if (text) {
    tasks.push({ id: Date.now(), title: text, completed: false });
    taskInput.value = '';
    renderTasks();
  }
});

taskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') btnAdd.click();
});

// Timer functionality
btnTimer.addEventListener('click', () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    btnTimer.textContent = 'Resume Session';
    btnTimer.className = 'btn btn-sm btn-primary';
  } else {
    timerInterval = setInterval(() => {
      secondsElapsed++;
      const hrs = String(Math.floor(secondsElapsed / 3600)).padStart(2, '0');
      const mins = String(Math.floor((secondsElapsed % 3600) / 60)).padStart(2, '0');
      const secs = String(secondsElapsed % 60).padStart(2, '0');
      timerDisplay.textContent = \`\${hrs}:\${mins}:\${secs}\`;
    }, 1000);
    btnTimer.textContent = 'Pause Session';
    btnTimer.className = 'btn btn-sm' + ' style="background: #eab308; color: black;"';
  }
});

// Initial render
renderTasks();
console.log('⚡ Dashboard initialized successfully!');
`,
      'README.md': `# Interactive Web Dashboard

A responsive dashboard built with pure HTML5, modern CSS3, and JavaScript.

## Preview:
Click the **Preview** tab in the Cloud IDE top bar to view and interact with the live page!
`,
    },
  },

  // 5. PYTHON DATA PROCESSING & ALGORITHM LAB
  {
    id: 'sample-python-lab',
    name: 'Python Data Science & Algorithms Lab',
    description: 'Python computational laboratory with statistical functions, matrix transforms, and benchmarks',
    template: 'python',
    language: 'python',
    entryFile: 'main.py',
    files: {
      'main.py': `"""
Python Data Science & Algorithms Lab
Cloud IDE Sandbox Execution
"""
import time
import math
from data_processor import DataProcessor

def main():
    print("=" * 50)
    print("🐍 Welcome to the Python Data Science & Algorithms Lab")
    print("=" * 50)

    # 1. Dataset Generation
    dataset = [14, 22, 19, 35, 48, 52, 61, 77, 85, 92, 105, 120]
    print(f"Original Dataset ({len(dataset)} items): {dataset}")

    # 2. Statistical Analysis
    stats = DataProcessor.calculate_statistics(dataset)
    print("\n📊 Descriptive Statistics:")
    for k, v in stats.items():
        print(f"  • {k.capitalize():10s}: {v:.2f}" if isinstance(v, float) else f"  • {k.capitalize():10s}: {v}")

    # 3. Prime Number Sieve Benchmark
    limit = 1000
    start_time = time.time()
    primes = DataProcessor.sieve_of_eratosthenes(limit)
    elapsed_ms = (time.time() - start_time) * 1000

    print(f"\n⚡ Computed primes up to {limit}: found {len(primes)} primes in {elapsed_ms:.3f} ms")
    print(f"First 10 primes: {primes[:10]}")
    print(f"Last 5 primes:  {primes[-5:]}")

    # 4. Matrix Multiplication
    print("\n📐 3x3 Matrix Multiplication:")
    A = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    B = [[9, 8, 7], [6, 5, 4], [3, 2, 1]]
    result_matrix = DataProcessor.multiply_matrices(A, B)
    for row in result_matrix:
        print(f"  {row}")

    print("\n✅ Python algorithms executed successfully in sandbox!")

if __name__ == "__main__":
    main()
`,
      'data_processor.py': `import math
from typing import List, Dict, Union

class DataProcessor:
    @staticmethod
    def calculate_statistics(data: List[Union[int, float]]) -> Dict[str, Union[float, int]]:
        n = len(data)
        if n == 0:
            return {}
        
        mean = sum(data) / n
        variance = sum((x - mean) ** 2 for x in data) / n
        std_dev = math.sqrt(variance)
        sorted_data = sorted(data)
        median = sorted_data[n // 2] if n % 2 != 0 else (sorted_data[n // 2 - 1] + sorted_data[n // 2]) / 2

        return {
            "count": n,
            "min": min(data),
            "max": max(data),
            "mean": mean,
            "median": median,
            "variance": variance,
            "std_dev": std_dev
        }

    @staticmethod
    def sieve_of_eratosthenes(limit: int) -> List[int]:
        if limit < 2:
            return []
        is_prime = [True] * (limit + 1)
        is_prime[0] = is_prime[1] = False
        
        for p in range(2, int(math.isqrt(limit)) + 1):
            if is_prime[p]:
                for multiple in range(p * p, limit + 1, p):
                    is_prime[multiple] = False

        return [p for p, prime in enumerate(is_prime) if prime]

    @staticmethod
    def multiply_matrices(A: List[List[int]], B: List[List[int]]) -> List[List[int]]:
        rows_A, cols_A = len(A), len(A[0])
        rows_B, cols_B = len(B), len(B[0])
        assert cols_A == rows_B, "Matrix dimensions incompatible for multiplication"

        result = [[0 for _ in range(cols_B)] for _ in range(rows_A)]
        for i in range(rows_A):
            for j in range(cols_B):
                for k in range(cols_A):
                    result[i][j] += A[i][k] * B[k][j]
        return result
`,
      'requirements.txt': `# Standard library is used. Add custom packages if required.
`,
      'README.md': `# Python Data Science & Algorithms Lab

Demonstrates statistical analysis, mathematical operations, and matrix transformations in Python 3.

## Run:
\`\`\`bash
python main.py
\`\`\`
`,
    },
  },

  // 6. JAVA ENTERPRISE ENGINE
  {
    id: 'sample-java-engine',
    name: 'Java Financial Account Engine',
    description: 'Object-oriented Java application with encapsulation, Streams API, and transaction processing',
    template: 'java',
    language: 'java',
    entryFile: 'Main.java',
    files: {
      'Main.java': `import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class Main {
    public static void main(String[] args) {
        System.out.println("☕ ==============================================");
        System.out.println("☕  Java Financial Account & Transaction Engine");
        System.out.println("☕ ==============================================");
        System.out.println("JVM Version: " + System.getProperty("java.version"));
        System.out.println();

        // 1. Create accounts
        List<Account> accounts = new ArrayList<>();
        accounts.add(new Account("ACC-1001", "Alice Johnson", 2540.50));
        accounts.add(new Account("ACC-1002", "Bob Smith", 840.00));
        accounts.add(new Account("ACC-1003", "Charlie Brown", 12450.75));
        accounts.add(new Account("ACC-1004", "Diana Prince", 45000.00));

        // 2. Perform transactions
        accounts.get(0).deposit(500.00);
        accounts.get(1).withdraw(200.00);
        accounts.get(2).deposit(1500.25);

        // 3. Print all accounts
        System.out.println("📋 Registered Accounts:");
        for (Account acc : accounts) {
            System.out.printf("  • %-10s | %-16s | Balance: $%,10.2f%n",
                acc.getAccountNumber(), acc.getHolderName(), acc.getBalance());
        }

        // 4. Java 8+ Streams API Queries
        double totalAssets = accounts.stream()
            .mapToDouble(Account::getBalance)
            .sum();

        List<Account> highValueAccounts = accounts.stream()
            .filter(a -> a.getBalance() > 5000)
            .collect(Collectors.toList());

        System.out.println();
        System.out.printf("💰 Total Managed Assets: $%,.2f%n", totalAssets);
        System.out.println("⭐ High-Value Accounts (> $5,000):");
        for (Account hva : highValueAccounts) {
            System.out.printf("    - %s ($%,.2f)%n", hva.getHolderName(), hva.getBalance());
        }

        System.out.println();
        System.out.println("✅ Java execution pipeline finished successfully!");
    }
}
`,
      'Account.java': `public class Account {
    private final String accountNumber;
    private final String holderName;
    private double balance;

    public Account(String accountNumber, String holderName, double initialBalance) {
        this.accountNumber = accountNumber;
        this.holderName = holderName;
        this.balance = initialBalance;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public String getHolderName() {
        return holderName;
    }

    public double getBalance() {
        return balance;
    }

    public void deposit(double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Deposit amount must be positive");
        }
        this.balance += amount;
    }

    public boolean withdraw(double amount) {
        if (amount > 0 && amount <= this.balance) {
            this.balance -= amount;
            return true;
        }
        return false;
    }
}
`,
      'README.md': `# Java Financial Engine

Object-oriented Java project showcasing encapsulation, domain models, and Streams API.

## Compile & Run:
\`\`\`bash
javac Main.java Account.java
java Main
\`\`\`
`,
    },
  },

  // 7. C++ ALGORITHMIC LAB
  {
    id: 'sample-cpp-sandbox',
    name: 'C++20 High-Speed Algorithmic Sandbox',
    description: 'Modern C++ compiled environment with STL vectors, sorting benchmarks, and lambda algorithms',
    template: 'cpp',
    language: 'cpp',
    entryFile: 'main.cpp',
    files: {
      'main.cpp': `#include <iostream>
#include <vector>
#include <numeric>
#include <algorithm>
#include <chrono>
#include <iomanip>
#include "algorithms.hpp"

int main() {
    std::cout << "⚡ ============================================" << std::endl;
    std::cout << "⚡  C++20 High-Speed Algorithmic Sandbox" << std::endl;
    std::cout << "⚡ ============================================" << std::endl;

    // 1. Generate dataset
    const size_t SIZE = 50000;
    std::vector<int> numbers(SIZE);
    for (size_t i = 0; i < SIZE; ++i) {
        numbers[i] = static_cast<int>((i * 37 + 101) % 10000);
    }

    std::cout << "Generated " << SIZE << " integers for sorting benchmark." << std::endl;

    // 2. Benchmark QuickSort vs std::sort
    auto copyVec = numbers;
    auto start = std::chrono::high_resolution_clock::now();
    std::sort(copyVec.begin(), copyVec.end());
    auto end = std::chrono::high_resolution_clock::now();
    std::chrono::duration<double, std::milli> duration = end - start;

    std::cout << "⏱  std::sort completed in: " << std::fixed << std::setprecision(3) 
              << duration.count() << " ms" << std::endl;

    // 3. Binary Search demonstration
    int target = copyVec[SIZE / 2];
    bool found = AlgorithmicLab::binarySearch(copyVec, target);
    std::cout << "🔍 Binary Search for target (" << target << "): " 
              << (found ? "FOUND ✅" : "NOT FOUND ❌") << std::endl;

    // 4. Sum of elements with std::accumulate
    long long totalSum = std::accumulate(copyVec.begin(), copyVec.end(), 0LL);
    std::cout << "Σ  Sum of all elements: " << totalSum << std::endl;

    std::cout << "\\n✅ C++ compiled binary executed successfully in Cloud IDE!" << std::endl;
    return 0;
}
`,
      'algorithms.hpp': `#pragma once
#include <vector>

namespace AlgorithmicLab {
    inline bool binarySearch(const std::vector<int>& sortedVec, int target) {
        int left = 0;
        int right = static_cast<int>(sortedVec.size()) - 1;

        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (sortedVec[mid] == target) {
                return true;
            } else if (sortedVec[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        return false;
    }
}
`,
      'README.md': `# C++20 Algorithmic Sandbox

High-performance compiled C++ project utilizing STL containers, chrono time benchmarking, and modern C++20 features.

## Compile & Run:
\`\`\`bash
g++ -std=c++20 main.cpp -o main
./main
\`\`\`
`,
    },
  },
];

async function seed() {
  console.log('🌱 Seeding sample projects into Cloud IDE...');
  await Database.init();

  for (const sample of SAMPLE_PROJECTS) {
    const project: Project = {
      id: sample.id,
      name: sample.name,
      description: sample.description,
      template: sample.template,
      language: sample.language,
      entryFile: sample.entryFile,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 1. Create workspace files
    const projectRoot = SecurePathResolver.getProjectRoot(sample.id);
    if (!fs.existsSync(projectRoot)) {
      fs.mkdirSync(projectRoot, { recursive: true });
    }

    for (const [filePath, content] of Object.entries(sample.files)) {
      await FileService.writeFile(sample.id, filePath, content);
    }

    // 2. Persist in database
    await Database.createProject(project);
    console.log(`  ✔ Created: [${sample.language.toUpperCase()}] ${sample.name} (${sample.id})`);
  }

  console.log('🎉 All 7 sample projects successfully seeded!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Failed to seed projects:', err);
  process.exit(1);
});
