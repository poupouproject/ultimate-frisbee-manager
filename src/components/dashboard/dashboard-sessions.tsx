"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, ArrowRight, Plus, Users, Shirt, Calendar } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface DashboardSessionsProps {
  clubId: string;
}

export function DashboardSessions({ clubId }: DashboardSessionsProps) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      const { data } = await supabase
        .from("sessions")
        .select("*")
        .eq("club_id", clubId)
        .gte("date", new Date().toISOString())
        .order("date", { ascending: true })
        .limit(5);

      setSessions(data || []);
      setLoading(false);
    }
    if (clubId) fetchSessions();
  }, [clubId]);

  if (loading) {
    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow h-full p-12 text-center text-muted-foreground flex items-center justify-center">
            Chargement...
        </div>
    );
  }

  // --- CAS 1 : AUCUNE SESSION (Design vide) ---
  if (sessions.length === 0) {
    return (
      <div className="rounded-xl border bg-card text-card-foreground shadow h-full flex flex-col items-center justify-center p-8 md:p-12 text-center space-y-4">
        <div className="p-4 bg-slate-100 rounded-full">
          <CalendarDays className="h-10 w-10 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold">Sessions & Présences</h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Planifiez vos matchs et générez des équipes équilibrées.
        </p>
        <Link href="/sessions">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Gérer le calendrier
          </Button>
        </Link>
      </div>
    );
  }

  const nextSession = sessions[0];
  const hasTeams = nextSession.generated_teams;

  // --- CAS 2 : MODE MATCH (Plein écran) ---
  if (hasTeams) {
    const dateObj = new Date(nextSession.date);
    
    const TeamCard = ({ name, players, colorHeader }: { name: string, players: any[], colorHeader: string }) => (
      <div className="border rounded-lg overflow-hidden shadow-sm bg-white flex flex-col h-full">
         <div className={`px-3 py-2 flex justify-between items-center ${colorHeader} text-white`}>
            <span className="font-bold text-sm truncate">{name}</span>
            <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded text-white">
                {players.length}
            </span>
         </div>
         <ul className="p-2 space-y-1 flex-1">
            {players.map((p: any) => (
               <li key={p.id} className="text-xs text-slate-700 flex items-center gap-2 p-1 rounded hover:bg-slate-50">
                  <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-200 shrink-0">
                    {p.full_name.charAt(0)}
                  </div>
                  <span className="truncate font-medium">{p.full_name}</span>
               </li>
            ))}
         </ul>
      </div>
    );

    return (
      <div className="rounded-xl border bg-card text-card-foreground shadow h-full flex flex-col overflow-hidden">
         {/* En-tête Pleine Largeur */}
         <div className="p-6 border-b bg-slate-50/80 flex flex-col justify-between gap-4">
             <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                   <div className="flex items-center gap-2 mb-2">
                       <Badge variant="default" className="bg-indigo-600 hover:bg-indigo-700">Match en cours</Badge>
                       <span className="text-sm text-slate-500 font-medium capitalize">
                           {dateObj.toLocaleDateString('fr-CA', {weekday: 'long', day: 'numeric', month: 'long'})}
                       </span>
                   </div>
                   <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                       {nextSession.name}
                   </h3>
                   <div className="flex items-center gap-3 text-sm text-slate-500 mt-2">
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5"/> {nextSession.location || "Lieu à définir"}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5"/> {dateObj.toLocaleTimeString('fr-CA', {hour:'2-digit', minute:'2-digit'})}</span>
                   </div>
                </div>
                <Link href={`/sessions/${nextSession.id}`}>
                   <Button variant="outline" size="sm">
                       Gérer <ArrowRight className="ml-2 h-4 w-4"/>
                   </Button>
                </Link>
             </div>
         </div>

         {/* Contenu Équipes */}
         <div className="p-6 bg-slate-50/30 flex-1">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                {Array.isArray(nextSession.generated_teams) ? (
                    nextSession.generated_teams.map((team: any[], idx: number) => (
                        <TeamCard 
                            key={idx} 
                            name={`Équipe ${idx + 1}`} 
                            players={team} 
                            colorHeader={idx % 2 === 0 ? "bg-slate-800" : "bg-indigo-600"} 
                        />
                    ))
                ) : (
                    <>
                       {nextSession.generated_teams.men?.map((team: any[], idx: number) => 
                           <TeamCard key={`m-${idx}`} name={`Hommes ${idx + 1}`} players={team} colorHeader="bg-blue-600" />
                       )}
                       {nextSession.generated_teams.women?.map((team: any[], idx: number) => 
                           <TeamCard key={`f-${idx}`} name={`Femmes ${idx + 1}`} players={team} colorHeader="bg-pink-600" />
                       )}
                    </>
                )}
             </div>
         </div>
      </div>
    );
  }

  // --- CAS 3 : LISTE STANDARD ---
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow h-full flex flex-col overflow-hidden">
      <div className="p-6 border-b flex items-center justify-between bg-white">
        <h3 className="text-lg font-semibold flex items-center gap-2">
           <CalendarDays className="h-5 w-5 text-indigo-600" />
           Prochaines Sessions
        </h3>
        <Link href="/sessions">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                Voir tout <ArrowRight className="ml-1 h-4 w-4"/>
            </Button>
        </Link>
      </div>

      <div className="p-0 flex-1 bg-slate-50/30">
        <div className="divide-y">
            {sessions.map((session) => {
            const dateObj = new Date(session.date);
            const isToday = new Date().toDateString() === dateObj.toDateString();

            return (
                <div key={session.id} className="p-4 flex items-center justify-between hover:bg-white transition-colors">
                <div className="flex items-center gap-4">
                    <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg border ${isToday ? "bg-red-50 border-red-100 text-red-600" : "bg-white border-slate-200 text-slate-600"}`}>
                        <span className="text-[10px] font-bold uppercase leading-none mb-0.5">{dateObj.toLocaleDateString('fr-CA', { month: 'short' }).replace('.', '')}</span>
                        <span className="text-lg font-bold leading-none">{dateObj.getDate()}</span>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm text-slate-900">{session.name}</h4>
                            {isToday && <Badge variant="destructive" className="h-4 text-[9px] px-1">AUJOURD'HUI</Badge>}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {session.location || "Lieu à définir"}</span>
                            <span>•</span>
                            <span>{dateObj.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                </div>

                <Link href={`/sessions/${session.id}`}> 
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <ArrowRight className="h-4 w-4 text-slate-400" />
                    </Button>
                </Link>
                </div>
            );
            })}
        </div>
      </div>
    </div>
  );
}