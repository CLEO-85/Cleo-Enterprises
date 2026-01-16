const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from this folder so you can open the site via http://localhost:3000/INDEX.html
app.use(express.static(path.join(__dirname)));

// Simple in-memory users store (demo only)
const users = [];
const messages = [];

function findUserByEmail(email){
  return users.find(u => u.email.toLowerCase() === String(email).toLowerCase());
}

app.post('/api/signup', (req, res) => {
  const { name, email, password } = req.body || {};
  if(!email || !password || !name) return res.status(400).json({ success: false, error: 'Missing required fields' });
  if(findUserByEmail(email)) return res.status(409).json({ success: false, error: 'Email already registered' });

  const id = users.length + 1;
  const user = { id, name, email, password, createdAt: new Date() };
  users.push(user);
  console.log(`✓ User signed up: ${email}`);
  return res.json({ success: true, user: { id, name, email }, token: 'demo-token-' + id });
});

app.post('/api/signin', (req, res) => {
  const { email, password } = req.body || {};
  if(!email || !password) return res.status(400).json({ success: false, error: 'Missing email or password' });
  const user = findUserByEmail(email);
  if(!user || user.password !== password) return res.status(401).json({ success: false, error: 'Invalid email or password' });
  console.log(`✓ User signed in: ${email}`);
  return res.json({ success: true, user: { id: user.id, name: user.name, email: user.email }, token: 'demo-token-' + user.id });
});

app.post('/api/contact', (req, res) => {
  const { name, email, service, message } = req.body || {};
  if(!name || !email || !message) return res.status(400).json({ success: false, error: 'Missing required fields' });
  
  const msg = {
    id: messages.length + 1,
    name,
    email,
    service: service || 'general',
    message,
    createdAt: new Date()
  };
  messages.push(msg);
  console.log(`✓ Contact message received from ${name} (${email})`);
  return res.json({ success: true, messageId: msg.id });
});

// Basic health
app.get('/api/ping', (req, res) => res.json({ success: true, time: Date.now() }));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`\n🚀 Demo server running at http://localhost:${port}\n`));
