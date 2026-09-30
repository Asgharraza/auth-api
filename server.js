require('dotenv').config();
const express = require('express');
const cors = require('cors');
const supabase = require('./supabaseClient');
const requireAuth = require('./middleware/auth');
const swaggerUi = require('swagger-ui-express');
const openapi = require('./openapi.json');
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
// LOG OUT
// ─────────────────────────────────────────
app.post('/auth/logout', requireAuth, async (req, res) => {
  const { error } = await supabase.auth.signOut(req.token);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(204).send();
});

// ─────────────────────────────────────────
// PUBLIC — no auth needed
// ─────────────────────────────────────────
app.get('/public/info', (req, res) => {
  res.status(200).json({ message: 'Welcome stranger! This info is public.' });
});

// ─────────────────────────────────────────
// PROTECTED — profile
// ─────────────────────────────────────────
app.get('/protected/profile', requireAuth, (req, res) => {
  res.status(200).json({
    id: req.user.id,
    email: req.user.email,
    created_at: req.user.created_at
  });
});

// ─────────────────────────────────────────
// PROTECTED — dashboard
// ─────────────────────────────────────────
app.get('/protected/dashboard', requireAuth, (req, res) => {
  res.status(200).json({
    message: `Welcome to your dashboard, ${req.user.email}`,
    user_id: req.user.id
  });
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Server running and connected to Supabase');
});