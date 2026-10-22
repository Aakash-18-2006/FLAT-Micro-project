# RegexMind – Regular Expression Pattern Validator

> **Formal Languages & Automata Theory (FLAT) Micro Project**  
> A real-world, full-stack web application designed for interactive learning, experimentation, and dynamic validation of Regular Expressions using a native JS RegExp engine.

---

## ⚡ Highlights

- **Real Regex Engine**: No mock results, no hardcoded validation, no AI generation. Every test string is evaluated dynamically using JavaScript's native `RegExp` execution engine with execution timing and match index offsets.
- **FLAT-Compliant**: Focused exclusively on Regular Expression theory (concatenation, alternation, Kleene star, quantifiers, anchors, character classes, lookarounds).
- **Interactive Pattern Breakdown**: Real-time syntax highlighting and token breakdown mapping regex syntax elements to their theoretical roles (quantifiers, anchors, classes, groups).
- **History & Persistence**: Full user authentication (JWT + bcrypt) with MongoDB storage of validated patterns, flags, test cases, and match metrics.
- **Live Playground Mode**: Real-time evaluation as you type with match count and highlight indicators.
- **Curated Educational Library**: 14 categorized regex patterns with test cases + an 11-topic FLAT learning guide with interactive code examples.
- **Cyberpunk / Glassmorphic UI**: High-contrast dark theme with red/crimson accents, smooth transitions, mobile responsiveness, and dark/light mode toggle.

---

## 🏗️ Architecture

```
FLAT micro project/
├── backend/
│   ├── src/
│   │   ├── config/database.js         # Mongoose connection with retry
│   │   ├── controllers/
│   │   │   ├── authController.js      # User registration, login, profile
│   │   │   └── regexController.js     # Regex testing, validation, history CRUD
│   │   ├── middleware/
│   │   │   ├── auth.js                # JWT Bearer token authentication
│   │   │   └── errorHandler.js        # Global error & validation handler
│   │   ├── models/
│   │   │   ├── User.js                # User schema + bcrypt password hashing
│   │   │   └── RegexHistory.js        # Test history schema + performance metrics
│   │   ├── routes/
│   │   │   ├── authRoutes.js          # /api/auth routes
│   │   │   └── regexRoutes.js         # /api/regex routes
│   │   ├── services/
│   │   │   └── regexEngine.js         # Pure JS RegExp compiler & tester
│   │   └── app.js                     # Express app setup, helmet, cors, rate limiting
│   └── tests/
│       └── regexEngine.test.js        # 18 Jest unit tests for regex engine
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Navbar.jsx         # Navigation bar with user avatar & theme toggle
    │   │   │   └── AppLayout.jsx      # Main layout wrapper + toast notifications
    │   │   └── regex/
    │   │       ├── PatternBreakdown.jsx # Color-coded regex breakdown & syntax cheatsheet
    │   │       └── ResultsPanel.jsx   # Accept/Reject cards, match highlights, metrics
    │   ├── hooks/
    │   │   ├── useAuth.jsx            # Authentication context & state
    │   │   └── useTheme.jsx           # Theme toggle (dark/light) context
    │   ├── pages/
    │   │   ├── TesterPage.jsx         # Main multi-string regex validator
    │   │   ├── PlaygroundPage.jsx     # Live single-text real-time tester
    │   │   ├── ExamplesPage.jsx       # 14 categorized pattern templates
    │   │   ├── LearnPage.jsx          # 11-topic FLAT Regular Expressions guide
    │   │   ├── HistoryPage.jsx        # User test history with search & re-testing
    │   │   ├── LoginPage.jsx          # User login
    │   │   ├── RegisterPage.jsx       # User registration with password strength meter
    │   │   └── SettingsPage.jsx       # Account info & history management
    │   ├── services/
    │   │   ├── api.js                 # Axios instance with JWT interceptor
    │   │   ├── authService.js         # Auth API calls
    │   │   └── regexService.js        # Regex testing & history API calls
    │   ├── utils/
    │   │   └── regexExamples.js       # Curated example patterns & explanations
    │   ├── App.jsx                    # Route configuration
    │   ├── index.css                  # Custom design system & animations
    │   └── main.jsx                   # React root
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** (running locally on port `27017` or MongoDB Atlas URI)

### 1. Backend Setup

```bash
cd backend
npm install
```

Configure `.env` (already created with default local settings):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/regexmind
JWT_SECRET=regexmind_super_secret_jwt_key_2024_change_me
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Start the backend:
```bash
# Development (with nodemon)
npm run dev

# Run unit tests (18 tests)
npm test
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Configure `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend development server:
```bash
npm run dev
```

Visit **http://localhost:5173** in your browser.

---

## 📡 API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Log in and receive JWT token | No |
| `GET` | `/api/auth/me` | Fetch currently authenticated user | Yes |
| `POST` | `/api/regex/test` | Test regex against 1–50 strings | Optional (saves if authed) |
| `POST` | `/api/regex/validate` | Check pattern syntax validity & breakdown | No |
| `GET` | `/api/regex/history` | Get paginated user test history | Yes |
| `GET` | `/api/regex/history/:id` | Get specific history entry | Yes |
| `DELETE` | `/api/regex/history/:id` | Delete history entry | Yes |
| `DELETE` | `/api/regex/history` | Clear all user test history | Yes |
| `GET` | `/api/health` | Health check | No |

---

## 🧠 Theoretical Connections (FLAT)

1. **Regular Languages & Expressions**:
   - A regular expression defines a regular language over an alphabet $\Sigma$.
   - Supported operations: Concatenation ($ab$), Alternation ($a|b$), Kleene Star ($a^*$), Positive Closure ($a^+$).
2. **Deterministic Evaluation**:
   - Compiles patterns into state-machine-backed evaluation models within JavaScript's V8 engine.
3. **Equivalence & Boundary Testing**:
   - Allows students to test string membership $w \in L(R)$ vs $w \notin L(R)$ across edge cases (empty strings, prefixes, boundary conditions).

---

## 🛡️ Security Features

- **ReDoS Protection**: Pattern length validation, safe regex compilation checks, and input size constraints.
- **Password Security**: Passwords hashed using bcrypt with salt factor of 12.
- **API Security**: Helmet HTTP headers, CORS whitelisting, Express Rate Limiter (20 auth attempts / 15m; 200 general requests / 15m).
