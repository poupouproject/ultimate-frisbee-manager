# Ultimate Frisbee Manager - Instructions Copilot

## Contexte du projet

Ce projet est un gestionnaire de club d'Ultimate Frisbee, une application Next.js avec Supabase pour la gestion des membres, des sessions et l'equilibrage automatique des equipes.

## Stack technique

- **Framework**: Next.js (App Router)
- **Base de donnees**: Supabase (PostgreSQL avec RLS)
- **Auth**: Supabase Auth (OAuth: GitHub, Google, Azure)
- **UI**: Tailwind CSS + shadcn/ui
- **Gestion des versions**: Changesets

## Structure du projet

```
src/
├── app/
│   ├── (authenticated)/    # Routes protegees par auth (layout server-side)
│   │   ├── dashboard/      # Tableau de bord principal
│   │   ├── members/        # Gestion des membres
│   │   ├── sessions/       # Calendrier et sessions
│   │   └── settings/       # Parametres utilisateur
│   ├── auth/               # Callback auth Supabase
│   ├── login/              # Page de connexion (layout redirige si deja connecte)
│   └── layout.tsx          # Layout racine
├── components/
│   ├── ui/                 # Composants shadcn/ui
│   ├── layout/             # Header
│   ├── dashboard/          # Composants du dashboard
│   └── sessions/           # Composants sessions
├── lib/                    # Utilitaires, client Supabase, algorithmes
└── middleware.ts           # Middleware de refresh de session
```

## Conventions de code

### Nommage
- **Fichiers composants**: kebab-case (`stats-cards.tsx`)
- **Composants**: PascalCase (`StatsCards`)
- **Fonctions/variables**: camelCase

### Composants
- Utiliser `"use client"` uniquement quand necessaire
- Preferer les Server Components quand possible
- Utiliser les composants shadcn/ui pour l'UI

### Base de donnees
- Respecter les politiques RLS existantes
- Creer des migrations dans `supabase/migrations/`

### Styles
- Utiliser les classes Tailwind, pas de CSS inline
- Respecter le design mobile-first

## Authentification

L'authentification utilise `@supabase/ssr` avec le pattern suivant :
- **Client navigateur**: `createBrowserClient` dans `src/lib/supabase.ts`
- **Middleware**: `src/middleware.ts` rafraichit la session sur chaque requete
- **Protection server-side**: Layout `(authenticated)/layout.tsx` valide l'utilisateur avec `getUser()`
- **Callback OAuth**: Client component avec `onAuthStateChange` dans `auth/callback/page.tsx`

## Gestion des versions et changesets

Le projet utilise **Changesets** pour la gestion des versions.

### Regle obligatoire

**Chaque changement significatif doit etre accompagne d'un changeset.** Le contenu du changeset doit etre redige comme une **note de version (release note) destinee aux utilisateurs finaux** du projet.

```bash
# Creer un changeset pour une modification
npx changeset
```

### Format des changesets

- Ecrire en **francais**
- Rediger du point de vue de l'utilisateur, pas du developpeur
- Utiliser un langage clair et accessible
- Exemples :
  - Bon : "Correction d'un probleme de connexion avec les comptes Google"
  - Mauvais : "Fix OAuth callback route handler to use page.tsx instead of route.ts"
  - Bon : "Ajout de la possibilite d'exporter les statistiques de la saison"
  - Mauvais : "Add CSV export endpoint to stats API"

### Types de changeset
- `patch` : Corrections de bugs, ameliorations mineures
- `minor` : Nouvelles fonctionnalites
- `major` : Changements majeurs qui modifient le comportement existant

## Bonnes pratiques

1. **Creer des migrations** pour tout changement de schema
2. **Ajouter des changesets** pour les modifications significatives (rediges comme des release notes)
3. **Respecter les types** - eviter `any`
4. **Gerer les erreurs** avec try/catch et feedback utilisateur
5. **Ne pas modifier** le middleware ou les layouts d'authentification sans raison valable
