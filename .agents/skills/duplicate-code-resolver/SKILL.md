---
name: duplicate-code-resolver
description: Analyzes the JSCPD duplication report, generates an iterative implementation plan to resolve duplications, waits for developer approval before executing, and completes the process by fixing lints and updating test cases.
---

# 📝 Skill: duplicate-code-resolver

Use this skill whenever asked to resolve code duplication, specifically based on the output of the `jscpd` tool. This skill enforces a strict, iterative workflow to safely refactor and dry up the codebase while maintaining full test coverage and code quality.

---

## 📌 Core Rules & Workflow for AI Agents

1. **Analyze Duplication**:
   - Run the duplication check using the command: `npm run check-duplicate`
   - Read the generated AI report (specifically from the `ai` reporter output, which formats duplications nicely for AI analysis).
   - Identify the duplicated lines, tokens, and exactly which files and code snippets are involved.
2. **Generate the Implementation Plan**:
   - Do NOT write any application code or refactoring code during this phase.
   - Create or update the `implementation_plan.md` artifact (setting `request_feedback = true` and `user_facing = true`).
   - The plan MUST include:
     - **Duplication Summary**: Which components/files contain the clones.
     - **Refactoring Strategy**: How you plan to extract the duplicated logic. Will it be a new utility function? A new React component? A custom React hook?
     - **Affected Files**:
       - **New Files**: e.g., `app/lib/new-utility.js` or `app/components/shared-component.js`.
       - **Updated Files**: The files where the duplications will be removed and replaced by imports/usage of the new shared logic.
     - **Open Questions**: Highlight any design ambiguity (e.g., how to name the new shared component, or edge cases).
3. **Solicit User Feedback & Replan**:
   - Explicitly ask the user: "Do you approve of this refactoring plan? Please provide any review comments."
   - STOP execution and wait for the developer's explicit approval.
   - If the developer provides feedback or requests changes, update the `implementation_plan.md` and ask for approval again. **Do NOT proceed until the developer explicitly asks you to.**
4. **Execute the Plan**:
   - Only begin modifying code after the developer approves the plan.
   - Create a `task.md` artifact to track your progress as you extract the shared logic and update the dependent files.
5. **Post-Implementation Verification (Critical)**:
   - After the refactoring succeeds, you MUST run:
     - `npm run lint` and `npm run lint-fix` (fixing any new linting issues).
     - **Complete Lint Roundup**: Ensure `npm run lint` passes completely across the entire repository with 0 errors. Manually fix any issues that `lint-fix` cannot resolve due to sandbox/permission constraints.
     - `npm run test` (verifying that the refactoring did not break existing functionality).
   - If tests fail or coverage drops below 90%, you MUST update or add new test cases (using `jest` and `jest-fetch-mock` as per project standards) to cover the newly created shared utilities/components and fix the broken tests.
   - Run `npm run check-duplicate` again to verify that the duplication has been successfully removed.
