"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { CreateClubForm } from "@/components/dashboard/create-club-form";
import { supabase } from "@/lib/supabase";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardSessions } from "@/components/dashboard/dashboard-sessions";
import { getSportById, type RankingParams } from "@/lib/sports";

interface Club {
  id: string;
  name: string;
  created_at: string;
  use_elo_ranking: boolean;
  sport?: string;
  ranking_params?: RankingParams;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [club, setClub] = useState<Club | null>(null);

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
      setClub(clubs as Club);
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

  const sportConfig = getSportById(club.sport || 'ultimate_frisbee');
  const rankingParams = club.ranking_params || sportConfig?.defaultRankingParams;

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight">{club.name}</h2>
            {sportConfig && (
              <span className="text-2xl" title={sportConfig.name}>{sportConfig.icon}</span>
            )}
          </div>
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
                 {sportConfig && (
                   <p className="flex items-center gap-2">
                     <span>{sportConfig.icon}</span>
                     <span>{sportConfig.name}</span>
                   </p>
                 )}
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
                  : `Les stats manuelles (${rankingParams?.skill1?.name || 'compétence 1'}, ${rankingParams?.skill2?.name || 'compétence 2'}) sont utilisées pour équilibrer les équipes.`}
              </p>
            </div>

            {/* Affichage des paramètres de classement */}
            {rankingParams && (
              <div className="border-t pt-4">
                <h3 className="font-semibold leading-none tracking-tight mb-3">
                  Attributs de classement
                </h3>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded border border-yellow-100">
                    {rankingParams.skill1?.name || 'Compétence 1'}
                  </span>
                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">
                    {rankingParams.skill2?.name || 'Compétence 2'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
