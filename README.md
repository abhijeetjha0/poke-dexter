<p align="right">
  <a href="https://abhijeetjha0.github.io/poke-dexter/">
    <img src="https://img.shields.io/badge/🌐_Visit_PokeDexter-Live_App-ff5350?style=for-the-badge" alt="Visit Live App" />
  </a>
</p>

# PokeDexter 📱✨

[![Deploy Status](https://github.com/abhijeetjha0/poke-dexter/actions/workflows/deploy.yml/badge.svg)](https://github.com/abhijeetjha0/poke-dexter/actions/workflows/deploy.yml)
[![Code Coverage](https://abhijeetjha0.github.io/poke-dexter/coverage/badge.svg)](https://abhijeetjha0.github.io/poke-dexter/coverage/)

PokeDexter is a feature-rich, cross-platform Pokémon information application. It is built using **Next.js**, **React**, and **SCSS**, featuring a glassmorphic design, centralized API architecture, unit test coverage, and complete mobile responsiveness.

> **Collaborators**: [Abhijit Kumar Jha](https://github.com/abhijeetjha0) and [Kanishk Tanwar](https://github.com/kanishktanwar).

---

## 🌟 Key Features

*   **Pokédex Directory**: Search and browse through over 1,000 Pokémon species with an interactive search bar, paginated listings, and generation-based filtering.
*   **Rich Details Views**: Comprehensive profile pages for individual Pokémon showing:
    *   Dynamic variety listings (Megas, Gigantamax, Alolan forms, etc.)
    *   English description entries
    *   Stat tables with bars
    *   Calculated double/half/immune type defense multipliers
    *   Game-by-game encounter locations and capture methods
    *   Interactive move learnsets (level up, machine, tutor, egg)
*   **Abilities Directory**: Index of all passive/active abilities, featuring search functionality and detailed lists of compatible Pokémon.
*   **Moves Directory**: Complete directory of catalogued moves showing Power, Accuracy, PP, damage class (Physical, Special, Status), and which Pokémon learn them.
*   **Types Directory**: Dynamic list of all 18 element types showing matching species.
*   **Generations Navigation Hub**: Visual cards for all 9 Pokémon generations, styled with region-themed colors and representative mascot artwork overlays (Charizard, Lugia, Rayquaza, etc.).
*   **Mobile Responsiveness**: Designed using flexible grid layouts and a fluid, animated mobile hamburger menu.

---

## 🛠️ Tech Stack

*   **Core**: [Next.js](https://nextjs.org/) (App Router, Static Export configuration) & [React 19](https://react.dev/)
*   **Styling**: [Sass (SCSS)](https://sass-lang.com/) for custom color variables, component themes, and media queries (no Tailwind CSS utility clutter)
*   **Testing**: [Jest](https://jestjs.io/) & [React Testing Library](https://testing-library.com/) with [jest-fetch-mock](https://github.com/jefflau/jest-fetch-mock)
*   **Typography**: Google Fonts (Outfit for body, Orbitron for high-tech digital readouts)
*   **API**: [PokéAPI](https://pokeapi.co/) for complete real-time Pokémon data (encapsulated via `app/api-requests`)

---

## 🗺️ Routing & Project Structure

The project utilizes the **Next.js App Router** with file-system-based routing. All route paths correspond directly to folders inside the `/app` directory:

*   **API Layer (`app/api-requests`)**: [app/api-requests/index.js](file:///Users/abhijit/Documents/Projects/Learning/React/poke-dexter/app/api-requests/index.js) - Centralized PokéAPI network request module.
*   **Home (`/`)**: [app/page.js](file:///Users/abhijit/Documents/Projects/Learning/React/poke-dexter/app/page.js) - Landing page introducing PokeDexter.
*   **Directory (`/pokemons`)**: [app/pokemons/page.js](file:///Users/abhijit/Documents/Projects/Learning/React/poke-dexter/app/pokemons/page.js) - Paginated directory of all Pokémon.
*   **Pokémon Details (`/pokemons/[name]`)**: [app/pokemons/[name]/page.js](file:///Users/abhijit/Documents/Projects/Learning/React/poke-dexter/app/pokemons/[name]/page.js) - Dynamic profile page for each Pokémon.
*   **Abilities Directory (`/abilities`)**: [app/abilities/page.js](file:///Users/abhijit/Documents/Projects/Learning/React/poke-dexter/app/abilities/page.js) - Index list of abilities.
*   **Ability Details (`/abilities/[name]`)**: [app/abilities/[name]/page.js](file:///Users/abhijit/Documents/Projects/Learning/React/poke-dexter/app/abilities/[name]/page.js) - Detailed view of Pokémon having a specific ability.
*   **Moves Directory (`/moves`)**: [app/moves/page.js](file:///Users/abhijit/Documents/Projects/Learning/React/poke-dexter/app/moves/page.js) - Catalog of moves.
*   **Move Details (`/moves/[name]`)**: [app/moves/[name]/page.js](file:///Users/abhijit/Documents/Projects/Learning/React/poke-dexter/app/moves/[name]/page.js) - List of Pokémon that can learn a specific move.
*   **Generations Hub (`/generations`)**: [app/generations/page.js](file:///Users/abhijit/Documents/Projects/Learning/React/poke-dexter/app/generations/page.js) - Hub page for generation-specific Pokémon lists.
*   **Types Hub (`/types`)**: [app/types/page.js](file:///Users/abhijit/Documents/Projects/Learning/React/poke-dexter/app/types/page.js) - Listing of Pokémon categorized by standard element types.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `>=24.12.0` (managed via `.nvmrc`)
- **npm**: Standard Node.js package manager

> **Note**: If you use Node Version Manager (`nvm`), you can optionally switch to the project's target Node version by running `nvm use`.

### Installation

Clone the repository and install the dependencies:
```bash
git clone https://github.com/abhijeetjha0/poke-dexter.git
cd poke-dexter
npm install
```

### Run Local Development Server

Start the development server:
```bash
npm run dev
```
Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🧪 Testing & Code Quality

```bash
# Run full Jest unit test suite (with coverage report)
npm test

# Run specific tests matching a pattern (e.g. Navbar)
npm run test-filter -- Navbar

# Run Jest tests in interactive watch mode
npm run test:watch

# Run ESLint code quality checks
npm run lint

# Automatically fix linting issues
npm run lint-fix

# Run Stylelint SCSS style checks
npm run lint-style

# Automatically fix SCSS styling issues
npm run lint-style-fix
```

---

## 📦 Testing Production Build Locally

Because the application is configured to deploy to GitHub Pages (which requires a repository subpath, `/poke-dexter`), we conditionally apply a `basePath` in production only. To test the exact production build on your local machine:

1. **Build the static site**:
   ```bash
   npm run build
   ```
   This outputs the compiled static pages into the `/out` directory.

2. **Serve the static export**:
   ```bash
   npx serve out
   ```

3. **View the site**:
   Open the address returned in the terminal (usually port 3000 or 5000) and append the subpath:
   ```url
   http://localhost:3000/poke-dexter
   ```

---

## 🔄 CI/CD & Deployment Pipeline

Automated via GitHub Actions ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)):

1. **Checkout & Node Setup**: Restores code and sets up Node.js via `.nvmrc` with npm caching.
2. **Dependency Installation**: `npm ci`
3. **Mandatory Test Execution**: `npm test` executes the Jest unit test suite.
4. **Static Site Build**: `npm run build` compiles Next.js static HTML export to `./out`.
5. **Deployment**: Deploys `./out` to GitHub Pages ([https://abhijeetjha0.github.io/poke-dexter/](https://abhijeetjha0.github.io/poke-dexter/)).
