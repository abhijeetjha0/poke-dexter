# AGENTS.md

This document serves as the master architectural guide for AI Coding Assistants (e.g., Google Antigravity, Claude Code, Google Jules, Gemini) working within the `poke-dexter` repository.

Subdirectory-specific guidelines are maintained in modular `AGENTS.md` files throughout the project hierarchy.

---

## 🤖 Repository Architecture & Modular AGENTS.md Hierarchy

```
.
├── .agents/                 # Workspace Agent skills (.agents/skills/generate-pr/SKILL.md)
├── .gitignore               # Git ignore pattern rules
├── .next/                   # Next.js build output cache (ignored)
├── .nvmrc                   # Target Node.js engine version declaration
├── .stylelintrc.json        # Stylelint SCSS rules configuration
├── app/                     # Next.js App Router application source & AGENTS.md
│   ├── abilities/           # Abilities index and details routes
│   ├── api-requests/        # Centralized PokéAPI request module & AGENTS.md
│   ├── components/          # Reusable UI components & components AGENTS.md
│   ├── generations/         # Generation hub route & interactive client component
│   ├── items/               # Items index and details routes
│   ├── lib/                 # Utility functions & helpers (move-type-utils.js)
│   ├── moves/               # Moves index and details routes
│   ├── pokemons/            # Pokedex routes & pokemons AGENTS.md
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
├── next.config.js           # Next.js Vercel build and SCSS configuration
├── package.json             # Dependencies, scripts, and engine boundaries
├── package-lock.json        # Locked dependency manifest
├── setupTests.js            # Testing environment initialization
├── vercel.json              # Vercel project configuration
├── AGENTS.md                # Master agent instruction & tooling registry
└── README.md                # Developer documentation & project presentation
```

---

## 📋 Developer & Agent Commands Registry

| Command | Action | Description |
| :--- | :--- | :--- |
| `npm run dev` | Dev Server | Launches Next.js local development server. |
| `npm run build` | Production Build | Executes Next.js production build (`next build`). Output placed in `.next`. |
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

1. **Verification Requirement**: Never declare a task resolved without running `npm test`, `npm run lint`, `npm run lint-style`, and `npm run build` when modifying application code files. **STRICT EXCLUSION**: Verification commands MUST be completely skipped when only updating Markdown (`.md`) documentation files or AGENTS instruction files.
2. **No Placeholders**: Maintain accurate PokéAPI integration parameters and valid Pokémon domain models across all dynamic and static views.
3. **Keep Documentation Up to Date**: Update `README.md` and relevant modular `AGENTS.md` files whenever new features, tooling, configuration, routing, or SCSS style architecture changes.
4. **Linting Exclusions**: Markdown (`**/*.md`) and other non-JS/TS documentation or asset files (e.g., `.txt`, `.json`, `.css`, `.svg`) must be globally ignored in `eslint.config.mjs` following industry standards, preventing the linter from unnecessarily scanning or parsing them.
5. **Test Coverage Requirements**: Always add or update unit test cases covering any changes, bug fixes, or new features developed during a session.
6. **Documentation Relative File Links**: File links in documentation files (`README.md`, `AGENTS.md`) MUST use repository-relative paths starting with `./` (e.g., `./app/page.js`). For dynamic route paths containing square brackets (`[name]`), brackets in the link target URL MUST be URL-encoded as `%5B` and `%5D` (e.g., `./app/pokemons/%5Bname%5D/page.js`) to guarantee clickability across markdown parsers.
7. **No Inline Styles & No Disabled Lint Rules**: NEVER use inline `style={{ ... }}` attributes or `eslint-disable` / `stylelint-disable` comments in application code. All layout, color, and dynamic sizing styles MUST be maintained strictly within SCSS stylesheets (`app/styles/`) using semantic CSS classes or SCSS generators.
8. **UI Manual Sync Requirement**: Whenever adding, removing, or updating a UI feature, agents MUST automatically update the `app/help/page.js` manual to reflect the changes to keep the project manual accurate and in-sync. The manual must use semantic `<section id="...">` hierarchy without page headers, and maintain anchor IDs to support the global floating help button.
9. **Deployment Strategy**: The application deploys to Vercel dynamically from the `vercel` branch. The legacy static GitHub Pages deployment remains on `main` until the `vercel` branch is merged into `main`.

> **Note**: Subdirectory-specific guidelines (React component patterns, SCSS style structure, App Router conventions, and PR description generation skill) are maintained directly within their respective modular files:
> - [./.agents/skills/browser-automation-test/SKILL.md](./.agents/skills/browser-automation-test/SKILL.md)
> - [./.agents/skills/generate-pr/SKILL.md](./.agents/skills/generate-pr/SKILL.md)
> - [./app/AGENTS.md](./app/AGENTS.md)
> - [./app/api-requests/AGENTS.md](./app/api-requests/AGENTS.md)
> - [./app/components/AGENTS.md](./app/components/AGENTS.md)
> - [./app/pokemons/AGENTS.md](./app/pokemons/AGENTS.md)
> - [./app/styles/AGENTS.md](./app/styles/AGENTS.md)
> - [./tests/AGENTS.md](./tests/AGENTS.md)

