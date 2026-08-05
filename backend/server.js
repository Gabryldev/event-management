require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

(async () => {
  try {
    await connectDB();
    console.log("✅ Database connected");
  } catch (err) {
    console.error("❌ Database failed to connect");
    console.error(err);
  }
})();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.CLIENT_URL,
  ...(process.env.ALLOWED_ORIGINS || "").split(",").map((url) => url.trim()),
].filter(Boolean);
console.log("Allowed Origins:", allowedOrigins);

const localDevOriginRegex = /^https?:\/\/(localhost|127\.0\.0\.1):(5173|5174)$/;
const vercelOriginRegex = /^https?:\/\/([A-Za-z0-9-]+\.)?vercel\.app$/;

const corsOptions = {
  origin(origin, callback) {
    const requestOrigin = origin?.trim();

    // Allow requests with no origin (e.g. Postman, server-to-server)
    if (!requestOrigin) {
      return callback(null, true);
    }

    if (
      allowedOrigins.includes(requestOrigin) ||
      localDevOriginRegex.test(requestOrigin) ||
      vercelOriginRegex.test(requestOrigin)
    ) {
      return callback(null, true);
    }

    return callback(new Error(`Not allowed by CORS: ${requestOrigin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Origin", "Accept"],
};

app.use(cors(corsOptions));
app.use((req, res, next) => {
  const requestOrigin = req.headers.origin?.trim();
  if (!requestOrigin || allowedOrigins.includes(requestOrigin) || localDevOriginRegex.test(requestOrigin)) {
    res.header('Access-Control-Allow-Origin', requestOrigin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, Accept');
  }
  next();
});
app.options("*", (req, res) => res.sendStatus(200));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
// Serve uploaded flyers statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => res.json({ success: true, message: 'API is running' }));

app.use('/api/auth', authRoutes);
console.log("✅ Auth routes loaded");
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use(notFound);
app.use(errorHandler);
const PORT = process.env.PORT || 5000;

// ...
if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

