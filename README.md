<p align="right">
  <a href="https://abhijeetjha0.github.io/poke-dexter/">
    <img src="https://img.shields.io/badge/🌐_Visit_PokeDexter-Live_App-ff5350?style=for-the-badge" alt="Visit Live App" />
  </a>
</p>

# PokeDexter 📱✨

[![Deploy Status](https://github.com/abhijeetjha0/poke-dexter/actions/workflows/deploy.yml/badge.svg)](https://github.com/abhijeetjha0/poke-dexter/actions/workflows/deploy.yml)
[![Code Coverage](https://abhijeetjha0.github.io/poke-dexter/coverage/badge.svg)](https://abhijeetjha0.github.io/poke-dexter/coverage/)

PokeDexter is a feature-rich, cross-platform Pokémon information application. It is built using **Next.js**, **React**, and **SCSS**, featuring a sleek dark-mode design, centralized API architecture, unit test coverage, and complete mobile responsiveness. Special thanks and shout out to the amazing [PokéAPI](https://pokeapi.co/) for powering this app!

> **Collaborators**: [Abhijit Kumar Jha](https://github.com/abhijeetjha0) and [Kanishk Tanwar](https://github.com/kanishktanwar).

---

## 🌟 Key Features

*   **Pokedex**: Search and browse through over 1,000 Pokémon species with an interactive search bar, paginated listings, and generation-based filtering.
*   **Global Search**: Unified autocomplete search bar in the navigation menu to instantly jump to specific Pokémon, Moves, or Abilities.
*   **Rich Details Views**: Comprehensive profile pages for individual Pokémon showing:
    *   Visual Evolution Chains
    *   Dynamic variety listings (Megas, Gigantamax, Alolan forms, etc.)
    *   English description entries
    *   Stat tables with bars
    *   Calculated double/half/immune type defense multipliers
    *   Game-by-game encounter locations and capture methods
    *   Interactive move learnsets (level up, machine, tutor, egg)
*   **Team Builder**: Create and manage custom Pokémon teams (up to 6 members), analyze team type defenses, and calculate aggregate weaknesses/resistances.
*   **Abilities**: Index of all passive/active abilities, featuring search functionality and detailed lists of compatible Pokémon.
*   **Moves**: Complete directory of catalogued moves showing Power, Accuracy, PP, damage class (Physical, Special, Status), and which Pokémon learn them.
*   **Items Dex**: Searchable directory of items with detailed pages showing effects, fling power, cost, attributes, and wild Pokémon that hold the item.
*   **Types**: Dynamic list of all 18 element types showing matching species.
*   **Generations Navigation Hub**: A list of all generations, each with a link to view all Pokémon in that generation.
*   **Mobile Responsiveness**: Designed using flexible edge-to-edge grid layouts on mobile and a fluid, animated mobile hamburger menu.
*   **In-App UI Manual**: A comprehensive Help page detailing all features, accessible directly within the application (served on GitHub Pages).

---

## 📖 In-App UI Manual

PokeDexter includes a fully integrated, interactive **Help Manual** documenting every feature and functionality available in the app. 
Whether you're exploring the Pokedex, learning how to use the Team Builder's weakness analysis, or simply browsing items and moves, the manual provides detailed, step-by-step guidance.

We highly suggest that users **read the manual** to fully understand how to use the application's extensive features. 
You can access it at any time via the "Help" link in the top navigation bar, by clicking the floating info button on any page, or directly on the [GitHub Pages deployment](https://abhijeetjha0.github.io/poke-dexter/help).

---

## 🛠️ Tech Stack

*   **Core**: [Next.js 16](https://nextjs.org/) (App Router, Static Export configuration) & [React 19](https://react.dev/)
*   **UI Framework**: [React Bootstrap](https://react-bootstrap.netlify.app/) (Grid systems, responsive navbar, component styling)
*   **Styling**: [Sass (SCSS)](https://sass-lang.com/) for custom color variables, component themes, and media queries
*   **Code Quality**: [ESLint 9](https://eslint.org/) for JavaScript/JSX and [Stylelint 16](https://stylelint.io/) for SCSS validation
*   **Testing**: [Jest](https://jestjs.io/) & [React Testing Library](https://testing-library.com/) with [jest-fetch-mock](https://github.com/jefflau/jest-fetch-mock)
*   **Typography**: Google Fonts (Outfit for body, Orbitron for high-tech digital readouts)
*   **Icons**: [Google Material Symbols](https://fonts.google.com/icons) for modern, lightweight, and scalable iconography
*   **API**: [PokéAPI v2](https://pokeapi.co/) for complete real-time Pokémon data (encapsulated via `app/api-requests`)

---

## 🗺️ Routing & Project Structure

The project utilizes the **Next.js App Router** with file-system-based routing. All route paths correspond directly to folders inside the `/app` directory:

*   **API Layer (`app/api-requests`)**: [app/api-requests/index.js](./app/api-requests/index.js) - Centralized PokéAPI network request module.
*   **Home (`/`)**: [app/page.js](./app/page.js) - Landing page introducing PokeDexter.
*   **Pokedex List (`/pokemons`)**: [app/pokemons/page.js](./app/pokemons/page.js) - Paginated list of all Pokémon.
*   **Pokémon Details (`/pokemons/[name]`)**: [app/pokemons/[name]/page.js](./app/pokemons/%5Bname%5D/page.js) - Dynamic profile page for each Pokémon.
*   **Team Builder (`/team-builder`)**: [app/team-builder/page.js](./app/team-builder/page.js) - Interactive team composition and analysis tool.
*   **Abilities List (`/abilities`)**: [app/abilities/page.js](./app/abilities/page.js) - Index list of abilities.
*   **Ability Details (`/abilities/[name]`)**: [app/abilities/[name]/page.js](./app/abilities/%5Bname%5D/page.js) - Detailed view of Pokémon having a specific ability.
*   **Moves List (`/moves`)**: [app/moves/page.js](./app/moves/page.js) - Catalog of moves.
*   **Move Details (`/moves/[name]`)**: [app/moves/[name]/page.js](./app/moves/%5Bname%5D/page.js) - List of Pokémon that can learn a specific move.
*   **Items List (`/items`)**: [app/items/page.js](./app/items/page.js) - Index list of all Pokémon items.
*   **Item Details (`/items/[name]`)**: [app/items/[name]/page.js](./app/items/%5Bname%5D/page.js) - Detailed view of a specific item.
*   **Generations List (`/generations`)**: [app/generations/page.js](./app/generations/page.js) - List page for generation-specific Pokémon lists.
*   **Types List (`/types`)**: [app/types/page.js](./app/types/page.js) - Listing of Pokémon categorized by standard element types.
*   **Type Details (`/types/[name]`)**: [app/types/[name]/page.js](./app/types/%5Bname%5D/page.js) - Detailed list of Pokémon belonging to a specific element type.
*   **Help / User Manual (`/help`)**: [app/help/page.js](./app/help/page.js) - In-app manual explaining how to use all the UI features.

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
Open your browser and navigate to [localhost](http://localhost:3000) to view the application.

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
