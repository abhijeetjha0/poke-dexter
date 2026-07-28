# AGENTS.md

This document serves as the master architectural guide for AI Coding Assistants (e.g., Google Antigravity, Claude Code, Google Jules, Gemini) working within the `poke-dexter` repository.

Subdirectory-specific guidelines are maintained in modular `AGENTS.md` files throughout the project hierarchy.

---

## 🤖 Repository Architecture & Modular AGENTS.md Hierarchy

```
.
├── .agents/                 # Workspace Agent skills (.agents/skills/generate-pr/SKILL.md)
├── .github/                 # GitHub workflows and CI/CD AGENTS.md
│   └── workflows/           # Deployment pipeline configuration (deploy.yml)
├── .gitignore               # Git ignore pattern rules
├── .next/                   # Next.js build output cache (ignored)
├── .nvmrc                   # Target Node.js engine version declaration
├── .stylelintrc.json        # Stylelint SCSS rules configuration
├── app/                     # Next.js App Router application source & AGENTS.md
│   ├── abilities/           # Abilities index and details routes
│   ├── api-requests/        # Centralized PokéAPI request module & AGENTS.md
│   ├── components/          # Reusable UI components & components AGENTS.md
│   ├── generations/         # Generation hub route & interactive client component
│   ├── lib/                 # Utility functions & helpers (move-type-utils.js)
│   ├── moves/               # Moves index and details routes
│   ├── pokemons/            # Pokédex routes & pokemons AGENTS.md
│   ├── styles/              # SCSS architecture & styles AGENTS.md
│   ├── types/               # Types hub route & type-filtered listings
│   ├── global-error.js      # Global Next.js error boundary
│   ├── global.scss          # Root SCSS import entry point
│   ├── icon.svg             # Application SVG favicon
│   ├── layout.js            # Root App Router layout wrapper
│   └── page.js              # Home landing page route
├── coverage/                # Generated Jest test coverage reports & metrics
├── node_modules/            # Installed npm dependencies
├── scripts/                 # Automation scripts (generate-coverage-badge.sh)
├── tests/                   # Jest unit testing suite & tests AGENTS.md
├── eslint.config.mjs        # ESLint 9 flat configuration
├── jest.config.js           # Jest test runner settings
├── next.config.js           # Next.js static export, basePath, and SCSS configuration
├── package.json             # Dependencies, scripts, and engine boundaries
├── package-lock.json        # Locked dependency manifest
├── setupTests.js            # Testing environment initialization
├── AGENTS.md                # Master agent instruction & tooling registry
└── README.md                # Developer documentation & project presentation
```

---

## 📋 Developer & Agent Commands Registry

| Command | Action | Description |
| :--- | :--- | :--- |
| `npm run dev` | Dev Server | Launches Next.js local development server. |
| `npm run build` | Production Build | Executes Next.js static export build (`next build`). Output placed in `/out`. |
| `npm run start` | Production Server | Starts Next.js production server. |
| `npm run test` | Unit Tests | Executes Jest unit test suite (`jest`). |
| `npm run test-filter` | Filtered Test | Executes Jest unit tests matching a pattern (`jest -t`). |
| `npm run test:watch` | Test Watcher | Launches Jest interactive test runner in watch mode. |
| `npm run lint` | Code Quality | Runs ESLint across JavaScript and JSX files (`eslint .`). |
| `npm run lint-fix` | Lint Auto-Fix | Runs ESLint with automatic fixes (`eslint . --fix`). |
| `npm run lint-style` | SCSS Linting | Runs Stylelint across all SCSS files (`stylelint '**/*.scss'`). |
| `npm run lint-style-fix` | SCSS Auto-Fix | Runs Stylelint with automatic fixes across SCSS files. |
| `npm run clean` | Cleanup | Cleans build artifacts (`.next`) and `node_modules`. |

---

## 📌 Master Rules for AI Agents

1. **Verification Requirement**: Never declare a task resolved without running `npm test`, `npm run lint`, `npm run lint-style`, and `npm run build` when modifying application code files. Verification commands can be skipped when only updating Markdown (`.md`) documentation files.
2. **No Placeholders**: Maintain accurate PokéAPI integration parameters and valid Pokémon domain models across all dynamic and static views.
3. **Keep AGENTS.md Up to Date**: Update relevant modular `AGENTS.md` files whenever tooling, configuration, routing, or SCSS style architecture changes.
4. **Linting Exclusions**: Markdown (`**/*.md`) and other non-JS/TS documentation or asset files (e.g., `.txt`, `.json`, `.css`, `.svg`) must be globally ignored in `eslint.config.mjs` following industry standards, preventing the linter from unnecessarily scanning or parsing them.

> **Note**: Subdirectory-specific guidelines (React component patterns, SCSS style structure, App Router conventions, PR description generation skill, and GitHub Actions workflows) are maintained directly within their respective modular `AGENTS.md` files:
> - [.agents/skills/generate-pr/SKILL.md](file:///.agents/skills/generate-pr/SKILL.md)
> - [.github/AGENTS.md](file:///.github/AGENTS.md)
> - [app/AGENTS.md](file:///app/AGENTS.md)
> - [app/api-requests/AGENTS.md](file:///app/api-requests/AGENTS.md)
> - [app/components/AGENTS.md](file:///app/components/AGENTS.md)
> - [app/pokemons/AGENTS.md](file:///app/pokemons/AGENTS.md)
> - [app/styles/AGENTS.md](file:///app/styles/AGENTS.md)
> - [tests/AGENTS.md](file:///tests/AGENTS.md)
