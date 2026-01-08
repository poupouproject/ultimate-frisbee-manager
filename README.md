# Ultimate Frisbee Manager 🥏

**Ultimate Frisbee Manager** est une plateforme SaaS conçue pour simplifier la gestion des clubs d'Ultimate Frisbee amateurs. L'objectif est de passer moins de temps sur Excel et plus de temps sur le terrain.

## 🚀 Fonctionnalités clés

* **Gestion des membres :** Centralisation des informations des joueurs.
* **Confirmation de présence :** Suivi en temps réel de qui participe à la prochaine séance.
* **Générateur d'équipes intelligent :** Création automatique d'équipes équilibrées basées sur :
* Le niveau de compétence (vitesse et lancers).
* Le respect de la parité homme/femme.


* **Authentification simplifiée :** Connexion via Google ou GitHub (via Supabase Auth).

## 🛠️ Stack Technique

* **Framework :** [Next.js](https://nextjs.org/) (React + TypeScript)
* **Design :** [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
* **Backend & Base de données :** [Supabase](https://supabase.com/) (PostgreSQL)
* **Déploiement :** Vercel (recommandé)

## 📦 Installation locale

Si vous souhaitez contribuer ou tester le projet sur votre machine :

1. **Cloner le dépôt :**
```bash
git clone https://github.com/poupouproject/ultimate-frisbee-manager.git
cd ultimate-frisbee-manager

```


2. **Installer les dépendances :**
```bash
npm install

```


3. **Variables d'environnement :**
Créez un fichier `.env.local` à la racine et ajoutez vos clés Supabase :
```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anonyme

```


4. **Lancer le serveur de développement :**
```bash
npm run dev

```


Ouvrez [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) pour voir le résultat.

## 🤝 Contribuer

Les contributions sont les bienvenues ! Que vous soyez un expert en TypeScript ou que vous débutiez, vous pouvez aider :

* Signaler des bugs via les **Issues**.
* Proposer des améliorations de l'interface.
* Améliorer la documentation.