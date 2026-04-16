const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'wine_secret_key_123';
const usersPath = path.join(__dirname, 'data', 'users.json');
const quizPath = path.join(__dirname, 'data', 'quiz.json');

// Helper to read JSON
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
// Helper to write JSON
const writeJson = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

// Calculate level based on points
const getLevel = (points) => Math.floor(points / 20) + 1;

app.post('/api/register', async (req, res) => {
  const { nome, cognome, email, password } = req.body;
  if (!nome || !cognome || !email || !password) {
    return res.status(400).json({ error: 'Campi mancanti' });
  }

  const users = readJson(usersPath);
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email già registrata' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: Date.now().toString(),
    nome,
    cognome,
    email,
    password: hashedPassword,
    points: 0,
    level: 1
  };
  
  users.push(newUser);
  writeJson(usersPath, users);
  
  // Fake email log
  console.log(`\n--- SISTEMA EMAIL (SIMULATO) ---`);
  console.log(`A: ${email}`);
  console.log(`Oggetto: Benvenuto nella Cantina!`);
  console.log(`Corpo: Ciao ${nome} ${cognome}, registrazione avvenuta con successo. Preparati per il Wine Quiz!`);
  console.log(`--------------------------------\n`);

  res.status(201).json({ message: 'Utente registrato, controlla i log per la mail inviata.' });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const users = readJson(usersPath);
  const user = users.find(u => u.email === email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Credenziali non valide' });
  }

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: user.id, nome: user.nome, points: user.points, level: user.level } });
});

// Middleware for JWT verification
const authRequired = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Non autorizzato' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token non valido' });
  }
};

app.get('/api/quiz', authRequired, (req, res) => {
  const quizzes = readJson(quizPath);
  // Send quizzes without answers
  const safeQuizzes = quizzes.map(q => ({ id: q.id, question: q.question, options: q.options, points: q.points }));
  res.json(safeQuizzes);
});

app.post('/api/quiz/answer', authRequired, (req, res) => {
  const { quizId, answerIndex } = req.body;
  const quizzes = readJson(quizPath);
  const users = readJson(usersPath);
  
  const quiz = quizzes.find(q => q.id === quizId);
  const userIndex = users.findIndex(u => u.id === req.userId);
  
  if (!quiz || userIndex === -1) return res.status(404).json({ error: 'Not found' });
  
  let correct = quiz.answer === answerIndex;
  
  if (correct) {
    users[userIndex].points += quiz.points;
    users[userIndex].level = getLevel(users[userIndex].points);
    writeJson(usersPath, users);
  }
  
  res.json({ 
    correct, 
    correctAnswer: quiz.answer,
    newPoints: users[userIndex].points,
    newLevel: users[userIndex].level
  });
});

app.get('/api/user/me', authRequired, (req, res) => {
  const users = readJson(usersPath);
  const user = users.find(u => u.id === req.userId);
  if(!user) return res.status(404).json({error: 'Not found'});
  res.json({ id: user.id, nome: user.nome, email: user.email, points: user.points, level: user.level });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server in ascolto su porta ${PORT}`);
});

