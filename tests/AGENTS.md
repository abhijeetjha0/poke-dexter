# tests/AGENTS.md

This document guides AI Coding Assistants writing, running, and maintaining unit tests in `tests/`.

---

## 🧪 Testing Guidelines

1. **Test Environment**:
   - Uses Jest test runner configured in `jest.config.js` with `jsdom` environment (`jest-environment-jsdom`) and `setupTests.js`.
   - Uses `jest-fetch-mock` to mock PokéAPI HTTP network responses cleanly.

2. **React Testing Library Conventions**:
   - Use `@testing-library/react` (`render`, `screen`, `fireEvent`) for testing React components and user interactions.
   - Mock Next.js routing hooks (`next/navigation`, `usePathname`, `useRouter`, `useSearchParams`) when rendering client components.

3. **Coverage & Verification**:
   - Always run `npm test` after adding or updating any test file to ensure clean passes across the full test suite, ESLint, and Stylelint.
   - Maintain 100% test passing metrics across component rendering, utility modules, and API helper functions.
