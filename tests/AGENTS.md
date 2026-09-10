# tests/AGENTS.md

This document guides AI Coding Assistants writing, running, and maintaining unit tests in `tests/`.

---

## 🧪 Testing Guidelines

1. **Test Environment**:
   - Uses Jest test runner configured in `jest.config.js` with `jsdom` environment (`jest-environment-jsdom`) and `setupTests.js`.
   - Uses `jest-fetch-mock` to mock PokéAPI HTTP network responses cleanly.

2. **Directory Structure**:
   - The `tests/unit/` directory structure must perfectly mirror the `app/` directory structure.
   - Every `.js` file created in `app/` must be accompanied by a corresponding `.test.js` file in the equivalent `tests/unit/` path.

3. **React Testing Library & Next.js Conventions**:
   - Use `@testing-library/react` (`render`, `screen`, `fireEvent`) for testing React components and user interactions.
   - Mock Next.js routing hooks (`next/navigation`, `usePathname`, `useRouter`, `useSearchParams`) when rendering client components.
   - For Next.js App Router server functions (e.g., `generateStaticParams`), isolate the logic by cleanly mocking external API fetches to test both success data mapping and error-handling/exception paths.

4. **Coverage & Verification**:
   - Always run `npm test` after adding or updating any test file to ensure clean passes across the full test suite, ESLint, and Stylelint.
   - Maintain 100% test passing metrics across component rendering, utility modules, and API helper functions.

5. **Silencing Expected Errors**:
   - When writing test cases that intentionally simulate errors (like failed API responses or invalid inputs) to test error handling logic, you MUST suppress the expected `console.error` logs.
   - Use `const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});` before the action, and `consoleSpy.mockRestore();` after the assertion, to prevent intentional error logs from polluting the clean test output.
6. **Mocking Server Components**:
   - When mocking React components that accept text props or children required by query matchers (e.g., `getByText`), always explicitly render those props/children in the mock structure. For example, render `{sectionTitle}` within your `<MockComponent />` rather than discarding it, to prevent false-negative "Unable to find element with text" test failures.

7. **Mocking Promise.all Dependencies**:
   - When testing functions or Server Components that dispatch multiple asynchronous operations concurrently (via `Promise.all` or `limitConcurrency`), ensure ALL external dependencies in the batch are explicitly mocked to resolve or reject based on the test scenario. If a single un-mocked or improperly mocked function implicitly rejects, it will fail the entire `Promise.all` chain, bypassing subsequent branch logic you might be attempting to cover.
