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
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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

// 🗳 Route pour enregistrer un vote
app.post('/vote', (req, res) => {
  const { firstname, lastname, candidate } = req.body;
  const fullName = `${firstname} ${lastname}`;

  // Vérifie si la personne est autorisée
  if (!authorizedVoters.includes(fullName)) {
    return res.json({ message: "Nom non autorisé à voter." });
  }

  // Vérifie si la personne a déjà voté
  const alreadyVoted = db.prepare("SELECT * FROM votes WHERE firstname = ? AND lastname = ?")
                          .get(firstname, lastname);

  if (alreadyVoted) {
    return res.json({ message: "Vous avez déjà voté. Merci !" });
  }

  // Enregistre le vote
  db.prepare("INSERT INTO votes (firstname, lastname, candidate) VALUES (?, ?, ?)")
    .run(firstname, lastname, candidate);

  res.json({ message: `Merci ${firstname}, votre vote pour ${candidate} a été enregistré !` });
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

app.listen(port, () => {
  console.log(`Serveur actif sur http://localhost:${port}`);
});
