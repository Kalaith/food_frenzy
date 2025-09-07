# Feast Frenzy: Game Design Document

## 1. Overview

**Feast Frenzy** is a dark comedy restaurant simulation game that blends the frantic cooking mechanics of *Overcooked* with a twisted narrative where anthropomorphic animal customers become ingredients for the restaurant's most popular dishes. Presented in a cheerful, kawaii-style aesthetic that contrasts sharply with its darker themes, the game creates cognitive dissonance to enhance its humorous impact.

**Genre:** Cooking Simulation / Dark Comedy  
**Platform:** Web-based (HTML5)  
**Player Count:** Single Player  
**Development Status:** Fully Functional Prototype  

## 2. Game Concept

Feast Frenzy reimagines the restaurant simulation genre by introducing a macabre twist: customers are not just patrons but potential ingredients. Players manage a bustling restaurant where cute animal girls arrive as customers, are served increasingly elaborate meals to fatten them up, and are ultimately processed into high-quality meat for future dishes. The game balances strategic restaurant management with the ethical horror of the customer-to-ingredient cycle, all wrapped in adorable visuals and upbeat gameplay.

**Core Loop:**
1. Welcome anthropomorphic animal customers
2. Serve color-coded dishes to satisfy and overfeed them
3. Process satisfied customers into ingredients
4. Use those ingredients to create premium dishes for new customers
5. Build combo chains for escalating multipliers

## 3. Target Audience

- **Primary:** Adults 18+ who enjoy dark humor, simulation games, and cooking titles
- **Secondary:** Fans of *Overcooked*, *Animal Crossing*, and cooking simulations
- **Appeal:** Players who appreciate irony, satire, and the juxtaposition of cute aesthetics with dark themes

## 4. Gameplay Mechanics

### 4.1 Customer System
- **Customer Types:** Five distinct anthropomorphic animal girls (pig, cow, sheep, rabbit, cat) with unique preferences and personality traits
- **Arrival:** Customers enter the restaurant and take seats at tables
- **Satisfaction:** Each customer has individual preferences for dish types and quality

### 4.2 Satisfact-O-Meter System
- **Visual Design:** Horizontal progress bar divided into four colored segments:
  - Blue: Appetizers
  - Green: Soups
  - Yellow: Main Courses
  - Red: Desserts
- **Mechanics:** Players must serve dishes matching these color codes to fill segments
- **Overfeeding:** Continue serving dishes even when segments appear full, pushing satisfaction beyond 100% to increase meat yield

### 4.3 Deliciousness Rating System
- **Rating Scale:** 1-5 stars displayed above each customer
- **Improvement:** Ratings increase when served preferred dishes
- **Impact:** Higher ratings result in better meat quality during processing

### 4.4 Processing Mechanic
- **Special Table:** Designated area where overfed, high-rating customers are converted into ingredients
- **Meat Yield:** Quantity depends on overfeeding level
- **Meat Quality:** Determined by deliciousness rating
- **Integration:** Processed ingredients used in premium dish recipes

### 4.5 Chain Combo System
- **Mechanics:** Track chains where Customer A becomes ingredients for Customer B, who becomes ingredients for Customer C
- **Rewards:** Escalating multipliers for longer chains
- **Scoring:** Bonus points and achievements for combo mastery

### 4.6 Cooking Stations
- **Stations:** Four distinct areas:
  - Appetizer Station
  - Soup Station
  - Main Course Station
  - Dessert Station
- **Mechanics:** Each station has different cooking times and dish varieties
- **Strategy:** Requires time management and coordination

### 4.7 Restaurant Upgrades
- **Equipment Upgrades:** Unlock faster ovens, automated serving belts, and meat tenderizers to improve efficiency
- **Decor Upgrades:** Aesthetic improvements that subtly influence gameplay mechanics
  - "Cute Wallpaper" keeps customers calm longer, reducing impatience penalties
  - "Cozy Lighting" slightly increases satisfaction rates
  - "Soundproofing" reduces noise complaints from processing activities
- **Capacity Upgrades:** Increase maximum customer seating and processing throughput
- **Upgrade Currency:** Earned through successful runs and combo chains
- **Visual Feedback:** Upgrades change restaurant appearance while maintaining kawaii aesthetic

### 4.8 Recipe Unlock System
- **Species-Specific Recipes:** Each customer type unlocks unique recipes when processed
  - Pig Girl: Bacon ramen, pulled pork dishes, sausage specialties
  - Cow Girl: Cheese-based recipes, milkshakes, beef stews
  - Sheep Girl: Wool-inspired dishes, lamb curries, mint specialties
  - Rabbit Girl: Light vegetable dishes, rabbit stew variations
  - Cat Girl: Seafood recipes, tuna dishes, cat-themed delicacies
- **Secret Recipes:** Rare combinations unlock premium dishes
  - "Rainbow Stew" from processing all five species in one chain
  - "Forbidden Feast" from overfeeding customers to extreme levels
  - "Customer Cascade" from creating 10+ link combo chains
- **Recipe Discovery:** New recipes appear in the menu after unlocking conditions are met
- **Quality Multipliers:** Unlocked recipes provide higher profit margins and customer satisfaction

## 5. Characters

### 5.1 Customer Types
1. **Pig Girl:** Prefers hearty, filling dishes; high meat yield potential
2. **Cow Girl:** Loves dairy-based recipes; produces versatile ingredients
3. **Sheep Girl:** Enjoys wool-inspired dishes; unique flavor profiles
4. **Rabbit Girl:** Prefers light, vegetable-forward meals; lean meat
5. **Cat Girl:** Demanding with specific preferences; high-quality output

### 5.2 Personality Traits
- Each customer type has distinct behaviors and dialogue
- Preferences influence satisfaction rates and processing outcomes
- Visual designs maintain kawaii aesthetic despite dark implications

## 6. Art Style & Visual Design

### 6.1 Overall Aesthetic
- **Style:** Kawaii-inspired with bright colors and cute character designs
- **Inspiration:** *Animal Crossing*, chibi art, and anime character sprites
- **Contrast:** Cheerful visuals mask darker gameplay elements for humorous effect

### 6.2 Character Design
- **Anthropomorphic Animals:** Cute girl versions of farm animals
- **Expressions:** Range from happy and satisfied to comically distressed
- **Animations:** Smooth, exaggerated movements for comedic timing

### 6.3 Environment
- **Restaurant Interior:** Cozy, welcoming space with cooking stations and tables
- **Color Palette:** Vibrant and inviting, using the color-coded system throughout
- **Details:** Subtle hints at the darker theme through environmental storytelling

## 7. Sound & Music

### 7.1 Audio Design
- **Music:** Upbeat, cheerful background tracks to contrast with dark themes
- **Sound Effects:** Satisfying cooking sounds, customer reactions, and processing effects
- **Voice Acting:** Optional cute voice lines for customers with humorous undertones

### 7.2 Audio-Visual Synergy
- **Feedback:** Audio cues for successful combos and overfeeding
- **Atmosphere:** Creates immersion while enhancing the ironic humor

## 8. User Interface

### 8.1 HUD Elements
- **Progress Bars:** Color-coded Satisfact-O-Meter for each customer
- **Ratings:** Star displays for deliciousness
- **Timers:** Cooking station progress indicators
- **Score/Multiplier:** Real-time combo tracking

### 8.2 Menu Systems
- **Order Display:** Visual representation of customer preferences
- **Inventory:** Ingredient management interface
- **Settings:** Audio, difficulty, and accessibility options

### 8.3 Accessibility
- **Colorblind Support:** Alternative indicators for color-coded systems
- **Keyboard Support:** Full keyboard navigation and controls

## 9. Technical Specifications

### 9.1 Platform Requirements
- **Web Browser:** Modern HTML5-compatible browsers (Chrome, Firefox, Safari, Edge)
- **Minimum Specs:** Standard web browsing capabilities with JavaScript enabled
- **Recommended:** High-performance browser for smooth animations

### 9.2 Technology Stack
- **Framework:** React 19+ (latest stable)
- **Language:** TypeScript (strict mode enabled)
- **Build Tool:** Vite for dev/prod builds
- **Styling:** Tailwind CSS with design tokens
- **Animation:** Framer Motion for transitions and effects
- **Routing:** React Router DOM
- **State Management:** Zustand (split by domain, persisted with localStorage)
- **Server State (Optional):** React Query for API calls
- **Testing:** Vitest + React Testing Library, Playwright for E2E
- **Linting & Formatting:** ESLint (strict rules) + Prettier
- **CI/CD:** GitHub Actions pipeline with lint, type-check, test, build, artifact verification
- **Documentation:** Storybook for UI components, ADRs for architecture decisions

### 9.3 Project Structure
Following WebHatchery feature-based standards:
```
src/
├── api/                # Centralized API calls and types
├── assets/             # Static assets (sprites, sounds, icons)
├── components/         # Shared, reusable UI components (atoms, molecules)
├── features/           # Feature-based modules
│   ├── customers/      # Customer logic, UI, and stores
│   ├── cooking/        # Cooking stations, timers, recipes
│   ├── combos/         # Chain combo scoring and UI
│   ├── progression/    # Upgrades, unlocks, meta-progression
│   └── audio/          # Sound effects and music handling
├── hooks/              # Custom reusable hooks (e.g., useGameLoop)
├── stores/             # Zustand domain stores (split by feature)
├── types/              # TypeScript global types/interfaces
├── utils/              # Shared utilities (calculations, formatters)
├── styles/             # Global Tailwind config and CSS
├── App.tsx             # Root component with routing
├── main.tsx            # Entry point
└── vite-env.d.ts       # Vite environment types
```

### 9.4 Development Standards
- **Components:** Functional components only, atomic design principles
- **Naming Conventions:** Follow WebHatchery rules (PascalCase for components, camelCase for hooks/stores)
- **State:** Domain-specific Zustand stores with persist middleware and selectors
- **Styling:** Tailwind classes with responsive utilities, no inline styles
- **Performance:** Code splitting via `React.lazy`, lazy loading assets, memoization of expensive renders
- **Testing:** Unit, integration, and E2E coverage with thresholds enforced in CI
- **Security:** Sanitize user-facing text, avoid `dangerouslySetInnerHTML`, secure token handling if monetization added
- **Accessibility:** WCAG compliance, role attributes (`progressbar`), alternative indicators for colorblind users

### 9.5 Performance Targets
- **Frame Rate:** 60 FPS target
- **Load Times:** <3 seconds on modern browsers
- **Bundle Size:** Monitored with CI performance budgets
- **Scalability:** Modular feature structure supports future expansions (new customers, recipes, progression systems)

### 9.4 Development Standards
- **Component Architecture:** Functional components with hooks, no class components
- **Type Safety:** Strict TypeScript with no `any` types, comprehensive interfaces
- **State Management:** Zustand stores with persistence for game progress
- **Styling:** Tailwind CSS utility classes, responsive design
- **Performance:** Code splitting, lazy loading, memoization where needed
- **Testing:** Unit tests for components and hooks using Vitest
- **Code Quality:** ESLint enforcement, Prettier formatting, clean code principles
- **Security:** Input validation, XSS prevention, secure API practices

### 9.5 Performance Targets
- **Frame Rate:** 60 FPS target for smooth gameplay
- **Load Times:** Optimized Vite builds with code splitting
- **Bundle Size:** Efficient Tailwind purging and tree shaking
- **Scalability:** Modular architecture supporting feature expansion

## 10. Development Roadmap

### 10.1 Current Status
- **Prototype:** HTML5 build validated core gameplay loop
- **Transition:** Moving to React/TypeScript architecture with WebHatchery standards

### 10.2 Implementation Phases

**Phase 1: Foundation Setup**
- Initialize React/TypeScript/Vite project
- Configure Tailwind, Framer Motion, Zustand
- Establish feature-based project structure
- Set up ESLint, Prettier, Vitest, Storybook
- Implement CI/CD pipeline with GitHub Actions

**Phase 2: Core Game Systems**
- Build `customerStore` with domain logic & persistence
- Implement `CustomerCard` and Satisfact-O-Meter with accessible progress bars
- Create cooking station feature with Framer Motion animations
- Add scoring/combos feature module (`comboStore` + components)
- Implement basic recipe unlock system

**Phase 3: Progression & Game Loop**
- Implement `useGameLoop` hook for continuous updates
- Add restaurant upgrade system with equipment and decor unlocks
- Create meta-progression store for permanent upgrades
- Integrate recipe unlock mechanics tied to customer species
- Add achievement and progression tracking

**Phase 4: Testing, UX & Accessibility**
- Expand testing: unit + integration + E2E
- Add responsive UI for desktop & mobile
- Add accessibility features (colorblind modes, keyboard controls)
- Conduct cross-browser testing
- Implement progression UI and upgrade menus

**Phase 5: Optimization & Documentation**
- Optimize bundle with code splitting and lazy loading
- Add ADRs for key tech/gameplay choices
- Document UI components in Storybook
- Run performance profiling & bundle analysis
- Prepare for production deployment

### 10.3 Quality Assurance
- **Linting:** ESLint strict rules, no `any`
- **Type Safety:** TypeScript strict mode enforced in CI
- **Testing:** Vitest + React Testing Library + Playwright with >80% coverage
- **Performance:** CI performance budgets, bundle analysis
- **Accessibility:** WCAG compliance checks before release
- **Security:** XSS/CSRF prevention, sanitized rendering, secure token practices

## 11. Implementation Guidelines

### 11.1 Component Development
- Use functional components with TypeScript interfaces
- Implement custom hooks for game logic separation
- Follow atomic design principles (atoms, molecules, organisms)
- Use Framer Motion for all animations and transitions

### 11.2 State Management
- Centralize game state in Zustand stores with persistence
- Use selectors for efficient state access
- Implement proper error handling and loading states
- Follow immutable update patterns

### 11.3 Styling Approach
- Primary: Tailwind CSS utility classes
- Secondary: CSS modules for complex component-specific styles
- Ensure responsive design for mobile and desktop
- Maintain consistent design tokens and spacing

### 11.4 API Integration
- Centralize API calls in `/src/api/` directory
- Use React Query for server state management when applicable
- Implement proper error handling and retry logic
- Type all API responses and requests

### 11.5 Testing Strategy
- Unit tests for all components and hooks
- Integration tests for game mechanics
- E2E tests for critical user flows
- Maintain high test coverage (>80%)

### 11.6 Performance Optimization
- Implement code splitting for large features
- Use React.memo for expensive components
- Optimize re-renders with useMemo and useCallback
- Monitor bundle sizes and loading performance

## 12. Monetization & Business Model

### 11.1 Revenue Streams
- **Free-to-Play:** Core game available for free
- **Premium Content:** Cosmetic packs, additional recipes, and customer types
- **Microtransactions:** In-game currency for quick progression

### 11.2 Marketing Strategy
- **Target Platforms:** Steam, itch.io, and web portals
- **Social Media:** Leverage dark humor appeal
- **Community:** Build around unique concept and aesthetic contrast

## 13. Meta-Progression & Replayability

### 13.1 Permanent Upgrades
- **Cooking Speed:** Reduce preparation times across all stations
- **Customer Patience:** Increase time before customers become impatient
- **Processing Efficiency:** Improve meat yield and quality from customer processing
- **Combo Multipliers:** Higher base multipliers for chain reactions
- **Income Boosters:** Increase earnings from successful runs

### 13.2 Cosmetic Unlocks
- **Chef Attire:** Unlock different chef outfits and accessories
- **Restaurant Themes:** Alternate color schemes and decor styles
- **Customer Variants:** Rare customer appearances with unique behaviors
- **Achievement Badges:** Visual indicators of player accomplishments
- **Soundtrack Options:** Unlock additional background music tracks

### 13.3 Progression Currency
- **Meta-Currency:** Earned from run completions, combo achievements, and rare events
- **Upgrade Trees:** Branching upgrade paths allowing different playstyles
- **Prestige System:** Reset progress for bonus multipliers and exclusive unlocks
- **Seasonal Events:** Time-limited challenges with unique rewards

### 13.4 Replayability Features
- **Dynamic Difficulty:** Scaling challenge based on player skill and upgrades
- **Random Events:** Unexpected occurrences that change gameplay temporarily
- **Achievement System:** Goals and challenges to encourage different strategies
- **Daily Challenges:** Time-limited objectives with bonus rewards
- **Endless Mode:** Infinite restaurant runs with escalating difficulty

### 13.5 Save System Integration
- **Persistent Progress:** All meta-upgrades saved across sessions
- **Backup Options:** Cloud sync for progress protection
- **Transfer System:** Allow players to backup and restore their progression
- **Achievement Tracking:** Comprehensive statistics and milestone tracking

## 14. References & Inspirations

The following sources provided inspiration and research for various aspects of Feast Frenzy:

- Restaurant simulation game prototypes and templates
- UI/UX design principles for progress indicators and game interfaces
- Anthropomorphic character design in games
- Cooking game mechanics and balance
- Kawaii art style and visual design trends
- Dark comedy and satire in gaming

---

*This Game Design Document outlines the core concept, mechanics, and development vision for Feast Frenzy. The document will be updated as the game evolves and new features are implemented.*

