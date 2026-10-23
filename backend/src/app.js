const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const regexRoutes = require('./routes/regexRoutes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// ─── Security Middleware ────────────────────────────────────────────────────
app.use(helmet());

// Production CORS configuration
const configuredClientUrls = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim().replace(/\/+$/, ''))
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, uptime probes, mobile)
      if (!origin) return callback(null, true);

      // Wildcard allow or no CLIENT_URL configured
      if (!process.env.CLIENT_URL || process.env.CLIENT_URL === '*' || configuredClientUrls.includes('*')) {
        return callback(null, true);
      }

      const cleanOrigin = origin.replace(/\/+$/, '');

      // Allow configured production client URLs
      if (configuredClientUrls.includes(cleanOrigin) || configuredClientUrls.includes(origin)) {
        return callback(null, true);
      }

      // Allow all Vercel deployment preview and production domains
      if (/^https:\/\/[a-zA-Z0-9_.-]+\.vercel\.app$/.test(cleanOrigin)) {
        return callback(null, true);
      }

      // Allow localhost in development
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(cleanOrigin)) {
        return callback(null, true);
      }

      // In stateless public educational tool, permit any origin as safe fallback
      return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Rate Limiting ──────────────────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', generalLimiter);
app.use('/regex/', generalLimiter);

// ─── Body Parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// ─── Logging ────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ─── Root & Health Check Routes ─────────────────────────────────────────────
const sendHealth = (req, res) => {
  res.json({
    success: true,
    message: 'RegexMind API is running',
    version: '1.0.0',
    mode: 'stateless',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
};

app.get('/', (req, res) => {
  res.json({
    success: true,
    name: 'RegexMind API',
    description: 'FLAT Micro Project – Regular Expression Pattern Validator',
    status: 'healthy',
    healthCheck: '/api/health',
  });
});

app.get('/api/health', sendHealth);
app.get('/health', sendHealth);

// ─── API Routes (Mounted on both /api/regex and /regex for resilience) ───────
app.use('/api/regex', regexRoutes);
app.use('/regex', regexRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found.` });
});

// ─── Error Handler ──────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 RegexMind API running on port ${PORT}`);
  });
}

module.exports = app;
