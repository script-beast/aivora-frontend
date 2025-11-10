# 🎯 Aivora Frontend

A beautiful, modern Next.js 14 application for AI-powered goal planning and progress tracking.

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **PDF Export**: jsPDF

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js 14 App Router pages
│   │   ├── page.tsx           # Landing page
│   │   ├── login/             # Login page
│   │   ├── register/          # Registration page
│   │   ├── dashboard/         # User dashboard
│   │   ├── create-goal/       # Goal creation wizard
│   │   ├── goal/[id]/         # Goal detail & roadmap
│   │   └── insights/[id]/     # Analytics & AI insights
│   ├── components/            # Reusable components
│   │   ├── AuthProvider.tsx   # Auth initialization
│   │   └── ProgressModal.tsx  # Progress tracking modal
│   ├── lib/                   # Utilities
│   │   ├── api.ts            # API client with interceptors
│   │   ├── pdfExport.ts      # PDF generation
│   │   └── utils.ts          # Helper functions
│   ├── store/                 # Zustand state management
│   │   ├── authStore.ts      # Authentication state
│   │   ├── goalStore.ts      # Goals & progress state
│   │   └── uiStore.ts        # UI state
│   └── types/                 # TypeScript definitions
└── public/                    # Static assets
```

## 🎨 Features

### ✨ User Interface

- **Glassmorphism Design** - Modern frosted glass aesthetic
- **Smooth Animations** - Framer Motion powered transitions
- **Responsive Layout** - Mobile-first design
- **Custom Scrollbars** - Gradient purple scrollbars
- **Dark Text Inputs** - Fully visible input fields

### 🔐 Authentication

- **Secure Login/Register** - JWT token-based auth
- **Persistent Sessions** - LocalStorage with auto-refresh
- **Protected Routes** - Automatic redirect to login
- **Token Management** - Auto-sync across app refresh

### 📊 Goal Management

- **AI-Powered Planning** - 30-day structured roadmaps
- **Progress Tracking** - Daily task completion
- **Sentiment Analysis** - AI analyzes your mood
- **Visual Analytics** - Charts and stats
- **PDF Export** - Professional progress reports

### 🤖 AI Features

- **Goal Planner** - Generates personalized roadmaps
- **Insight Analyzer** - Weekly progress insights
- **Plan Regeneration** - Adaptive roadmap updates
- **Sentiment Detection** - Mood trend analysis

## ⚙️ Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running (see backend README)

### Setup

1. **Install dependencies**:

```bash
npm install
```

2. **Configure environment**:
   Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

3. **Run development server**:

```bash
npm run dev
```

4. **Build for production**:

```bash
npm run build
npm start
```

## 🔧 Configuration

### Environment Variables

| Variable              | Description     | Default                     |
| --------------------- | --------------- | --------------------------- |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5000/api` |

### API Client

The API client (`src/lib/api.ts`) includes:

- **Automatic token injection** from localStorage
- **401 error handling** with redirect
- **Request/response interceptors**
- **Type-safe API methods**

## 📚 Key Components

### AuthProvider

Initializes authentication state on app load:

```tsx
// Wraps entire app in layout.tsx
<AuthProvider>{children}</AuthProvider>
```

### ProgressModal

Reusable modal for tracking daily progress:

- Task completion toggle
- Hours spent tracking
- Notes with sentiment analysis
- Quick-select hour buttons

### State Management

**Auth Store** (`authStore.ts`):

```typescript
- user: User | null
- isAuthenticated: boolean
- login(email, password)
- register(name, email, password)
- logout()
- checkAuth()
```

**Goal Store** (`goalStore.ts`):

```typescript
- goals: Goal[]
- progress: Progress[]
- insights: Insight[]
- createGoal(data)
- updateProgress(data)
- regeneratePlan(goalId, feedback)
- generateInsights(goalId)
```

## 🎯 Usage Examples

### Creating a Goal

```typescript
await createGoal({
  title: "Learn React",
  description: "Master React fundamentals",
  duration: 30,
  hoursPerDay: 2,
});
// AI generates 30-day roadmap automatically
```

### Tracking Progress

```typescript
await updateProgress({
  goalId: "goal_id",
  day: 1,
  completed: true,
  hoursSpent: 2.5,
  comment: "Great start! Completed setup.",
});
// AI analyzes sentiment automatically
```

### Generating Insights

```typescript
await generateInsights(goalId);
// Returns: summary, mood trend, motivation level, blockers, recommendations
```

## 🎨 Styling

### Custom Scrollbars

```css
/* Gradient purple scrollbar */
::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
}
```

### Glass Effect

```css
.glass {
  @apply bg-white/70 backdrop-blur-md border border-white/20;
}
```

### Modal Scrollbar

```css
/* Thinner, subtle scrollbar for modals */
.modal-scroll::-webkit-scrollbar {
  width: 6px;
  background: rgba(139, 92, 246, 0.4);
}
```

## 🔒 Security

- **JWT tokens** stored in localStorage with key `auth_token`
- **Automatic token refresh** on app initialization
- **Protected routes** redirect to login if unauthenticated
- **Token expiration** handled with 401 interceptor
- **HTTPS recommended** for production

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm run build
vercel --prod
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables in Production

Ensure `NEXT_PUBLIC_API_URL` points to your production backend.

## 📊 Performance

- **Code Splitting** - Automatic with Next.js
- **Image Optimization** - Next.js Image component
- **Lazy Loading** - Dynamic imports for charts
- **Bundle Size** - ~200KB gzipped

## 🐛 Troubleshooting

### Issue: Logged out on refresh

**Solution**: Check that `AuthProvider` is wrapping your app in `layout.tsx`

### Issue: API requests failing

**Solution**: Verify `NEXT_PUBLIC_API_URL` is set correctly

### Issue: Input text not visible

**Solution**: All inputs now have `text-gray-900` class

### Issue: Charts not rendering

**Solution**: Ensure `recharts` is installed: `npm install recharts`

## 🤝 Contributing

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Follow Tailwind CSS conventions
4. Add proper error handling
5. Test on multiple screen sizes

## 📝 License

MIT License - See LICENSE file for details

## 🔗 Related

- [Backend README](../backend/README.md)
- [API Documentation](../API_DOCUMENTATION.md)
- [Project Overview](../README.md)

---

Built with ❤️ using Next.js 14 and AI
