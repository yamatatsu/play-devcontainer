# Play DevContainer（[日本語](./README.ja.md)）

A sample implementation of a monorepo project using Turborepo.

## 📋 Overview

This project is a development environment using DevContainer with the following technology stack:

- **Backend**: Hono
- **Database**: PostgreSQL + Prisma ORM
- **Logger**: Pino
- **Monorepo Management**: Turborepo
- **Code Formatter**: Biome
- **Type Checking**: TypeScript

## 🏗️ Project Structure

```
.
├── apps/
│   └── backend/       # Hono API server
├── packages/
│   ├── db/            # Database management using Prisma
│   └── logger/        # Pino-based logger
├── .devcontainer/     # DevContainer configuration
├── docker-compose.yml # Docker configuration
└── turbo.json         # Turborepo configuration
```

## 🚀 Getting Started

### Prerequisites

- Docker
  - The author uses Rancher Desktop
  - colima and finch were unstable
- Visual Studio Code
- Dev Containers extension

### Setup

1. Clone the repository
   ```bash
   git clone [repository-url]
   cd play-devcontainer
   ```

2. Open DevContainer in VS Code
   - Open the project in VS Code
   - Select "Dev Containers: Reopen in Container" from the Command Palette (F1)

3. Install dependencies (automatically executed in DevContainer)
   ```bash
   npm install
   ```

4. Database setup
   ```bash
   turbo db:migrate:dev
   ```

5. GitHub authentication
   ```bash
   gh auth login
   ```

## 🔧 Personal Configuration (setup.personal.sh)

The DevContainer automatically executes `.devcontainer/setup.personal.sh` during container creation to allow for personal customizations.
This file is designed for personal setup such as dotfiles, aliases, and custom configurations.

### Usage

1. Edit `.devcontainer/setup.personal.sh` to add your personal preferences:
2. Rebuild the Dev Container.

## 🛠️ Development Commands

See [turbo.jsonc](./turbo.jsonc)

## 🐳 Docker Environment

The project runs in DevContainer and includes the following services:

- **Development Container**: Node.js 24, Git, GitHub CLI, Turborepo, Claude Code
- **PostgreSQL**: Database server (port 5432)
- **Forwarded Ports**:
  - 3000: Backend API server
  - 5432: PostgreSQL
  - 5555: Prisma Studio

## 🧪 Testing

```bash
# Run all tests
turbo test

# Run tests once
turbo test:run
```

## Technology Choices

### Dev Container

Considering the situation of supply chain attacks on OSS, development on Dev Container is the standard approach.

### npm
We use npm instead of pnpm.

pnpm installs packages once in a machine-wide cache store before distributing code to node_modules, and creates hard links from there to node_modules.
In Dev Container, since we basically develop only one codebase per machine, the benefits of going through a global store are minimal, and the overhead of resolving symbolic links makes it unnecessary behavior.

Therefore, we adopted npm for this repository.

### [Turborepo](https://turborepo.com/)
npm workspace is less powerful compared to pnpm workspace:
- Execution of commands in each workspace
- No functionality equivalent to pnpm deploy

We adopted Turborepo to solve these issues.

## Issues

- GitHub Authentication: Currently using `gh auth login`, but looking for a way to obtain authentication with narrower permissions.
- Unstable behavior in VSCode (git, biome, typecheck, etc. become disabled)
  - Error: `Remote Extension host terminated unexpectedly 3 times within the last 5 minutes.`

## 📄 License

MIT