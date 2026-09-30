require('dotenv').config();
const express = require('express');
const cors = require('cors');
const supabase = require('./supabaseClient');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────
// Root + health
// ─────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ name: 'Auth API', version: '1.0' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', supabase: !!supabase });
});

// ─────────────────────────────────────────
// SIGN UP
// ─────────────────────────────────────────
app.post('/auth/signup', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json({ user: data.user });
});

// ─────────────────────────────────────────
// LOG IN
// ─────────────────────────────────────────
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return res.status(401).json({ error: 'Invalid login credentials' });
  }

  res.status(200).json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    user: data.user
  });
});

// ─────────────────────────────────────────
// PUBLIC — no auth needed
// ─────────────────────────────────────────
app.get('/public/info', (req, res) => {
  res.status(200).json({ message: 'Welcome stranger! This info is public.' });
});

// ─────────────────────────────────────────
// PROTECTED — checks for a token (stub for now)
// ─────────────────────────────────────────
app.get('/protected/profile', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // Real verification comes in Stage 3 — for now just say we got a token
  res.status(200).json({ message: 'Token received', token_preview: token.slice(0, 20) + '...' });
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Server running and connected to Supabase');
});