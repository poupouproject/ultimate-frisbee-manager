---
"react-ultimate-shuffler": minor
---

Ajout du système de score Elo (Ranking) basé sur les victoires

- Nouveau champ `elo_rating` dans la table des membres (valeur par défaut : 1000)
- Nouveaux champs `wins` et `losses` pour les statistiques de match
- Nouveau champ `use_elo_ranking` sur les clubs pour activer/désactiver le mode Elo
- Logique de calcul Elo inspirée du système utilisé aux échecs et dans Age of Empires
- Le classement Elo est optionnel : chaque club peut choisir entre le ranking manuel (vitesse/lancer) ou le Elo
- Option de désactiver le Elo pour une soirée spécifique lors de la génération des équipes
- Les administrateurs peuvent ajuster manuellement le score Elo dans la configuration des membres
- Affichage des statistiques victoires/défaites dans le tableau des membres et le profil
- Le ranking et les stats sont scopés par club (chaque club a ses propres classements)
- Le gain/perte de points tient compte de la force relative des équipes adverses
