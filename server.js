const express = require('express');
const cookieParser = require('cookie-parser');
const Database = require('better-sqlite3');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

const db = new Database('votes.db');

// Crée la table des votes (si elle n'existe pas déjà)
db.prepare(`
  CREATE TABLE IF NOT EXISTS votes (
    id INTEGER PRIMARY KEY,
    firstname TEXT,
    lastname TEXT,
    candidate TEXT
  )
`).run();

app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

// Liste des votants autorisés
const authorizedVoters = [
  'Beni Ndombi', 'Miryam Ingungu', 'Merveille Palankoy', 'Alex Mulumba',
  'Mike Ndokay', 'Sincère Ndukute', 'Benika Pombo', 'Bienvenue Palankoy',
  'Candide Kinsala', 'Clément Epanya', 'Fidel Ingungu', 'Grace Panangila',
  'Ismael Nondo', 'Jordy Nkongolo', 'Loyale Ndukute', 'Riel Nsendu',
  'Hervé Mubangi', 'Soraya Odio', 'Pascal Ndesanzim', 'Patient Ndesanzim',
  'Rayonnant Mutondo', 'Cristal Mutondo', 'Idris Mpongo', 'Vaillant Mulumba'
];
app.post('/vote', (req, res) => {
  const { firstname, lastname, candidate } = req.body;
  const fullName = `${firstname} ${lastname}`;

  // Vérifie si la personne est autorisée à voter
  if (!authorizedVoters.includes(fullName)) {
    return res.json({ message: "Nom non autorisé ou mal écrit." });
  }

  // Vérifie si la personne a déjà voté
  const stmt = db.prepare("SELECT 1 FROM votes WHERE firstname = ? AND lastname = ?");
  const row = stmt.get(firstname, lastname);

  if (row) {
    return res.json({ message: "Vous avez déjà voté. Merci !" });
  }

  // Insère le vote
  db.run("INSERT INTO votes (firstname, lastname, candidate) VALUES (?, ?, ?)", [firstname, lastname, candidate], (err) => {
    if (err) return res.json({ message: "Erreur lors de l'enregistrement du vote." });
    res.json({ message: `Vote pour ${candidate} enregistré.` });
  });
});

// 🔐 Page admin pour voir le résultat
app.get('/results', (req, res) => {
  const rows = db.prepare("SELECT candidate, COUNT(*) AS count FROM votes GROUP BY candidate").all();

  // Trouver le gagnant
  let winner = null;
  let maxVotes = 0;
  rows.forEach(row => {
    if (row.count > maxVotes) {
      winner = row.candidate;
      maxVotes = row.count;
    }
  });

  const totalVotes = rows.reduce((acc, row) => acc + row.count, 0);
  const results = { totalVotes, winner, details: rows };

  res.json(results);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Serveur actif sur http://localhost:${port}`);
});
