---
name: test-case-and-coverage-enhancer
description: Analyzes test coverage and writes test cases to maintain > 90% total project code coverage. Ensures net positive coverage for the active git diff.
---

# 🧪 Skill: test-case-and-coverage-enhancer

Use this skill whenever asked to run test cases, analyze coverage, and write more test cases to enhance project coverage metrics.

---

## 📌 Core Rules & Learnings for AI Agents

1. **Total Project Coverage Standard**:
   - The primary goal is to achieve and maintain at least **90% total code coverage** across all measured metrics (Statements, Branches, Functions, Lines) in the project.
2. **Net-Positive Diff Coverage Requirement**:
   - When analyzing the current active Git changeset (`git diff HEAD` or `git diff main`), the changes MUST result in **net-positive code coverage**. 
   - New logic or changed code blocks must have corresponding unit test cases written or updated to hit those lines. Coverage must not drop as a result of the diff.
3. **Execution Steps**:
   - **Step 1: Test Execution**: Always begin by running `npm test` to generate the latest Jest coverage matrix.
   - **Step 2: Differential Analysis**: Identify all application files (`app/**/*.js`) modified in the current git diff.
   - **Step 3: Coverage Gap Identification**: Extract the precise "Uncovered Line #s" from the Jest coverage table output for the modified files.
   - **Step 4: Source Analysis**: Read the source code at those specific line numbers to understand the unhandled paths (e.g., error boundaries, loading states, conditional render branches, ternary operators).
   - **Step 5: Test Generation**: Create or update the corresponding `tests/unit/**/*.test.js` file to explicitly trigger the uncovered code paths using `@testing-library/react`.
   - **Step 6: Verification**: Rerun `npm test`. Assert that the coverage table shows 100% (or significantly improved) coverage for the modified files, resulting in a net-positive increase for the project, and ensuring total project coverage remains above 90%.
4. **Testing Conventions**:
   - Follow project conventions strictly: mock Next.js routing, mock PokéAPI fetches via `jest-fetch-mock`, and suppress expected `console.error` / `console.warn` logs using `jest.spyOn(console, 'error').mockImplementation(() => {});` during tests that intentionally trigger them.
   - Do not randomly guess test paths. Write precise tests targeting the exact uncovered line gaps.
5. **Strict Verification**:
   - **Zero Test Failures**: Ensure that **NO TESTS FAIL** before declaring the coverage enhancement successful. If tests are failing after adding coverage or making changes, you MUST fix the failing tests.
   - **Clean Console**: Check the test output for `console.error` or `console.warn` logs and resolve them by either fixing the underlying issue or mocking the console correctly.
6. **Reporting**:
   - After successfully raising the coverage, summarize the gaps that were filled and present the final coverage metrics to the user. For this execute `npm test` again and compare the difference you have made. Say earlier it was X% and now it is Y% and you have contributed in increasing the coverage by Z%.
