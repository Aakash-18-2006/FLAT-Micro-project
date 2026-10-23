# RegexMind – Regular Expression Pattern Validator

> **Formal Languages & Automata Theory (FLAT) Micro Project**  
> A real-world, full-stack web application designed for interactive learning, experimentation, and dynamic validation of Regular Expressions using a native JS RegExp engine.

---

## ⚡ Highlights

- **Real Regex Engine**: No mock results, no hardcoded validation, no AI generation. Every test string is evaluated dynamically using JavaScript's native `RegExp` execution engine with execution timing and match index offsets.
- **FLAT-Compliant**: Focused exclusively on Regular Expression theory (concatenation, alternation, Kleene star, quantifiers, anchors, character classes, lookarounds).
- **Interactive Pattern Breakdown**: Real-time syntax highlighting and token breakdown mapping regex syntax elements to their theoretical roles (quantifiers, anchors, classes, groups).
- **Zero-Database Architecture**: 100% stateless backend with client-side history persistence via browser `localStorage`. No database setup, maintenance, or connection latency.
- **Live Playground Mode**: Real-time evaluation as you type with match count and highlight indicators.
- **Curated Educational Library**: 14 categorized regex patterns with test cases + an 11-topic FLAT learning guide with interactive code examples.
- **Cyberpunk / Glassmorphic UI**: High-contrast dark theme with red/crimson accents, smooth transitions, mobile responsiveness, and dark/light mode toggle.

---

## 🏗️ Architecture

```
FLAT micro project/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── regexController.js     # Stateless regex testing & validation
│   │   ├── middleware/
│   │   │   └── errorHandler.js        # Global error & validation handler
│   │   ├── routes/
│   │   │   └── regexRoutes.js         # /api/regex routes (test & validate)
│   │   ├── services/
│   │   │   └── regexEngine.js         # Pure JS RegExp compiler & tester
│   │   └── app.js                     # Express app, helmet, CORS, rate limiting, health check
│   ├── tests/
│   │   └── regexEngine.test.js        # 18 Jest unit tests for regex engine
│   ├── .env.example                   # Backend environment template
│   └── package.json                   # Backend dependencies & npm start script
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx         # Navigation bar & theme toggle
│   │   │   │   └── AppLayout.jsx      # Main layout wrapper + toast notifications
│   │   │   └── regex/
│   │   │       ├── PatternBreakdown.jsx # Color-coded regex breakdown & syntax cheatsheet
│   │   │       └── ResultsPanel.jsx   # Accept/Reject cards, match highlights, metrics
│   │   ├── hooks/
│   │   │   └── useTheme.jsx           # Theme toggle (dark/light) context
│   │   ├── pages/
│   │   │   ├── TesterPage.jsx         # Main multi-string regex validator
│   │   │   ├── PlaygroundPage.jsx     # Live single-text real-time tester
│   │   │   ├── ExamplesPage.jsx       # 14 categorized pattern templates
│   │   │   ├── LearnPage.jsx          # 11-topic FLAT Regular Expressions guide
│   │   │   ├── HistoryPage.jsx        # Local test history with search & re-testing
│   │   │   └── SettingsPage.jsx       # Theme preferences & local history management
│   │   ├── services/
│   │   │   ├── api.js                 # Axios instance configured with VITE_API_URL
│   │   │   ├── historyService.js      # Browser localStorage test history manager
│   │   │   └── regexService.js        # Regex testing API & history interface
│   │   ├── utils/
│   │   │   └── regexExamples.js       # Curated example patterns & explanations
│   │   ├── App.jsx                    # Route configuration
│   │   ├── index.css                  # Custom design system & animations
│   │   └── main.jsx                   # React root
│   ├── .env.example                   # Frontend environment template
│   ├── vercel.json                    # Single-Page Application (SPA) rewrite rules
│   └── package.json                   # Frontend dependencies & build script
│
├── vercel.json                        # Root-level Vercel configuration fallback
└── package.json                       # Root dev orchestration scripts
```

---

## 🚀 Local Development

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)

### Quick Start (Both Backend & Frontend)

From the project root:
```bash
npm run dev
```
*(Runs both backend on `http://localhost:5000` and frontend on `http://localhost:5173` concurrently with color-coded logs)*

---

### Running Individual Services

#### Backend
```bash
cd backend
npm install
npm run dev      # Starts development server on http://localhost:5000
npm test         # Runs 18 Jest unit tests
npm start        # Production start (node src/app.js)
```

#### Frontend
```bash
cd frontend
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
npm run build    # Produces production bundle in dist/
```

---

## ☁️ Deployment Guide

### 1. Backend Deployment (Voroa)

Deploy the stateless Express API on **Voroa**:

1. **Create New Service** on Voroa connected to your GitHub repository:
   `https://github.com/Aakash-18-2006/FLAT-Micro-project.git`
2. **Build & Deploy Settings**:
   - **Root Directory**: `backend`
   - **Environment**: Node.js
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
3. **Environment Variables**:
   | Variable | Value | Description |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables production mode |
   | `PORT` | `5000` *(or leave default if injected by Voroa)* | Port the server listens on |
   | `CLIENT_URL` | `https://your-frontend.vercel.app` | Allowed CORS origin for your Vercel frontend |
4. **Health Check**:
   - Path: `/api/health` (HTTP 200)

---

### 2. Frontend Deployment (Vercel)

Deploy the React Single-Page Application on **Vercel**:

1. **Import Project** on Vercel from your GitHub repository:
   `https://github.com/Aakash-18-2006/FLAT-Micro-project.git`
2. **Project Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. **Environment Variables**:
   | Variable | Value | Description |
   |---|---|---|
   | `VITE_API_URL` | `https://your-backend-app.voroa.app/api` | Full URL to your deployed Voroa backend API |
4. **Deploy**:
   - Click **Deploy**. Vercel will build the frontend using `vite build` and use `vercel.json` for client-side routing.
5. **Post-Deploy**:
   - Copy your Vercel deployment URL (e.g., `https://regexmind-xyz.vercel.app`) and update the `CLIENT_URL` environment variable on Voroa.

---

## 📡 API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/` | API status and root metadata | No |
| `GET` | `/api/health` | Health-check endpoint (uptime, mode, timestamp) | No |
| `POST` | `/api/regex/test` | Test regex against 1–50 strings with timing and offsets | No |
| `POST` | `/api/regex/validate` | Validate regex pattern syntax and return token breakdown | No |

---

## 🧠 Theoretical Connections (FLAT)

1. **Regular Languages & Expressions**:
   - A regular expression defines a regular language over an alphabet $\Sigma$.
   - Supported operations: Concatenation ($ab$), Alternation ($a|b$), Kleene Star ($a^*$), Positive Closure ($a^+$).
2. **Deterministic Evaluation**:
   - Compiles patterns into state-machine-backed evaluation models within JavaScript's native V8 engine.
3. **Equivalence & Boundary Testing**:
   - Allows students to test string membership $w \in L(R)$ vs $w \notin L(R)$ across edge cases (empty strings, prefixes, boundary conditions).

---

## 🛡️ Security Features

- **ReDoS Protection**: Pattern length validation (max 500 chars), test string limits (max 5,000 chars per string, max 50 strings), and regex compilation safety checks.
- **HTTP Protection**: Helmet security headers.
- **CORS Whitelisting**: Restricted to `CLIENT_URL` in production.
- **Rate Limiting**: Express rate limiter guarding against burst flooding (300 requests / 15m).

Github Link - https://github.com/Aakash-18-2006/FLAT-Micro-project.git
Deployment Link - https://flat-micro-project.vercel.app/