"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { CreateClubForm } from "@/components/dashboard/create-club-form";
import { supabase } from "@/lib/supabase";
import { CalendarDays, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DashboardSessions } from "@/components/dashboard/dashboard-sessions";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [club, setClub] = useState<any>(null);

  const checkUserAndClub = async () => {
    setLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login");
      return;
    }

    const { data: clubs } = await supabase
      .from("clubs")
      .select("*")
      .eq("owner_id", session.user.id)
      .single();

    if (clubs) {
      setClub(clubs);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkUserAndClub();
  }, [router]);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        Chargement...
      </div>
    );

  if (!club) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40 p-4">
        <CreateClubForm onClubCreated={checkUserAndClub} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">{club.name}</h2>
        </div>

        {/* 1. On passe l'ID du club aux stats pour avoir les VRAIS chiffres */}
        <StatsCards clubId={club.id} />

        {/* 2. Correction de la Grille : Une seule grille parente */}
        <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
          {/* Carte Sessions (Prend 2 colonnes sur 3) */}
          <div className="lg:col-span-2 rounded-xl border bg-card text-card-foreground shadow flex flex-col items-center justify-center p-12 text-center space-y-4">
            <div className="lg:col-span-2 rounded-xl border bg-card text-card-foreground shadow flex flex-col justify-center">
              {/* On passe l'ID du club pour qu'il sache quoi afficher */}
              <DashboardSessions clubId={club.id} />
            </div>
          </div>

          {/* Carte Activité (Prend 1 colonne) */}
          <div className="rounded-xl border bg-card text-card-foreground shadow p-6 h-fit">
            <h3 className="font-semibold leading-none tracking-tight mb-4">
              Activité Récente
            </h3>
            <div className="text-sm text-muted-foreground space-y-4">
              <p>
                Club créé le {new Date(club.created_at).toLocaleDateString()}.
              </p>
              <div className="border-t pt-4">
                <p className="italic">Aucune session récente.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
