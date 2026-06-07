# react-ultimate-shuffler

## 1.5.0

### Minor Changes

- f8c72bd: Intégration de Refine pour l'authentification et la gestion des équipes.

  Le gestionnaire utilise désormais Refine comme couche d'abstraction pour :

  - L'authentification OAuth (GitHub, Google, Azure) via le fournisseur d'authentification Refine
  - L'accès aux données des membres et des sessions via le fournisseur de données Refine connecté à Supabase

  Cela permet d'utiliser les hooks Refine (`useList`, `useCreate`, `useUpdate`, `useDelete`, `useGetIdentity`, etc.) dans les composants pour interagir avec les données et l'authentification de façon standardisée.

## 1.4.0

### Minor Changes

- cc12763: Ajout du support multi-parties et de l'échange manuel des joueurs

  - Possibilité de créer plusieurs parties par session (soirée multi-matchs)
  - Navigation facile entre les différentes parties avec indicateur de partie terminée
  - Nouvelle fonctionnalité d'échange de joueurs entre équipes avant chaque partie
  - Les équipes et les modifications sont persistées automatiquement
  - Rétro-compatibilité avec les sessions existantes à partie unique

## 1.3.0

### Minor Changes

- 321ff58: Support multi-sports et paramètres de classement personnalisés

  - Ajout de la sélection du type de sport lors de la création d'un club (Ultimate Frisbee, Football, Basketball, Volleyball, Hockey, Tennis, Badminton, etc.)
  - Les paramètres de classement des joueurs sont maintenant personnalisables selon le sport choisi
  - Possibilité de renommer les attributs de compétence (ex: "Vitesse/Lancer" pour l'Ultimate, "Technique/Endurance" pour le Football)
  - Le mode de classement (Manuel ou Elo) peut être choisi dès la création du club
  - Affichage du type de sport dans le tableau de bord et la page des membres

## 1.2.0

### Minor Changes

- 6d43d8a: Ajout d'une page de paramètres utilisateur accessibles depuis le menu de navigation. Les utilisateurs peuvent désormais gérer leurs préférences et paramètres personnels.

### Patch Changes

- fc46177: Restructuration de l'authentification et du routing avec layout group (`(authenticated)`). Les routes protégées sont maintenant organisées dans un groupe de layout dédié, améliorant la sécurité et la maintenabilité du code. Ajout du callback OAuth avec page côté client et amélioration du middleware de refresh de session.

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
