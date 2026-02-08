"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { CreateClubForm } from "@/components/dashboard/create-club-form";
import { supabase } from "@/lib/supabase";
import { CalendarDays, Plus, Trophy } from "lucide-react";
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
    if (!session) return;

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

        <StatsCards clubId={club.id} />

        <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
          
          {/* --- MODIFICATION ICI --- */}
          {/* On enlève le style 'card' du parent. Il devient transparent. */}
          <div className="lg:col-span-2 h-full"> 
             <DashboardSessions clubId={club.id} />
          </div>

          {/* Carte Activité + Paramètres */}
          <div className="rounded-xl border bg-card text-card-foreground shadow p-6 h-fit space-y-6">
            <div>
              <h3 className="font-semibold leading-none tracking-tight mb-4">
                Activité Récente
              </h3>
              <div className="text-sm text-muted-foreground space-y-4">
                 <p>Club créé le {new Date(club.created_at).toLocaleDateString()}.</p>
                 <div className="border-t pt-4">
                   <p className="italic">Aucune session récente.</p>
                 </div>
              </div>
            </div>

            {/* Toggle Elo pour le club */}
            <div className="border-t pt-4">
              <h3 className="font-semibold leading-none tracking-tight mb-3">
                Paramètres
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Trophy className="h-4 w-4 text-purple-600" />
                  <span>Classement Elo</span>
                </div>
                <Button
                  variant={club.use_elo_ranking ? "default" : "outline"}
                  size="sm"
                  className={club.use_elo_ranking ? "bg-purple-600 hover:bg-purple-700" : ""}
                  onClick={async () => {
                    const newValue = !club.use_elo_ranking;
                    await supabase
                      .from("clubs")
                      .update({ use_elo_ranking: newValue })
                      .eq("id", club.id);
                    setClub({ ...club, use_elo_ranking: newValue });
                  }}
                >
                  {club.use_elo_ranking ? "Activé" : "Désactivé"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {club.use_elo_ranking
                  ? "Le score Elo est utilisé pour équilibrer les équipes et sera affiché dans les profils."
                  : "Les stats manuelles (vitesse, lancer) sont utilisées pour équilibrer les équipes."}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
