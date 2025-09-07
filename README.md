# 🍽️ Feast Frenzy

> *A Dark Comedy Restaurant Simulation Game*

**Feast Frenzy** is a twisted restaurant simulation game that blends the frantic cooking mechanics of *Overcooked* with a darkly humorous narrative. Manage a bustling restaurant where adorable anthropomorphic animal customers become the very ingredients for your most popular dishes! 


## ✨ Features

### 🍳 **Core Gameplay**
- **Restaurant Management**: Run a busy kitchen with multiple cooking stations
- **Customer Service**: Serve 13 unique anthropomorphic animal customers, each with distinct personalities and preferences
- **Dark Twist**: Transform satisfied customers into premium ingredients through the "VIP Dining Experience"
- **Strategic Cooking**: Master 4 dish types (Appetizers, Soups, Main Courses, Desserts) with color-coded complexity

### 🎯 **Game Mechanics**
- **Satisfaction System**: Fill customer meters by serving their preferred dishes
- **Deliciousness Rating**: Build 5-star ratings to unlock better processing rewards
- **Combo Chains**: String together successful services for multiplier bonuses
- **Special Traits**: Each customer type has unique gameplay mechanics:
  - 🦌 **Deer Girl**: Low appetite, easy to satisfy
  - 🐻 **Bear Girl**: Massive appetite, huge rewards
  - 🦊 **Fox Girl**: Cunning - can steal food from stations
  - 🐒 **Monkey Girl**: Throws food when impatient

### 🎨 **Visual & Audio**
- **Kawaii Aesthetic**: Bright, cheerful visuals that contrast with dark themes
- **Smooth Animations**: Powered by Framer Motion for delightful interactions
- **Responsive Design**: Fully responsive UI built with Tailwind CSS
- **Character Variety**: 13+ unique customer designs with personality-driven animations

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **npm** or **yarn**

### Installation

```bash
# Clone the repository
git clone https://github.com/Kalaith/food_frenzy.git
cd feast-frenzy

# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to start playing!

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎮 How to Play

### Getting Started
1. **Welcome Customers**: Animal customers arrive automatically at your restaurant tables
2. **Check Preferences**: Each customer has favorite dish types (color-coded)
3. **Cook Dishes**: Use the 4 cooking stations to prepare meals:
   - 🔵 **Blue Station**: Appetizers (Spring Rolls, Cheese Bites)
   - 🟢 **Green Station**: Soups (Vegetable Soup, Bone Broth) 
   - 🟡 **Yellow Station**: Main Courses (Grilled Steaks, Pasta)
   - 🔴 **Red Station**: Desserts (Chocolate Cake, Ice Cream)

### Advanced Strategy
4. **Serve Strategically**: Drag finished dishes to customers
   - **Preferred dishes**: +12 satisfaction, +1 deliciousness ⭐
   - **Other dishes**: +8 satisfaction
5. **Build Satisfaction**: Fill the customer's meter to 120+ points
6. **Achieve 3+ Stars**: Get deliciousness rating to 3+ stars
7. **VIP Invitation**: Send satisfied customers to the Special Table for "VIP Dining Experience"
8. **Score Points**: Earn points and unlock progression rewards

### Pro Tips 💡
- **Deer Girls** need less food - easy early targets
- **Bear Girls** need lots of food but give massive rewards
- **Fox Girls** might steal your cooking progress - watch out!
- **Chain combos** for score multipliers
- **Balance speed vs. satisfaction** - don't rush the process

## 🏗️ Technical Architecture

### Frontend Stack
- **React 19**: Modern functional components with hooks
- **TypeScript**: Full type safety and excellent developer experience
- **Vite**: Lightning-fast development and optimized builds
- **Tailwind CSS**: Utility-first styling for rapid UI development
- **Framer Motion**: Smooth animations and micro-interactions
- **Zustand**: Lightweight state management with persistence

### Project Structure
```
frontend/src/
├── components/           # React components
│   ├── game/            # Game-specific components
│   └── ui/              # Reusable UI components
├── hooks/               # Custom React hooks
├── stores/              # Zustand state management
├── types/               # TypeScript type definitions
├── constants/           # Game balance and configuration
└── assets/              # Static assets
```

### Key Features
- **Modular Architecture**: Clean separation of concerns
- **Custom Hooks**: Reusable game logic (customer spawning, dish handling, VIP invitations)
- **Type Safety**: Comprehensive TypeScript coverage
- **Performance**: Optimized rendering with React.memo and useCallback
- **Responsive**: Mobile-first design with Tailwind breakpoints

## 🎯 Customer Types

| Customer | Personality | Preferences | Special Trait |
|----------|-------------|-------------|---------------|
| 🐷 **Pig Girl** | Hearty eater | Main courses, desserts | Standard appetite |
| 🐄 **Cow Girl** | Substantial appetite | Soups, main courses | High yield |
| 🐑 **Sheep Girl** | Gentle, light eater | Appetizers, soups | Easy to please |
| 🐰 **Rabbit Girl** | Quick, nibbling | Appetizers, desserts | Low base deliciousness |
| 🐱 **Cat Girl** | Picky, refined | Main courses, appetizers | High base deliciousness |
| 🦌 **Deer Girl** | Shy, polite | Fresh greens, appetizers | **Low appetite** (30% less) |
| 🦆 **Duck Girl** | Quirky, loud | Bread meals, soups | **Can wander** |
| 🐔 **Chicken Girl** | Nervous, fussy | Grain meals, fried foods | **Multiplies on process** |
| 🐟 **Fish Girl** | Cool, laid-back | Sushi, light fare | **Fast spoilage** |
| 🦊 **Fox Girl** | Cunning, sly | Spicy dishes, street food | **Can steal food** |
| 🐐 **Goat Girl** | Stubborn, quirky | Herbs, chewy foods | **Eats anything** |
| 🐻 **Bear Girl** | Big appetite | Honey desserts, stews | **High appetite** (50% more) |
| 🐒 **Monkey Girl** | Energetic, chaotic | Fruits, finger foods | **Throws food** |

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Quality Assurance (Future)
npm run test         # Run tests
npm run test:coverage # Generate coverage report
npm run type-check   # TypeScript type checking
```

### Game Balance Configuration

Easily adjust game difficulty in `src/constants/gameBalance.ts`:

```typescript
export const GAME_BALANCE = {
  CUSTOMER_SPAWN_INTERVAL: 20000,    // Time between customers
  BASE_SATISFACTION_GAIN: 8,         // Points per dish
  PREFERRED_SATISFACTION_GAIN: 12,   // Points for preferred dishes
  MAX_SATISFACTION_PER_TYPE: 40,     // Max points per dish type
  VIP_SATISFACTION_THRESHOLD: 120,   // Points needed for VIP
  // ... more settings
};
```

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Follow the [WebHatchery Frontend Standards](./standards-frontend.md)
4. Commit changes: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 🗺️ Roadmap

### 🚀 **v1.0 - Core Experience** (Current)
- [x] Basic restaurant management
- [x] 13 unique customer types
- [x] Cooking and serving mechanics
- [x] VIP processing system
- [x] Score and progression tracking

### 🔮 **v1.1 - Special Mechanics** (Next)
- [ ] Duck wandering behavior
- [ ] Fox food stealing mechanics
- [ ] Monkey food throwing chaos
- [ ] Chicken multiplication rewards
- [ ] Fish spoilage timers

### 🏆 **v1.2 - Progression System**
- [ ] Upgrade shop implementation
- [ ] Recipe unlocking system
- [ ] Achievement system
- [ ] Prestige mechanics

### 🎭 **v1.3 - Enhanced Experience**
- [ ] Sound effects and music
- [ ] Particle effects
- [ ] Customer dialogue system
- [ ] Seasonal events


## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**🍽️ Feast Frenzy - Where Every Customer is a Future Ingredient! 🍽️**

*Made with ❤️ and a touch of dark humor*

</div>
