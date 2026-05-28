const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const APP_VERSION = process.env.APP_VERSION || '1.0.0';
const ENV = process.env.NODE_ENV || 'development';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage (stateless per 12-factor methodology)
let notes = [
  { id: 1, text: 'Welcome to Cloud Notes!', createdAt: new Date().toISOString() },
  { id: 2, text: 'This app runs on Kubernetes.', createdAt: new Date().toISOString() },
];
let nextId = 3;

// Health check endpoint (used by Kubernetes liveness/readiness probes)
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

// App info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Cloud Notes App',
    version: APP_VERSION,
    environment: ENV,
    hostname: require('os').hostname(),
    nodeVersion: process.version,
    uptime: Math.floor(process.uptime()),
  });
});

// Get all notes
app.get('/api/notes', (req, res) => {
  res.json(notes);
});

// Create a note
app.post('/api/notes', (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Note text is required' });
  }
  const note = { id: nextId++, text: text.trim(), createdAt: new Date().toISOString() };
  notes.push(note);
  res.status(201).json(note);
});

// Delete a note
app.delete('/api/notes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = notes.findIndex(n => n.id === id);
  if (index === -1) return res.status(404).json({ error: 'Note not found' });
  notes.splice(index, 1);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Cloud Notes App v${APP_VERSION} running on port ${PORT} [${ENV}]`);
});

module.exports = app;
