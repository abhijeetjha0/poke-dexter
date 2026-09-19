<p align="right">
  <a href="https://poke-dexter-abhijeetjha0.vercel.app">
    <img src="https://img.shields.io/badge/🌐_Visit_PokeDexter-Live_App-ff5350?style=for-the-badge" alt="Visit Live App" />
  </a>
</p>

# ⚡ PokeDexter: The Ultimate Pokémon Information Hub 📱✨

PokeDexter is a feature-rich, cross-platform application designed to be the definitive source for all things Pokémon. Built with modern web technologies, it offers a sleek dark-mode interface, centralized API architecture, and complete mobile responsiveness.

We harness the power of the incredible [PokéAPI](https://pokeapi.co/) to deliver deep, interactive data about over 1,000 Pokémon species, moves, items, and more. 

[![Code Coverage](https://abhijeetjha0.github.io/poke-dexter/coverage/badge.svg)](https://abhijeetjha0.github.io/poke-dexter/coverage/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Vercel](https://img.shields.io/github/deployments/abhijeetjha0/poke-dexter/production?label=Vercel&logo=vercel)](https://poke-dexter-abhijeetjha0.vercel.app)

**Collaborators**: [Abhijit Kumar Jha](https://github.com/abhijeetjha0) and [Kanishk Tanwar](https://github.com/kanishktanwar).

--- 

## 🌟 Core Features

PokeDexter is packed with powerful tools, making it the ultimate resource for Pokémon enthusiasts:

*   **Comprehensive Pokedex**: Search and explore over 1,000 species with interactive search, paginated listings, and generation-based filtering.
*   **Deep Details Views**: Dive into rich profile pages featuring:
    *   Visual Evolution Chains
    *   Dynamic Variety Listings (Megas, Gigantamax, Alolan forms, etc.)
    *   Detailed Stat Tables with Visual Bars
    *   Calculated Type Defense Multipliers
    *   Game-by-game Encounter Locations and Capture Methods
    *   Interactive Move Learnsets (Level up, Machine, Tutor, Egg)
*   **Team Builder**: Create and manage custom Pokémon teams (up to 6 members), analyze aggregate type defenses, and calculate team weaknesses/resistances.
*   **Massive Directories**: Dedicated, searchable sections for:
    *   **Moves**: Full catalog of moves, including Power, Accuracy, PP, Damage Class, and learning Pokémon.
    *   **Abilities**: Index of all abilities with detailed compatibility lists.
    *   **Items Dex**: Searchable directory of items showing effects, fling power, cost, and wild Pokémon holders.
    *   **Types**: Dynamic list of all 18 element types categorized by species.
*   **Generations Hub**: A navigation hub to easily view all Pokémon from each generation.
*   **Global Search**: Unified autocomplete search across the application for instant navigation to Pokémon, Moves, or Abilities.
*   **Mobile First Design**: Optimized using flexible edge-to-edge grid layouts and an animated mobile hamburger menu for seamless experience.
*   **In-App UI Manual**: A comprehensive Help section integrated directly into the app for step-by-step feature guidance.

--- 

## 🗺️ Project Structure & Routing

We utilize the **Next.js App Router** with file-system-based routing, ensuring a clean and scalable application structure:

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

## 💻 Tech Stack & Architecture

PokeDexter is built on a robust, high-performance stack:

*   **Frontend Core**: [Next.js 16](https://nextjs.org/) (using App Router and Static Export configuration) & [React 19](https://react.dev/)
*   **UI Framework**: [React Bootstrap](https://react-bootstrap.netlify.app/) for responsive grid systems, navigation, and component styling.
*   **Styling**: [Sass (SCSS)](https://sass-lang.com/) leveraged for custom color variables, thematic styling, and complex media queries.
*   **Code Quality**: Strict adherence to standards using [ESLint 9](https://eslint.org/) for JavaScript/JSX and [Stylelint 16](https://stylelint.io/) for SCSS validation.
*   **Testing Suite**: Comprehensive unit testing via [Jest](https://jestjs.io/) & [React Testing Library](https://testing-library.com/) (using `jest-fetch-mock` for API mocking).
*   **Typography**: Custom fonts: **Outfit** (for body text) and **Orbitron** (for high-tech data readouts).
*   **Iconography**: [Google Material Symbols](https://fonts.google.com/icons) ensuring modern, scalable iconography.
*   **Data Source**: [PokéAPI v2](https://pokeapi.co/)—the single source of truth for all Pokémon data, abstracted via the `app/api-requests` layer.

--- 

## 🚀 Getting Started

### Prerequisites

*   **Node.js**: `>=24.12.0` (managed via `.nvmrc`)
*   **npm**: Standard Node.js package manager

> **Note**: We highly recommend using the Node Version Manager (`nvm`) to switch to the project's specified version by running `nvm use`.

### Installation

Clone the repository and install dependencies:
```bash
git clone https://github.com/abhijeetjha0/poke-dexter.git
cd poke-dexter
npm install
```

### Run Local Development Server

Start the development server to view your project:
```bash
npm run dev
```
Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to start exploring PokeDexter.

--- 

## 🧪 Testing & Code Quality Guidelines

Our commitment to quality is reflected in our comprehensive testing setup. Use these commands to run all relevant checks:

**Unit & E2E Testing:**
```bash
npm test
```

**Specific Test Runs:**
```bash
npm run test-filter -- Navbar  # Run tests matching a specific component pattern.
npm run test:watch       # Run Jest tests in interactive watch mode.
```

**Linting & Formatting Checks:**
```bash
npm run lint              # Check for code quality issues (ESLint).
npm run lint-fix          # Automatically fix linting errors.
npm run lint-style        # Check SCSS style rules (Stylelint).
npm run lint-style-fix    # Automatically fix SCSS styling issues.
```

--- 

## 📦 Production Build & Deployment

### Testing Production Locally

PokeDexter is configured as a dynamic Next.js application optimized for Vercel deployment. To verify the production build locally:

1. **Build the Application**: Compiles the optimized Next.js production bundle into `.next`.
   ```bash
   npm run build
   ```
2. **Start the Production Server**: Launches the Next.js production server.
   ```bash
   npm run start
   ```
3. **View the Site**: Open your browser and navigate to root:
   ```url
   http://localhost:3000
   ```

### Deployment Strategy via Vercel

The application deploys to Vercel from the `main` branch:

* **Production — `main` branch**: The primary deployment target hosted on Vercel via native Git Integration. Every push to `main` automatically triggers an optimized Next.js production build with dynamic ISR rendering, edge caching, and image optimization. Live at [`https://poke-dexter-abhijeetjha0.vercel.app`](https://poke-dexter-abhijeetjha0.vercel.app).
