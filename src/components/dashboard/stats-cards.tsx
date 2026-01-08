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
  const [averageAttendance, setAverageAttendance] = useState<string>("-"); // Nouvel état pour la moyenne
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      // 1. Compter les membres (inchangé)
      const { count: membersCount } = await supabase
        .from("members")
        .select("*", { count: "exact", head: true })
        .eq("club_id", clubId);

      if (membersCount !== null) setMemberCount(membersCount);

      // 2. Trouver la PROCHAINE session (Date >= Maintenant, Triée par date croissante, Limit 1)
      const { data: sessionData } = await supabase
        .from("sessions")
        .select("*")
        .eq("club_id", clubId)
        .gte("date", new Date().toISOString())
        .order("date", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (sessionData) {
        setNextSession(sessionData);
      }

      // --- 3. CALCULER LA MOYENNE (Nouveau) ---
      try {
        // A. On récupère les 5 dernières sessions PASSÉES
        const { data: pastSessions } = await supabase
            .from("sessions")
            .select("id")
            .eq("club_id", clubId)
            .lt("date", new Date().toISOString()) // Seulement le passé
            .order("date", { ascending: false })
            .limit(5);

        if (pastSessions && pastSessions.length > 0) {
            const sessionIds = pastSessions.map(s => s.id);
            
            // B. On compte tous les "présents" pour ces sessions
            const { count: totalPresents } = await supabase
                .from("attendances")
                .select("*", { count: 'exact', head: true })
                .in("session_id", sessionIds)
                .eq("status", "present");
            
            // C. Calcul : Total Présents / Nombre de sessions
            const avg = (totalPresents || 0) / pastSessions.length;
            
            // On arrondit (ex: 12.6 -> 13) pour faire plus propre
            setAverageAttendance(Math.round(avg).toString());
        } else {
            setAverageAttendance("-"); // Pas encore d'historique
        }
      } catch (e) {
        console.error("Erreur calcul moyenne", e);
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

      {/* --- PRÉSENCE MOYENNE --- */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Présence Moyenne</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? "-" : averageAttendance}
          </div>
          <p className="text-xs text-muted-foreground">
            Calculé sur les 5 derniers matchs
          </p>
        </CardContent>
      </Card>

      {/* --- PROCHAINE SESSION --- */}
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