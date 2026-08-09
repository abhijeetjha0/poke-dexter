---
name: generate-pr
description: Analyzes active Git changeset (git diff against main or HEAD) and generates a human-readable PR description at PR/PR.md following project PR standards.
---

# 🔀 Skill: generate-pr

Use this skill whenever asked to analyze the current Git changeset and draft a Pull Request description file (`PR/PR.md`).

---

## 📌 Core Rules & Learnings for AI Agents

1. **Deep Analysis Requirement**:
   - You MUST deeply scan each and every changeset in the current Git diff. Do not gloss over changes. Perform a deep, file-by-file analysis to ensure every technical update, architectural shift, and minor fix is accurately captured and explained.

2. **Branch Naming Standards**:
   - Use short, lowercase, hyphenated branch names describing the feature or task (e.g., `improve-ux-using-ai`, `deployment`, `add-unit-tests`, `api-requests-refactor`).

3. **Title Standard**:
   - State the main motive/objective of the Merge Request clearly and concisely (e.g., `Project Standards Improvements`). No rigid prefix required.

4. **Rich Markdown & Visual Formatting**:
   - **Highlight File Paths & Code Symbols**: Enclose all file paths, directory paths, npm commands, and code symbols in inline code backticks (e.g., `app/api-requests/`, `package.json`, `.github/workflows/deploy.yml`, `npm test`, `devDependencies`).
   - **Bold Key Modules & Features**: Use **bold text** (`**...**`) for key feature names, modules, or architectural layers at the start of bullet points so the PR description is scannable and visually engaging.

5. **Human-Readable Language**:
   - Write clear, developer-friendly descriptions explaining **what was really touched** rather than repeating generic file paths or repetitive boilerplate.

6. **Conditional Sections**:
   - **Technical updates done**: Include `### Technical updates done:` ONLY if technical, configuration, test, or codebase changes occurred in the changeset.
   - **UX updates done**: Include `### UX updates done:` ONLY if UI component, layout, routing, or SCSS styling changes occurred in the changeset.

7. **Detailed Technical Specifications**:
   - **`package.json`**: When modified, explicitly list added/updated `dependencies` and `devDependencies` (e.g., `next`, `jest`, `@testing-library/react`), configured scripts (e.g., `test`, `lint-style`), and Node engine boundaries (e.g., `>=24.12.0`).
   - **`.github/workflows/deploy.yml`**: When modified, explicitly specify the exact workflow step additions (e.g., added mandatory `npm test` step prior to `npm run build`).
   - **Testing (`tests/`, `jest.config.js`)**: If test configuration is touched, explicitly mention it (e.g., `Added Jest unit test runner and setupTests environment configuration`). If test cases are added or fixed, summarize them with an 'Added' or 'Fixed' message around the feature/component name without listing individual test filenames.
   - **Core & High-Impact Architectural Changes**: Any change, refactoring, module creation, or breaking update that impacts whole application functionality (e.g. centralized network fetching layer, global state, routing boundaries, core helpers) MUST be explained in detail so reviewers immediately understand the scope and architectural impact.
   - **Performance & Micro-Optimizations**: Explicitly capture code-level optimizations that improve performance, such as time complexity reductions (e.g. $O(N^2)$ to $O(1)$), redundancy elimination (e.g. caching static evaluations outside loops like `toLowerCase()`), or lazy loading implementations.
   - **Error Handling & Reliability**: Mention any explicit error handling improvements, such as throwing errors on `!response.ok` to trigger Next.js error boundaries, or adding fallback states.
   - **Documentation & Agent Rules**: Mention specific updates across master `AGENTS.md` and modular `AGENTS.md` files, including any new architectural rules (e.g. hydration mismatch prevention).
   - **Refactoring & Convention Enforcement**: Explicitly list structural realignments (e.g. moving tests to mirror application directory structure) and codebase standardization efforts (e.g. renaming variables to adhere to descriptive naming rules or updating ESLint exclusions).

8. **Bug Fix Guidelines**:
   - For bug fix changesets, state the exact bug resolved in the title (e.g. `Fix search input crash on empty query`).
   - Describe both the **root cause** and the **fix applied** under `### Technical updates done:` or `### UX updates done:` (e.g., `Fixed hydration error in Navbar by deferring location check to useEffect hook`).

9. **Strict Human-Only Roadmap Section**:
   - Output the header `### Expected updates in future: (Optional)` and **strictly leave the body blank**.
   - AI Agents MUST NEVER pre-fill roadmap items or placeholder text in this section—it is strictly reserved for human input.

10. **Pre-Merge Verification Checklist**:
   - Ensure all automated verification checks (`npm test`, `npm run lint`, `npm run lint-style`, `npm run build`) pass prior to opening or merging PRs.

11. **Git Protection**:
    - Write output to `PR/PR.md`.
    - Ensure `/PR` is listed in `.gitignore` so `PR/PR.md` is **never committed or pushed to Git**.

---

## 📝 Example Output Template

```markdown
Title: Project Standards Improvements

### Technical updates done:
1. **Agent Skill**: Created workspace Agent Skill in `.agents/skills/generate-pr/SKILL.md` for autonomous PR description generation.
2. **PokéAPI Network Layer**: Created centralized network request module in `app/api-requests/index.js` and refactored inline `fetch` calls across App Router view routes.
3. **Unit Test Runner**: Added `jest` runner, `jest.config.js`, and `setupTests.js` environment configuration.
4. **Unit Test Coverage**: Added unit test suites for PokéAPI requests, move/type utilities, `DamageClassIcon`, `PokemonGrid`, and `Navbar` components.
5. **Linting Rules**: Configured `eslint` flat rules (`eslint.config.mjs`) and `stylelint` SCSS rules (`.stylelintrc.json`).
6. **CI/CD Pipeline**: Updated `.github/workflows/deploy.yml` with mandatory `npm test` step prior to `npm run build` and created `.github/AGENTS.md` pipeline architecture guide.
7. **Dependencies & Engine**: Updated `package.json`: Added dependencies and `devDependencies` (`jest`, `@testing-library/react`, `@testing-library/jest-dom`, `jest-fetch-mock`), configured scripts (`test`, `lint-style`), and set Node engine boundary (`>=24.12.0`).
8. **Documentation**: Updated master `AGENTS.md` and modular `AGENTS.md` guides across subdirectories.

### UX updates done:
1. **Navbar**: Added mobile hamburger menu drawer, active tab route indicators, and navigation links.
2. **Pokédex Page**: Added search input filter, artwork sprite cards with species IDs, and generation selection pills.
3. **Pokémon Detail View**: Updated layout theming, expanded stats breakdown cards, and added interactive type/ability/move pills.

### Expected updates in future: (Optional)
```
