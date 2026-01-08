"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, Trophy, ArrowRight, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* HEADER SIMPLE */}
      <header className="px-6 h-16 flex items-center justify-between border-b">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Trophy className="h-6 w-6 text-primary" />
          <span>Ultimate Manager</span>
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium">
          <Link href="#features" className="hover:underline">Fonctionnalités</Link>
          <Link href="#pricing" className="hover:underline">Pour les Clubs</Link>
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
                  Fini le casse-tête des équipes.
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  La solution tout-en-un pour gérer ton club d'Ultimate Frisbee. 
                  Présences, équilibrage automatique des équipes et statistiques de saison.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/login">
                  <Button className="h-12 px-8 text-lg">
                    Commencer Gratuitement <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
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
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center text-center space-y-2 p-4 border rounded-lg shadow-sm">
                <Users className="h-12 w-12 text-blue-500 mb-2" />
                <h3 className="text-xl font-bold">Gestion des Membres</h3>
                <p className="text-sm text-gray-500">
                  Centralisez vos joueurs, leurs forces (Vitesse/Lancer) et leur
                  statut.
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
            </div>
          </div>
        </section>
      </main>
      
      {/* FOOTER */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500">
          © 2025 Ultimate Manager. Fait au Québec ⚜️
        </p>
      </footer>
    </div>
  );
}