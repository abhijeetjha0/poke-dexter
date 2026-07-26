# .github/AGENTS.md

This document guides AI Coding Assistants working within the `.github/` directory, covering CI/CD deployment workflows for PokeDexter.

---

## 🚀 CI/CD Pipeline & GitHub Actions Agent

### Deployment Workflow (`.github/workflows/deploy.yml`)

- **Trigger**: Pushes to `main` branch or manual `workflow_dispatch`.
- **Permissions**:
  - `contents: read`
  - `pages: write`
  - `id-token: write`
- **Execution Lifecycle**:
  1. **Checkout Code**: `actions/checkout@v4`
  2. **Environment Setup**: Node.js via `actions/setup-node@v4` using `.nvmrc` with `npm` caching.
  3. **Pages Configuration**: `actions/configure-pages@v4`
  4. **Dependency Installation**: `npm ci`
  5. **Automated Testing**: `npm test`
  6. **Badge Generation**: Executes `bash scripts/generate-coverage-badge.sh`
  7. **Static Export Build**: `npm run build` (Next.js exports static site to `./out`)
  8. **Coverage Report Copy**: `cp -r coverage/lcov-report out/coverage`
  9. **Artifact Upload**: Uploads pages artifact via `actions/upload-pages-artifact@v3` targeting `./out`.
  10. **Deployment**: Deploys to GitHub Pages via `actions/deploy-pages@v4`.

---

## 📌 Rules for `.github` Modifications

1. **Native GitHub Actions**: Prefer built-in GitHub Actions for Pages deployment (`configure-pages`, `upload-pages-artifact`, `deploy-pages`).
2. **Subpath Deployment Compatibility**: Ensure `.nvmrc` and `next.config.js` `basePath` configuration remain synchronized with deployment workflow requirements.
3. **Workflow Integrity**: Ensure every CI run executes `npm ci`, `npm test`, and `npm run build` cleanly without breaking static export settings.
