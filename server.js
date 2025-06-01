const express = require('express');
const cookieParser = require('cookie-parser');
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database('votes.db');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

// Créer la table si elle n'existe pas
db.prepare("CREATE TABLE IF NOT EXISTS votes (id INTEGER PRIMARY KEY, candidate TEXT)").run();

// Route POST /vote
app.post('/vote', (req, res) => {
  const { candidate } = req.body;

  if (req.cookies.hasVoted) {
    return res.json({ message: "Vous avez déjà voté. Merci !" });
  }

  if (candidate === 'Ismael' || candidate === 'Mike') {
    try {
      db.prepare("INSERT INTO votes (candidate) VALUES (?)").run(candidate);
      res.cookie('hasVoted', 'true', { maxAge: 86400000 }); // 1 jour
      return res.json({ message: `Vote pour ${candidate} enregistré.` });
    } catch (err) {
      return res.json({ message: "Erreur lors de l'enregistrement." });
    }
  }

  return res.json({ message: "Candidat invalide." });
});

// Route GET /
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Lancement du serveur
app.listen(port, () => {
  console.log(`Serveur actif sur http://localhost:${port}`);
});
