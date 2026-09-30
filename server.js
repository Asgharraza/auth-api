require('dotenv').config();
const express = require('express');
const cors = require('cors');
const supabase = require('./supabaseClient');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ name: 'Auth API', version: '1.0' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', supabase: !!supabase });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Server running and connected to Supabase');
});