"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { SessionDialog } from "@/components/sessions/session-dialog";
import { supabase } from "@/lib/supabase";
import { CalendarDays, MapPin, Clock, ArrowRight, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function SessionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [club, setClub] = useState<any>(null);
  
  // On sépare les sessions en deux états
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [pastSessions, setPastSessions] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login");
      return;
    }

    const { data: clubData } = await supabase
      .from('clubs')
      .select('*')
      .eq('owner_id', session.user.id)
      .single();

    if (clubData) {
      setClub(clubData);
      
      // 1. On récupère TOUTES les sessions, triées du plus récent au plus vieux
      const { data: allSessions } = await supabase
        .from('sessions')
        .select('*')
        .eq('club_id', clubData.id)
        .order('date', { ascending: false }); // Important : Descendant pour l'historique
        
      if (allSessions) {
          const now = new Date();
          
          // 2. On filtre et on trie
          
          // À VENIR : Date >= Maintenant. On inverse le tri pour avoir le plus proche en premier (Ascendant)
          const upcoming = allSessions
            .filter(s => new Date(s.date) >= now)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          
          // HISTORIQUE : Date < Maintenant. Déjà trié correctement (Le plus récent en premier)
          const past = allSessions
            .filter(s => new Date(s.date) < now);

          setUpcomingSessions(upcoming);
          setPastSessions(past);
      }
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Petit composant pour afficher une carte de session (pour éviter de copier-coller le code 2 fois)
  const SessionCard = ({ session, isPast }: { session: any, isPast?: boolean }) => {
    const dateObj = new Date(session.date);
    return (
        <Card className={`hover:shadow-md transition-shadow relative group ${isPast ? 'bg-slate-50/50 border-slate-200' : 'bg-white'}`}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div>
                    <CardTitle className={`text-lg font-bold ${isPast ? 'text-slate-600' : ''}`}>{session.name}</CardTitle>
                    <Badge variant={isPast ? "secondary" : "outline"} className="mt-1">
                        {isPast ? "Terminé" : "Prévu"}
                    </Badge>
                </div>
                
                {/* Bouton MODIFIER (Crayon) - Toujours disponible pour corriger */}
                <SessionDialog 
                    clubId={club.id} 
                    sessionToEdit={session} 
                    onSuccess={fetchData} 
                />
            </CardHeader>
            <CardContent>
                <div className="space-y-3 mt-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <CalendarDays className="mr-2 h-4 w-4" />
                        <span className="capitalize">
                            {dateObj.toLocaleDateString('fr-CA', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4" />
                        {dateObj.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-2 h-4 w-4" />
                        {session.location || "Lieu à définir"}
                    </div>
                </div>

                <Link href={`/sessions/${session.id}`} className="block w-full mt-6">
                    <Button className="w-full" variant={isPast ? "outline" : "secondary"}>
                        {isPast ? "Consulter" : "Gérer"} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Chargement...</div>;

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex flex-1 flex-col gap-8 p-4 md:gap-8 md:p-8">
        
        {/* EN-TÊTE + BOUTON CRÉER */}
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 text-indigo-700 rounded-lg">
                    <CalendarDays className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Calendrier</h2>
                    <p className="text-muted-foreground">Club : {club.name}</p>
                </div>
            </div>
            <SessionDialog clubId={club.id} onSuccess={fetchData} />
        </div>

        {/* SECTION 1 : À VENIR */}
        <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
                À venir
                {upcomingSessions.length > 0 && <Badge className="rounded-full bg-indigo-600">{upcomingSessions.length}</Badge>}
            </h3>

            {upcomingSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-white border-dashed">
                    <p className="text-muted-foreground mb-4">Aucune session prévue prochainement.</p>
                    <SessionDialog clubId={club.id} onSuccess={fetchData} />
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {upcomingSessions.map((session) => (
                        <SessionCard key={session.id} session={session} />
                    ))}
                </div>
            )}
        </div>

        {/* SECTION 2 : HISTORIQUE (Seulement si on a des passés) */}
        {pastSessions.length > 0 && (
            <div className="space-y-4 pt-4 border-t">
                <h3 className="text-xl font-semibold flex items-center gap-2 text-slate-500">
                    <History className="h-5 w-5" />
                    Historique
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 opacity-90">
                    {pastSessions.map((session) => (
                        <SessionCard key={session.id} session={session} isPast={true} />
                    ))}
                </div>
            </div>
        )}

      </main>
    </div>
  );
}