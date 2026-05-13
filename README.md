# Teacher Life - Pocket Professor Simulation

**Developed by:** Marta Gonzalez Gonzalez  
**Live Project Link (GitHub Pages):** https://mgg06.github.io/Pocket-Professor-Module20/

---

## Project Overview

**Teacher Life** is an interactive web-based simulation game developed using HTML5, CSS3, and Vanilla JavaScript (ES6+). The primary objective is to manage and care for a group of teachers from an educational center (MEDAC), ensuring their "Hunger" and "Happiness" levels are maintained at optimal states through resource management and social interactions.

### Key Features
- **Resource & Needs Management:** The teachers' hunger and happiness metrics decay dynamically over time via a global game loop. The player must strategically utilize items to restore these levels and keep the characters satisfied.
- **Virtual Economy & E-Commerce System:** Features a fully functional shopping cart system. Players use a virtual currency balance to purchase food at the "MERCADONA" supermarket and gifts at the "ZONA ESTE" store. The system handles dynamic subtotals, quantity tracking, and balance validation.
- **Interactive Inventory (Drag & Drop):** Built with the HTML5 Drag & Drop API, players can open their backpack and seamlessly drag consumable items or toys directly onto the teacher avatars to trigger unique interactions, physics-based reactions, and state changes.
- **Dynamic Character Interactions:** Includes branching dialogue trees where choices affect happiness, a randomized "Break Time" roulette mini-game rendered with dynamic CSS conic gradients, and customizable classroom environments.
- **Autonomous AI Group Excursions:** Using the "Tranvibus", players can group up to 4 teachers and transport them to external environments (Plaza, Convention Center). The simulation utilizes a custom AI logic loop for autonomous roaming, collision detection, and dynamic group conversations based on proximity and group size.

### Code Architecture

The project follows a strict modular architecture in JavaScript to ensure clean, maintainable, and scalable code. All logic is separated into specific scripts within the `js/` directory:

- `globals.js`: Global state variables, audio controllers, and custom UI modal alerts that replace native browser prompts.
- `data.js`: Acts as the local database, containing massive dictionaries for store items, dialogue trees, and base character statistics.
- `navigation.js`: A custom routing engine that handles screen transitions, state resets, and memory management between different views.
- `city.js` / `apartment.js`: DOM manipulation modules responsible for rendering the interactive city map, building tooltips, and the main hallway UI.
- `shop.js`: Contains the e-commerce logic, managing the cart object, calculating totals, and processing checkout transactions.
- `inventory.js`: Manages the player's backpack UI and handles the entire Drag & Drop event lifecycle.
- `teacher.js`: The core game loop responsible for character physics, triggering CSS keyframe animations, handling randomized pathfinding, and updating UI stat bars.

---

## Assignment: AI-Assisted Development and Git Mastery

This repository not only contains the source code for "Teacher Life" but also serves as documentation for fulfilling the requirements of the "AI-Assisted Development and Git Mastery" assignment. It demonstrates collaborative development with Artificial Intelligence and proficient version control management using the Git Command Line Interface (CLI).

### Phase 1: The AI-Pair Program
Generative AI tools were actively utilized as collaborative partners to draft complex logic, restructure the architecture, and debug the application. 

**AI Contributions:**
- Generating and structuring large data dictionaries (`storeItems`, `teachersData`) and dialogue variations.
- Crafting complex CSS keyframe animations to bring the 2D avatars to life (walking, jumping, struggling).
- Refactoring the original monolithic code into a modular structure within the `js/` directory to enforce clean code best practices.
- Debugging issues related to collision detection, asynchronous timeouts, and the custom Drag & Drop ghost image generation.

### Phase 2: Git Command Line Integration
The entire software development lifecycle was managed using the integrated terminal via standard Git commands:

1. **Initialization:** Created the local repository using `git init`.
2. **Tracking and Commits:** Maintained a clean history by consistently using `git status`, staging changes with `git add .`, and creating snapshots with descriptive `git commit -m` messages.
3. **Branch Management:** Isolated new features (such as refactoring the JS folder or building the shop logic) into dedicated branches (e.g., `feature-update`) using `git branch` and `git checkout`, before safely integrating them back into the main branch via `git merge`.
4. **Remote Repository & Deployment:** Linked the local repository to a public GitHub repository (`git remote add origin`) and synchronized the history using `git push`.
5. **GitHub Pages Deployment:** Configured the repository settings to host the dynamic web application live on GitHub Pages.

---

## Included Deliverables

As part of the assignment evaluation criteria, the following have been submitted and uploaded along with the code:

1. **Source Code and Live Link:** The complete, fully commented application source code hosted in this repository, along with the live GitHub Pages link provided at the top.
2. **Presentation PDF (The Git Journey):** A slide deck documenting the workflow with terminal screenshots. It provides evidence of initialization, file modification tracking, branch management, and deployment.
3. **Git Cheat Sheet PDF:** A comprehensive one-page reference guide created by the developer, listing the essential Git CLI commands used during the project with brief descriptions for future reference.

---

*Project developed entirely for educational purposes.*  
*Marta Gonzalez Gonzalez.*
