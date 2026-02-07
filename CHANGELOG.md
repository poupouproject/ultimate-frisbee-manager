# react-ultimate-shuffler

## 1.1.0

### Minor Changes

- e446e4f: Ajout du système de score Elo (Ranking) basé sur les victoires

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

## 1.0.0

### Major Changes

- db0942c: Je suis fiers de lancer la première version bêta officielle de l'**Ultimate Frisbee Manager** ! Cette mouture pose les bases d'une gestion simplifiée pour les clubs et les capitaines, en automatisant les tâches administratives les plus lourdes.

  ### ✨ Ce qui est inclus dans cette version :

  - **Tableau de bord centralisé :** Une vue d'ensemble des activités du club.
  - **Gestion des membres :** Importation et suivi des profils des joueurs.
  - **Générateur d'équipes intelligent :** Algorithme de création d'équipes équilibrées basé sur le niveau des joueurs et le respect de la parité.
  - **Infrastructure Robuste :** Intégration complète avec **Supabase** pour une gestion des données sécurisée et performante.
  - **Interface Moderne :** Une expérience utilisateur fluide construite avec **Next.js**, **Tailwind CSS** et **shadcn/ui**.

  ### 🛠️ En cours de développement (Roadmap) :

  Bien que cette version soit fonctionnelle, nous travaillons activement sur les fonctionnalités suivantes pour les prochaines semaines :

  - **Authentification SSO :** Connexion simplifiée via Google et Microsoft.
  - **Accès pour les membres :** Permettre au membre de ce connecter et prendre les présences et générer les équipes
  - **Statistiques avancées :** Suivi des performances individuelles et d'équipe.

  ***

  ### 📝 Note aux contributeurs

  Comme il s'agit d'une version **bêta**, vos retours sont essentiels. N'hésitez pas à ouvrir une _Issue_ sur le dépôt pour signaler un bug ou suggérer une amélioration.
