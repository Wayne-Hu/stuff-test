const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

const ARTICLES_FILE = path.join(__dirname, 'data', 'articles.json');
const READ_LATER_FILE = path.join(__dirname, 'data', 'read-later.json');

app.use(cors());
app.use(express.json());

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// GET /articles
app.get('/articles', (req, res) => {
  const articles = readJson(ARTICLES_FILE);
  res.json(articles);
});

// GET /read-later
app.get('/read-later', (req, res) => {
  const readLater = readJson(READ_LATER_FILE);
  res.json(readLater);
});

// POST /read-later
app.post('/read-later', (req, res) => {
  const { articleId } = req.body;
  const readLater = readJson(READ_LATER_FILE);

  const exists = readLater.some((item) => item.articleId === articleId);
  if (exists) {
    return res.status(409).json({ error: 'Article already in read later list' });
  }

  const newItem = { articleId, addedAt: new Date().toISOString() };
  readLater.push(newItem);
  writeJson(READ_LATER_FILE, readLater);

  res.status(201).json(newItem);
});

// DELETE /read-later/:articleId
app.delete('/read-later/:articleId', (req, res) => {
  const { articleId } = req.params;
  const readLater = readJson(READ_LATER_FILE);

  const index = readLater.findIndex((item) => item.articleId === articleId);
  if (index === -1) {
    return res.status(404).json({ error: 'Article not found in read later list' });
  }

  readLater.splice(index, 1);
  writeJson(READ_LATER_FILE, readLater);

  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Mock server running at http://localhost:${PORT}`);
});
