const express = require('express');
const cookieParser = require('cookie-parser');
const Database = require('better-sqlite3');
const db = new Database('votes.db');
db.prepare("CREATE TABLE IF NOT EXISTS votes (id INTEGER PRIMARY KEY, candidate TEXT)").run();
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));


app.post('/vote', (req, res) => {
  const { candidate } = req.body;

  if (req.cookies.hasVoted) {
    return res.json({ message: "Vous avez déjà voté. Merci !" });
  }

  if (candidate === 'Ismael' || candidate === 'Mike') {
    db.run("INSERT INTO votes (candidate) VALUES (?)", [candidate], (err) => {
      if (err) return res.json({ message: "Erreur lors de l'enregistrement." });

      res.cookie('hasVoted', 'true', { maxAge: 86400000 }); // 1 jour
      res.json({ message: `Vote pour ${candidate} enregistré.` });
    });
  } else {
    res.json({ message: "Candidat invalide." });
  }
});

app.listen(port, () => console.log(`Serveur actif sur http://localhost:${port}`));
