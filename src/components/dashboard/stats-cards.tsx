"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, Trophy, MapPin } from "lucide-react";

interface StatsCardsProps {
  clubId: string;
}

export function StatsCards({ clubId }: StatsCardsProps) {
  const [memberCount, setMemberCount] = useState(0);
  const [nextSession, setNextSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      // 1. Compter les membres
      const { count } = await supabase
        .from("members")
        .select("*", { count: "exact", head: true })
        .eq("club_id", clubId);

      if (count !== null) setMemberCount(count);

      // 2. Trouver la PROCHAINE session (Date >= Maintenant, Triée par date croissante, Limit 1)
      const { data: sessionData } = await supabase
        .from("sessions")
        .select("*")
        .eq("club_id", clubId)
        .gte("date", new Date().toISOString()) // Seulement le futur
        .order("date", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (sessionData) {
        setNextSession(sessionData);
      }
      
      setLoading(false);
    }

    if (clubId) fetchStats();
  }, [clubId]);

  // Petit utilitaire pour formater la date joliment (ex: "Mardi 19h30")
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.toLocaleDateString("fr-CA", { weekday: "long" });
    const time = date.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" });
    // Capitalize first letter (mardi -> Mardi)
    return `${day.charAt(0).toUpperCase() + day.slice(1)} ${time}`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
      {/* --- TOTAL MEMBRES --- */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Membres</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? "-" : memberCount}
          </div>
          <p className="text-xs text-muted-foreground">
            Joueurs inscrits au club
          </p>
        </CardContent>
      </Card>

      {/* --- PRÉSENCE MOYENNE (Placeholder intelligent) --- */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Présence Moyenne</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">-</div>
          <p className="text-xs text-muted-foreground">
            Calculé sur les dernières sessions
          </p>
        </CardContent>
      </Card>

      {/* --- PROCHAINE SESSION (Dynamique) --- */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Prochaine Session</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="text-2xl font-bold">-</div>
          ) : nextSession ? (
            <>
              <div className="text-2xl font-bold mb-1">
                {formatDate(nextSession.date)}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {nextSession.location || "Lieu non défini"}
              </p>
            </>
          ) : (
            <>
              <div className="text-lg font-bold text-muted-foreground">Aucune prévue</div>
              <p className="text-xs text-muted-foreground">
                Planifiez un match !
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}