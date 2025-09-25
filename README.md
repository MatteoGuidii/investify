# Investify 🚀

**🏆 Devpost Submission**: [https://devpost.com/software/rbc-launch](https://devpost.com/software/rbc-launch)

> Experience the next generation of goal-based investing with AI-powered insights and seamless portfolio management.

Investify is a modern fintech application that revolutionizes personal investing by combining goal-based financial planning with AI-powered insights. Built with cutting-edge web technologies, it provides an intuitive platform for users to set financial goals, receive personalized investment strategies, and track their progress through engaging visualizations.

## 📋 Table of Contents

- [Features](#-features)
  - [Goal-Based Investing](#-goal-based-investing)
  - [AI-Powered Financial Coach](#-ai-powered-financial-coach)
  - [Portfolio Management](#-portfolio-management)
  - [Gamification & Rewards](#-gamification--rewards)
  - [Annual Wrap Experience](#-annual-wrap-experience)
- [Tech Stack](#️-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Design System](#-design-system)
- [Key Components](#-key-components)
- [Acknowledgments](#-acknowledgments)

## ✨ Features

### 🎯 Goal-Based Investing

- **Smart Goal Catalogue**: Choose from curated financial goals across categories like travel, tech, education, and experiences
- **Personalized Strategies**: AI-powered recommendation engine suggests optimal investment strategies based on your timeline and risk tolerance
- **Visual Goal Tracking**: Interactive dashboards with progress visualization and milestone tracking

### 🤖 AI-Powered Financial Coach

- **Intelligent Insights**: AI coach analyzes spending patterns and provides personalized saving suggestions
- **Real-time Analytics**: Smart analysis of your financial data to identify optimization opportunities
- **Contextual Recommendations**: Get actionable advice tailored to your specific financial situation

### 📊 Portfolio Management

- **Risk Profile Matching**: Multiple investment strategies from conservative to aggressive growth
- **Real-time Simulations**: Advanced Monte Carlo simulations for portfolio projections
- **Automated Rebalancing**: Smart portfolio management with automated investment strategies

### 🎁 Gamification & Rewards

- **Achievement System**: Unlock badges and rewards for reaching financial milestones
- **Social Features**: Leaderboards and community challenges to motivate saving habits
- **Partner Discounts**: Exclusive offers from retail partners when you reach your goals

### 📱 Annual Wrap Experience

- **Epic Year Summary**: Beautiful annual recap showing your financial growth journey
- **Interactive Visualizations**: Engaging charts and animations celebrating your achievements
- **Shareable Content**: Social media-ready summaries of your financial wins

## 🛠️ Tech Stack

### Frontend

- **Next.js** - React framework with App Router
- **React** - Latest React with enhanced performance
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework with custom design system

### UI Components

- **Radix UI** - Accessible, unstyled UI primitives
- **Framer Motion** - Smooth animations and transitions
- **Recharts** - Interactive data visualizations
- **Lucide React** - Beautiful SVG icon library

### State Management

- **Zustand** - Lightweight state management
- **Local Storage** - Persistent user preferences

### Development Tools

- **ESLint 9** - Code linting with Next.js configuration
- **PostCSS** - CSS post-processing
- **Turbopack** - Fast build system (dev mode)

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or later
- npm, yarn, or pnpm package manager

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/MatteoGuidii/investify.git
cd investify
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Start the development server**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
investify/
├── public/                    # Static assets
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── rbc_sweater.jpg       # Custom goal image
│   ├── vercel.svg
│   └── window.svg
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/              # API routes
│   │   │   ├── insight/      # AI insights endpoint
│   │   │   └── wrap/         # Annual wrap data
│   │   ├── wrap/[period]/    # Dynamic wrap pages
│   │   ├── favicon.ico
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/           # React components
│   │   ├── ui/               # Reusable UI components
│   │   ├── wrap/             # Wrap feature components
│   │   ├── ai-coach-new.tsx  # AI coaching interface
│   │   ├── dashboard.tsx     # Main dashboard
│   │   ├── goal-catalogue.tsx # Goal selection
│   │   ├── goal-setup.tsx    # Goal configuration
│   │   └── rewards-new.tsx   # Rewards system
│   ├── data/
│   │   └── mockData.json     # Mock financial data
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions
│   │   ├── wrap/             # Wrap feature logic
│   │   ├── api.ts            # API service layer
│   │   ├── goals-data.ts     # Goal definitions
│   │   ├── store.ts          # Zustand state store
│   │   └── types.ts          # TypeScript definitions
│   └── types/                # Additional type definitions
├── eslint.config.mjs         # ESLint configuration
├── next.config.ts            # Next.js configuration
├── package.json              # Dependencies and scripts
├── postcss.config.mjs        # PostCSS configuration
├── tailwind.config.js        # Tailwind CSS configuration
└── tsconfig.json            # TypeScript configuration
```

## 🎨 Design System

### Color Palette

The application uses a custom "neo-dark" theme with:

- **Primary**: Green-based accent colors (#22c55e)
- **Background**: Dark theme with gradient overlays
- **Surface**: Card-based layouts with glassmorphism effects
- **Text**: High contrast white/gray hierarchy

### Typography

- **Font**: Inter variable font with system fallbacks
- **Scale**: Semantic sizing for headers, body, and UI text
- **Weight**: Strategic use of font weights for hierarchy

## 🔧 Key Components

### State Management

The app uses Zustand for global state with the following key stores:

- **User State**: Authentication and profile data
- **Goals**: User's financial goals and progress
- **Portfolio**: Investment portfolios and performance
- **UI State**: Current view and navigation state

### API Integration

- **Mock Data**: Realistic financial data for development
- **AI Insights**: Intelligent analysis of spending patterns
- **Portfolio Simulation**: Advanced financial projections
- **Wrap Generation**: Annual summary creation

### Goal Categories

- **Travel**: Vacation packages and experiences
- **Tech**: Latest devices and gadgets
- **Education**: Courses and learning opportunities
- **Experience**: Musical instruments and hobbies
- **Home**: Home improvement and real estate
- **Clothing**: Fashion and lifestyle items

## 🙏 Acknowledgments

- **RBC** - For providing the Portfolio Simulation API
- **Hack the North 2025** - For the inspiring hackathon environment

---

<div align="center">

**Built with ❤️ for Hack the North 2025**

[Live Demo](#) • [Documentation](#) • [Report Bug](#)

</div>
