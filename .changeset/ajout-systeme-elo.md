---
"react-ultimate-shuffler": minor
---

Ajout du système de score Elo (Ranking) basé sur les victoires

- Nouveau champ `elo_rating` dans la table des membres (valeur par défaut : 1000)
- Logique de calcul Elo inspirée du système utilisé aux échecs et dans Age of Empires
- Affichage du score Elo sur le profil des membres (badge violet dans le tableau)
- Bouton "Déclarer vainqueur" sur chaque équipe générée pour déclencher la mise à jour des classements
- Le gain/perte de points tient compte de la force relative des équipes adverses
