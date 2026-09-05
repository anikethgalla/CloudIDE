# Cloud IDE - Full-Stack Browser-Based Code Editor

A full-stack, browser-based online IDE inspired by VS Code and Replit. Built with **Next.js, React, Monaco Editor, xterm.js, Express, WebSockets, Docker Sandboxing, and PostgreSQL**.

---

## 🌟 Key Features

* **VS Code-Inspired Dark Interface**: Resizable panels, Activity Bar, File Explorer, Tab bar with dirty indicators, Breadcrumbs, Status Bar, and Output / Problems panels.
* **Monaco Editor Integration**: Full syntax coloring, autocomplete, multiple open tabs, `Ctrl+S` save, `Ctrl+Enter` run, bracket pair colorization, minimap, and multi-cursor editing for `.ts, .tsx, .js, .jsx, .py, .java, .cpp, .c, .h, .html, .css, .json, .md`.
* **Real Interactive Terminal**: Full xterm.js terminal streaming bidirectional stdin/stdout/stderr directly over WebSockets to an isolated sandbox environment.
* **Multi-Language Runners**:
  * 🟢 **Node.js**: JavaScript / TypeScript execution
  * 🐍 **Python 3**: Unbuffered interactive scripts & computations
  * ⚡ **C++**: GCC C++20 compilation & execution pipeline
  * ☕ **Java**: OpenJDK `javac` compilation & JVM execution
  * 🌐 **HTML / CSS / JavaScript**: Real-time live web preview with automatic asset bundling
  * ⚛️ **React**: React 18 + Vite development environment
  * ▲ **Next.js**: Next.js 14 App Router server & client components
* **Sandboxed Execution & Security**:
  * Strict path traversal prevention (`../../etc/passwd` defense)
  * Unprivileged non-root sandbox execution (`sandbox:sandbox`)
  * Memory caps (512MB), CPU quotas (1.0 core), PID limits (100 processes max), and execution timeouts (15s default)
  * Real-time WebSocket streaming of stdout / stderr chunks
* **Persistence & Workspace Abstraction**:
  * PostgreSQL project metadata repository with automated schema bootstrapping
  * Workspace filesystem layer ready for object storage / persistent volume migration

---

## 🏗️ Architecture

```
Browser
│
├── REST API & WebSocket Connections (Port 3000 / 4000)
│
Next.js Frontend (apps/web)
│  ├── Monaco Editor (Syntax highlighting, Tabs, Keybindings)
│  ├── File Explorer (Tree view, Context menus, CRUD)
│  ├── xterm.js (Interactive terminal over WebSocket)
│  ├── Output Panel (Real-time stdout/stderr stream)
│  └── Live Web Preview (Sandboxed iframe)
│
Express & WebSocket Backend (apps/server)
│  ├── Project & Workspace Manager
│  ├── Secure Filesystem Service (Root-jailed path resolver)
│  ├── Language Runner Architecture (Node, Python, C++, Java, React, Next.js)
│  ├── Terminal Session Service (Interactive PTY bridge)
│  └── Docker Sandbox Manager (Container resource caps & cleanup)
│
Docker Sandbox Runtime (docker/*)
│  ├── Node.js Sandbox (node:20-alpine, non-root)
│  ├── Python Sandbox (python:3.11-alpine, non-root)
│  ├── C++ Sandbox (alpine:3.19 + g++, non-root)
│  └── Java Sandbox (openjdk:21-jdk-slim, non-root)
│
PostgreSQL Database (Port 5432)
```

---

## 📋 Requirements

* **Node.js**: `v18.x`, `v20.x`, or `v22+` (Node v24 supported)
* **npm**: `v9.x` or higher
* **Docker & Docker Compose**: (Optional for local process execution fallback, recommended for container isolation)
* **PostgreSQL 14+**: (Optional; server includes automatic file-backed persistence fallback if PostgreSQL is not running)

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone <repo-url>
cd BreakOut

# Install monorepo dependencies
npm install

# Build shared package
npm run build --workspace=packages/shared
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
# Backend Server Configuration
PORT=4000
HOST=0.0.0.0
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/online_ide?schema=public

# Workspace Storage
WORKSPACES_DIR=./workspaces

# Docker Configuration
DOCKER_SOCKET_PATH=/var/run/docker.sock
SANDBOX_MEMORY_LIMIT=536870912
SANDBOX_CPU_LIMIT=1.0
SANDBOX_PIDS_LIMIT=100
EXECUTION_TIMEOUT_MS=15000

# Web Application
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
```

### 3. Start PostgreSQL (Optional)

You can launch a local PostgreSQL container using Docker Compose:

```bash
docker-compose up -d
```

*(If PostgreSQL is not running, the backend automatically initializes a persistent file-backed database in `workspaces/.metadata.json` so you can start developing immediately without blockers).*

### 4. Build Docker Sandbox Images (Optional)

To build the isolated Docker sandbox images:

```bash
docker build -t cloud-ide-node -f docker/node/Dockerfile.node .
docker build -t cloud-ide-python -f docker/python/Dockerfile.python .
docker build -t cloud-ide-cpp -f docker/cpp/Dockerfile.cpp .
docker build -t cloud-ide-java -f docker/java/Dockerfile.java .
```

### 5. Start Backend and Frontend

Run in separate terminals or simultaneously:

```bash
# Terminal 1: Start Express & WebSocket Backend (Port 4000)
npm run dev:server

# Terminal 2: Start Next.js Frontend IDE (Port 3000)
npm run dev:web
```

Visit **`http://localhost:3000`** in your browser.

---

## 🎯 Testing & Verification

Run the automated backend test suite:

```bash
npm run test --workspace=apps/server
```

Tests verify:
* Project creation from templates
* File and directory CRUD
* Path traversal attack prevention (`../../etc/passwd` injection tests)
* Node.js execution and stdout streaming
* Python script execution
* Execution timeout limits and process termination

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + S` / `Cmd + S` | Save current active file |
| `Ctrl + Enter` / `Cmd + Enter` | Run code in isolated environment |
| `Ctrl + \`` | Toggle Terminal / Output bottom panel |
| `Ctrl + B` | Toggle File Explorer sidebar |
| `Ctrl + Shift + F` | Search across project |
| `Alt + Click` | Multi-cursor selection in Monaco |
| `Ctrl + /` | Toggle comment |

---

## 🔒 Security & Multi-Tenant Deployment Notes

> [!IMPORTANT]
> The current development version implements strict path-jail validation, non-root sandbox execution, PID limits, memory quotas, and execution timeouts.
> 
> For a **public multi-user production deployment**, the following additional layers should be enabled:
> 1. **gVisor (`runsc`) or Kata Containers**: Kernel-level container virtualization to prevent container escape exploits.
> 2. **Network Namespaces (`--network none`)**: Disable external network access by default during student/untrusted code execution, only whitelisting npm/pip registry proxies when package installation is explicitly requested.
> 3. **Per-Tenant Ephemeral MicroVMs (Firecracker / Fly.io Machines)**: Spawning short-lived microVMs per execution session with strict storage and CPU limits.
> 4. **JWT Authentication & RBAC**: Integrate user authentication at the API gateway layer to verify workspace ownership.
