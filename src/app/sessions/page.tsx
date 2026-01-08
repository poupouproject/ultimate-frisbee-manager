"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { CreateSessionDialog } from "@/components/sessions/create-session-dialog";
import { supabase } from "@/lib/supabase";
import { CalendarDays, MapPin, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SessionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [club, setClub] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);

  // Charger Club et Sessions
  const fetchData = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login");
      return;
    }

    // 1. Get Club
    const { data: clubData } = await supabase
      .from('clubs')
      .select('*')
      .eq('owner_id', session.user.id)
      .single();

    if (clubData) {
      setClub(clubData);
      
      // 2. Get Sessions (Triées par date)
      const { data: sessionsData } = await supabase
        .from('sessions')
        .select('*')
        .eq('club_id', clubData.id)
        .gte('date', new Date().toISOString()) // Seulement les futures (optionnel)
        .order('date', { ascending: true });
        
      setSessions(sessionsData || []);
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <div className="flex h-screen items-center justify-center">Chargement...</div>;

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 text-indigo-700 rounded-lg">
                    <CalendarDays className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Calendrier des Sessions</h2>
                    <p className="text-muted-foreground">Club : {club.name}</p>
                </div>
            </div>
            <CreateSessionDialog clubId={club.id} onSuccess={fetchData} />
        </div>

        {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-white border-dashed">
                <p className="text-muted-foreground mb-4">Aucune session prévue.</p>
                <CreateSessionDialog clubId={club.id} onSuccess={fetchData} />
            </div>
        ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sessions.map((session) => {
                    const dateObj = new Date(session.date);
                    return (
                        <Card key={session.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-lg font-bold">{session.name}</CardTitle>
                                <Badge variant="outline">Prévu</Badge>
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
                                <Button className="w-full mt-6" variant="secondary">
                                    Gérer / Présences <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        )}
      </main>
    </div>
  );
}