"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Pour la redirection si non connecté
import { Header } from "@/components/layout/header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { MembersTable } from "@/components/dashboard/members-table";
import { CreateClubForm } from "@/components/dashboard/create-club-form"; // <--- Import
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [club, setClub] = useState<any>(null); // On stocke les infos du club ici

  // Fonction pour vérifier le club
  const checkUserAndClub = async () => {
    setLoading(true);
    
    // 1. Vérif Auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login");
      return;
    }

    // 2. Vérif Club existant
    const { data: clubs, error } = await supabase
      .from('clubs')
      .select('*')
      .eq('owner_id', session.user.id)
      .single(); // On s'attend à un seul club pour l'instant

    if (clubs) {
      setClub(clubs);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    checkUserAndClub();
  }, [router]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Chargement...</div>;
  }

  // SCÉNARIO 1 : L'utilisateur n'a pas encore de club -> Formulaire de création
  if (!club) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40 p-4">
        <CreateClubForm onClubCreated={checkUserAndClub} />
      </div>
    );
  }

  // SCÉNARIO 2 : L'utilisateur a un club -> Dashboard complet
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">{club.name}</h2>
        </div>
        
        <StatsCards />
        
        <div className="grid gap-4 md:gap-8 lg:grid-cols-1 xl:grid-cols-3">
          {/* On passe l'ID du club à la table pour qu'elle sache quoi charger/ajouter */}
          <MembersTable clubId={club.id} />
          
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2 xl:col-span-1">
             <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                <h3 className="font-semibold leading-none tracking-tight mb-4">Activité Récente</h3>
                <p className="text-sm text-muted-foreground">Club créé le {new Date(club.created_at).toLocaleDateString()}.</p>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}