# 🎯 Aivora Frontend v2

A premium, next-generation AI-powered goal intelligence system built with Next.js 14, featuring stunning animations and glassmorphism design.

## ✨ Features

### 🎨 Design & Animations
- **Glassmorphism UI**: Beautiful glass cards with backdrop blur effects
- **3D Tilt Effects**: Interactive card hover animations with mouse tracking
- **Staggered Animations**: Smooth, sequential page load animations
- **Rewarding Interactions**: Animated checkboxes, strike-through effects, and confetti celebrations
- **Gradient Backgrounds**: Dynamic animated orbs and gradient overlays
- **Dark/Light Mode**: Seamless theme switching with custom color palettes

### 📄 Pages

#### Landing Page (`/`)
- Hero section with animated gradient background
- Floating orb animations
- Feature showcase with hover effects
- CTA buttons with gradient styling

#### Dashboard (`/dashboard`)
- Staggered card animations on load
- 3D tilt effects on goal cards
- Real-time progress tracking
- AI insights panel
- Statistics overview

#### Auth Pages
- **Login** (`/login`): Glassmorphism form with animated background
- **Register** (`/register`): Full registration flow with validation

#### Goal Management
- **Create Goal** (`/create-goal`): AI-powered goal creation with animated button states
- **Goal Detail** (`/goal/[id]`): 
  - Animated checkboxes with spring effects
  - Strike-through animation on task completion
  - Smooth progress bar transitions
  - Confetti celebration on task completion
  - Daily progress modal with form submission

### 🎭 Animations & Effects

#### Button States
- **Generate Plan Button**: Transforms through 3 states:
  1. Normal → Shrinks to circle
  2. Shows loading spinner
  3. Displays success checkmark
  4. Navigates to goal page

#### Task Completion
- Checkbox animates with rotation and scale
- Text gets strike-through with smooth wipe animation
- Task container highlights with green glow
- Confetti celebration triggers

#### Progress Bar
- Smooth fill animation from 0 to current percentage
- Shimmer effect overlay
- Real-time updates on task completion

#### Modal Transitions
- Smooth backdrop blur fade-in
- Spring animation for modal entrance
- Success state with animated checkmark drawing

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **UI Components**: Radix UI
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Theme**: next-themes
- **Icons**: Lucide React
- **Effects**: react-confetti

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Theme Configuration

The theme uses CSS variables for easy customization. Edit `src/app/globals.css`:

```css
:root {
  --primary: 239 84% 67%;  /* Indigo for light mode */
  --accent: 271 91% 65%;   /* Violet for light mode */
}

.dark {
  --primary: 189 94% 43%;  /* Cyan for dark mode */
  --accent: 189 94% 43%;   /* Blue for dark mode */
}
```

## 🎯 Key Components

### UI Components (`src/components/ui/`)
- `button.tsx` - Animated buttons with variants
- `card.tsx` - 3D tilt card with hover effects
- `checkbox.tsx` - Animated checkbox with spring effect
- `input.tsx` - Styled input fields
- `label.tsx` - Form labels

### Feature Components
- `ThemeToggle.tsx` - Animated theme switcher
- `ThemeProvider.tsx` - Theme context provider
- `ProgressModal.tsx` - Daily progress submission modal
- `ConfettiEffect.tsx` - Celebration confetti component

### Stores (`src/store/`)
- `authStore.ts` - Authentication state management
- `goalStore.ts` - Goal data management

### API Client (`src/lib/`)
- `api.ts` - Axios instance with interceptors
- `utils.ts` - Utility functions (cn for className merging)

## 🎨 Design System

### Colors

**Light Mode**:
- Background: White with gray tint
- Cards: Glass panels with white blur
- Accent: Indigo/Violet gradient

**Dark Mode**:
- Background: Charcoal/Deep Navy
- Cards: Translucent with neon borders
- Accent: Cyan/Electric Blue gradient

### Animations

All animations follow these principles:
- **Duration**: 0.3-0.6s for UI interactions
- **Easing**: Spring for organic feel, ease-out for exits
- **Stagger**: 0.1s delay between sequential items
- **Hover**: Subtle lift (y: -5px) with shadow increase

### Spacing
- Container: 2rem padding
- Cards: 1.5rem (24px) padding
- Sections: 2rem (32px) margin-bottom
- Rounded corners: 2xl (1rem)

## 🚀 Workflow

### User Journey

1. **Landing** → User sees hero with CTA
2. **Register/Login** → Glassmorphism auth forms
3. **Dashboard** → Staggered card animations show goals
4. **Create Goal** → AI generates plan with button animation
5. **Goal Detail** → Track progress with rewarding interactions
6. **Daily Progress** → Add comments via modal
7. **Task Completion** → Confetti + strike-through animation

### Form Submissions

All forms include:
- Input validation
- Loading states with spinners
- Error handling with animations
- Success feedback with transitions

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly tap targets (min 44px)
- Optimized animations for mobile performance

## 🎬 Animation Showcase

### Page Load
```tsx
// Staggered container animation
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};
```

### Button Transform
```tsx
// Generate button states
"input" → "generating" → "success" → navigate
```

### Task Completion
```tsx
// Multi-step animation
1. Checkbox scale & rotate
2. Strike-through wipe (scaleX: 0 → 1)
3. Background flash green
4. Confetti celebration
```

## 🔐 Authentication

- JWT token stored in Zustand with persistence
- Automatic token refresh on API calls
- Protected routes redirect to login
- Auth state persists across sessions

## 🌐 API Integration

All endpoints connect to the existing backend:

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /goals` - Fetch all goals
- `POST /goals` - Create new goal
- `GET /goals/:id` - Get goal details
- `POST /progress` - Add daily progress
- `GET /insights/:goalId` - Get AI insights

## 📝 Future Enhancements

- [ ] Page transitions with AnimatePresence
- [ ] Animated heatmap visualization
- [ ] PDF report generation
- [ ] Real-time notifications
- [ ] Goal sharing functionality
- [ ] Advanced analytics dashboard
- [ ] Streak tracking with gamification

## 🤝 Contributing

This is a custom build. For modifications:
1. Follow the existing animation patterns
2. Use Framer Motion for all animations
3. Maintain glassmorphism aesthetic
4. Test both light and dark modes

## 📄 License

Private project for Aivora.

---

Built with 💜 using Next.js, Framer Motion, and lots of attention to detail.
