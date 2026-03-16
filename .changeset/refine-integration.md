---
"react-ultimate-shuffler": minor
---

Intégration de Refine pour l'authentification et la gestion des équipes.

Le gestionnaire utilise désormais Refine comme couche d'abstraction pour :
- L'authentification OAuth (GitHub, Google, Azure) via le fournisseur d'authentification Refine
- L'accès aux données des membres et des sessions via le fournisseur de données Refine connecté à Supabase

Cela permet d'utiliser les hooks Refine (`useList`, `useCreate`, `useUpdate`, `useDelete`, `useGetIdentity`, etc.) dans les composants pour interagir avec les données et l'authentification de façon standardisée.
