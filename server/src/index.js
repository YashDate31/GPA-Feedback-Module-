const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL.trim().replace(/\/$/, '')] : [])
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.onrender.com') ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api', require('./routes'));

app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`\n✅ MSBTE Feedback Server → http://localhost:${PORT}`);
    console.log(`   API: http://localhost:${PORT}/api\n`);
    console.log(`   Class Teacher Logins:`);
    console.log(`     Sem 1: semester_one / semester@one`);
    console.log(`     Sem 2: semester_two / semester@two`);
    console.log(`     Sem 3: semester_three / semester@three`);
    console.log(`     Sem 4: semester_four / semester@four`);
    console.log(`     Sem 5: semester_five / semester@five`);
    console.log(`     Sem 6: semester_six / semester@six\n`);
  });
});
