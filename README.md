# Ultimate Frisbee Manager 🥏

**Ultimate Frisbee Manager** est une plateforme SaaS conçue pour simplifier la gestion des clubs d'Ultimate Frisbee amateurs. L'objectif est de passer moins de temps sur Excel et plus de temps sur le terrain.

## 🚀 Fonctionnalités clés

* **Gestion des membres :** Centralisation des informations des joueurs.
* **Confirmation de présence :** Suivi en temps réel de qui participe à la prochaine séance.
* **Générateur d'équipes intelligent :** Création automatique d'équipes équilibrées basées sur :
  * Le niveau de compétence (vitesse et lancers).
  * Le respect de la parité homme/femme.
  * **Nouveau !** Trois modes d'équilibrage :
    * **Strict (5%)** : Équipes très égales pour des matchs compétitifs.
    * **Flexible (15%)** : Plus de variété dans les duels avec léger déséquilibre.
    * **Aléatoire** : Rotation complètement aléatoire sans calcul de force.
  * Bouton "Regénérer" pour créer de nouvelles combinaisons d'équipes.


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

## 🔐 Authentification sur les environnements de preview Vercel

Lors du déploiement sur Vercel, les URL de preview (ex: `https://ultimate-frisbee-manager-abc123.vercel.app`) ont une adresse différente de la production. Pour que l'authentification OAuth fonctionne correctement sur ces environnements, vous devez configurer Supabase pour accepter les redirections depuis ces URL.

### Étapes de configuration

1. **Ouvrir le tableau de bord Supabase** → **Authentication** → **URL Configuration**

2. **Ajouter les URL de redirect autorisées** dans la section **Redirect URLs** :
   ```
   https://*.vercel.app/auth/callback
   ```
   > ⚠️ Les wildcards (`*`) sont supportés par Supabase. Cela autorise toutes vos preview branches à rediriger correctement vers votre callback d'authentification.

3. **Vérifier le Site URL** : Assurez-vous que votre **Site URL** est configuré sur votre URL de production (ex: `https://votre-domaine.vercel.app`).

4. **Côté OAuth Provider** (GitHub, Google, Azure) : Ajoutez l'URL de callback Supabase dans les paramètres de votre application OAuth. L'URL est disponible dans votre tableau de bord Supabase sous **Authentication** → **Providers**.

### Comment ça fonctionne

L'application utilise `window.location.origin` pour construire dynamiquement l'URL de redirection OAuth. Ainsi, que vous soyez en production ou sur un environnement de preview, le callback sera toujours redirigé vers la bonne URL :

```
https://<votre-preview>.vercel.app/auth/callback?next=/dashboard
```

La route `/auth/callback` échange le code d'autorisation contre une session Supabase, puis redirige l'utilisateur vers le dashboard.

## 🤝 Contribuer

Les contributions sont les bienvenues ! Que vous soyez un expert en TypeScript ou que vous débutiez, vous pouvez aider :

* Signaler des bugs via les **Issues**.
* Proposer des améliorations de l'interface.
* Améliorer la documentation.