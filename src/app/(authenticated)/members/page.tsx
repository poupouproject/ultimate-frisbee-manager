"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { MembersTable } from "@/components/dashboard/members-table";
import { supabase } from "@/lib/supabase";
import { Users } from "lucide-react";

export default function MembersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [club, setClub] = useState<any>(null);

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
        setClub(clubData);
        setLoading(false);
      } else {
        router.push("/dashboard"); // Si pas de club, retour au dash pour le créer
      }
    };
    checkUserAndClub();
  }, [router]);

  if (loading) return <div className="flex h-screen items-center justify-center">Chargement...</div>;

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
                <p className="text-muted-foreground">Club : {club.name}</p>
            </div>
        </div>
        
        {/* Le tableau des membres vit maintenant ici ! */}
        <MembersTable clubId={club.id} useEloRanking={club.use_elo_ranking} />
      </main>
    </div>
  );
}