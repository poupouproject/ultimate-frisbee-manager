"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Trophy,
  ArrowRight,
  ShieldCheck,
  Github,
  Database,
  Lock,
  BarChart3,
  Dumbbell,
} from "lucide-react";

const GITHUB_URL = "https://github.com/poupouproject/ultimate-frisbee-manager";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* HEADER */}
      <header className="px-6 h-16 flex items-center justify-between border-b">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Trophy className="h-6 w-6 text-primary" />
          <span>EloSports Manager</span>
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium">
          <Link href="#features" className="hover:underline">
            Fonctionnalités
          </Link>
          <Link href="#security" className="hover:underline">
            Sécurité
          </Link>
          <Link href="#open-source" className="hover:underline">
            Open Source
          </Link>
        </nav>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost">Se connecter</Button>
          </Link>
          <Link href="/login">
            <Button>Créer un club</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-slate-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Gérez votre club sportif, quel que soit le sport.
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  La plateforme open source et gratuite pour gérer vos clubs sportifs.
                  Classement Elo, équilibrage automatique des équipes, gestion des
                  présences et statistiques — pour le frisbee, le football, le
                  basketball et bien plus.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login">
                  <Button className="h-12 px-8 text-lg">
                    Commencer Gratuitement{" "}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="h-12 px-8 text-lg">
                    <Github className="mr-2 h-5 w-5" />
                    Voir sur GitHub
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section
          id="features"
          className="w-full py-12 md:py-24 lg:py-32 bg-white"
        >
          <div className="container px-4 md:px-6">
            <h2 className="text-2xl font-bold tracking-tighter text-center sm:text-3xl mb-12">
              Tout ce dont votre club a besoin
            </h2>
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center text-center space-y-2 p-4 border rounded-lg shadow-sm">
                <Dumbbell className="h-12 w-12 text-orange-500 mb-2" />
                <h3 className="text-xl font-bold">Multi-Sports</h3>
                <p className="text-sm text-gray-500">
                  Frisbee, football, basketball, volleyball… Choisissez votre
                  sport à la création du club et adaptez les paramètres.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-2 p-4 border rounded-lg shadow-sm">
                <BarChart3 className="h-12 w-12 text-indigo-500 mb-2" />
                <h3 className="text-xl font-bold">Classement Elo</h3>
                <p className="text-sm text-gray-500">
                  Évaluez le niveau de vos joueurs grâce au système de classement
                  Elo, adaptable à chaque discipline.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-2 p-4 border rounded-lg shadow-sm">
                <Users className="h-12 w-12 text-blue-500 mb-2" />
                <h3 className="text-xl font-bold">Gestion des Membres</h3>
                <p className="text-sm text-gray-500">
                  Centralisez vos joueurs, leurs compétences et leur statut au
                  sein de votre club.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-2 p-4 border rounded-lg shadow-sm">
                <LayoutDashboard className="h-12 w-12 text-green-500 mb-2" />
                <h3 className="text-xl font-bold">Équilibrage Auto</h3>
                <p className="text-sm text-gray-500">
                  Un algorithme puissant crée des équipes balancées en 1 clic
                  selon les présents.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-2 p-4 border rounded-lg shadow-sm">
                <ShieldCheck className="h-12 w-12 text-purple-500 mb-2" />
                <h3 className="text-xl font-bold">Multi-Clubs</h3>
                <p className="text-sm text-gray-500">
                  Gérez plusieurs ligues ou clubs avec un seul compte sécurisé.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-2 p-4 border rounded-lg shadow-sm">
                <Trophy className="h-12 w-12 text-yellow-500 mb-2" />
                <h3 className="text-xl font-bold">Statistiques</h3>
                <p className="text-sm text-gray-500">
                  Suivez les performances de vos joueurs et de vos équipes au fil
                  de la saison.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECURITY / SUPABASE SECTION */}
        <section
          id="security"
          className="w-full py-12 md:py-24 lg:py-32 bg-slate-50"
        >
          <div className="container px-4 md:px-6">
            <h2 className="text-2xl font-bold tracking-tighter text-center sm:text-3xl mb-4">
              Sécurité et hébergement
            </h2>
            <p className="mx-auto max-w-[700px] text-center text-gray-500 mb-12">
              Vos données sont hébergées sur une base PostgreSQL via Supabase,
              avec des politiques de sécurité Row Level Security (RLS) pour
              garantir que chaque utilisateur n&apos;accède qu&apos;à ses propres
              données.
            </p>
            <div className="grid gap-8 sm:grid-cols-3 max-w-4xl mx-auto">
              <div className="flex flex-col items-center text-center space-y-2">
                <Database className="h-10 w-10 text-emerald-600 mb-2" />
                <h3 className="font-semibold">PostgreSQL via Supabase</h3>
                <p className="text-sm text-gray-500">
                  Base de données relationnelle robuste, hébergée et managée par
                  Supabase.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <Lock className="h-10 w-10 text-emerald-600 mb-2" />
                <h3 className="font-semibold">Row Level Security (RLS)</h3>
                <p className="text-sm text-gray-500">
                  Des politiques RLS garantissent l&apos;isolation des données
                  entre les clubs et les utilisateurs.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <ShieldCheck className="h-10 w-10 text-emerald-600 mb-2" />
                <h3 className="font-semibold">Authentification OAuth</h3>
                <p className="text-sm text-gray-500">
                  Connexion sécurisée via GitHub, Google ou Microsoft grâce à
                  Supabase Auth.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* OPEN SOURCE SECTION */}
        <section
          id="open-source"
          className="w-full py-12 md:py-24 lg:py-32 bg-white"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Github className="h-12 w-12" />
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl">
                Open Source et Gratuit
              </h2>
              <p className="mx-auto max-w-[700px] text-gray-500">
                EloSports Manager est un projet open source entièrement gratuit.
                Le code est disponible sur GitHub — vous pouvez l&apos;utiliser,
                le modifier et y contribuer librement. Aucun frais caché, aucun
                abonnement.
              </p>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="h-12 px-8 text-lg">
                  <Github className="mr-2 h-5 w-5" />
                  Contribuer sur GitHub
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center justify-between px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500">
          © 2025 EloSports Manager. Projet open source — fait au Québec ⚜️
        </p>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-500 hover:underline flex items-center gap-1"
        >
          <Github className="h-3 w-3" />
          GitHub
        </a>
      </footer>
    </div>
  );
}