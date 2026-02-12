"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { MembersTable } from "@/components/dashboard/members-table";
import { supabase } from "@/lib/supabase";
import { Users } from "lucide-react";
import { getSportById, type RankingParams } from "@/lib/sports";

interface Club {
  id: string;
  name: string;
  use_elo_ranking: boolean;
  sport?: string;
  ranking_params?: RankingParams;
}

export default function MembersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [club, setClub] = useState<Club | null>(null);

  // On récupère le club pour avoir son ID
  useEffect(() => {
    const checkUserAndClub = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: clubData } = await supabase
        .from('clubs')
        .select('*')
        .eq('owner_id', session.user.id)
        .single();

      if (clubData) {
        setClub(clubData as Club);
        setLoading(false);
      } else {
        router.push("/dashboard"); // Si pas de club, retour au dash pour le créer
      }
    };
    checkUserAndClub();
  }, [router]);

  if (loading) return <div className="flex h-screen items-center justify-center">Chargement...</div>;
  if (!club) return null;

  const sportConfig = getSportById(club.sport || 'ultimate_frisbee');
  const rankingParams = club.ranking_params || sportConfig?.defaultRankingParams;

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-700 rounded-lg">
                <Users className="h-6 w-6" />
            </div>
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Gestion des Membres</h2>
                <p className="text-muted-foreground flex items-center gap-2">
                  Club : {club.name}
                  {sportConfig && <span>{sportConfig.icon}</span>}
                </p>
            </div>
        </div>
        
        {/* Le tableau des membres vit maintenant ici ! */}
        <MembersTable 
          clubId={club.id} 
          useEloRanking={club.use_elo_ranking}
          rankingParams={rankingParams}
        />
      </main>
    </div>
  );
}