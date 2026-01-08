"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CalendarDays, MapPin, CheckCircle2, XCircle, HelpCircle, Users, Sparkles, Save, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SessionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  // --- ÉTATS DONNÉES ---
  const [session, setSession] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [attendances, setAttendances] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Générateur
  const [teamCount, setTeamCount] = useState(2);
  const [teamMode, setTeamMode] = useState<"mixed" | "split">("mixed");
  const [generatedTeams, setGeneratedTeams] = useState<any[][]>([]);
  const [generatedTeamsSplit, setGeneratedTeamsSplit] = useState<{ men: any[][], women: any[][] } | null>(null);

  // 1. CHARGEMENT
  const fetchData = useCallback(async () => {
    try {
      const { data: sessionData } = await supabase.from("sessions").select("*").eq("id", sessionId).single();
      setSession(sessionData);

      // Si des équipes sont déjà sauvegardées en base, on les charge !
      if (sessionData?.generated_teams) {
         // Petite astuce : on détecte si c'est du mixte ou du split selon la structure du JSON
         if (Array.isArray(sessionData.generated_teams)) {
             setGeneratedTeams(sessionData.generated_teams);
             setTeamMode('mixed');
         } else {
             setGeneratedTeamsSplit(sessionData.generated_teams);
             setTeamMode('split');
         }
      }

      const { data: membersData } = await supabase.from("members").select("*").eq("club_id", sessionData.club_id).order("full_name");
      setMembers(membersData || []);

      const { data: attendanceData } = await supabase.from("attendances").select("member_id, status").eq("session_id", sessionId);
      const statusMap: Record<string, string> = {};
      attendanceData?.forEach((att) => { statusMap[att.member_id] = att.status; });
      setAttendances(statusMap);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateStatus = async (memberId: string, newStatus: string) => {
    setAttendances((prev) => ({ ...prev, [memberId]: newStatus }));
    await supabase.from("attendances").upsert(
      { session_id: sessionId, member_id: memberId, status: newStatus },
      { onConflict: "session_id, member_id" }
    );
  };

  // --- ALGORITHME DE GÉNÉRATION ---
  const handleGenerateTeams = () => {
    // 1. Filtrer SEULEMENT les présents
    const presentPlayers = members.filter(m => attendances[m.id] === 'present');
    if (presentPlayers.length < teamCount) {
        alert("Pas assez de joueurs présents pour faire " + teamCount + " équipes !");
        return;
    }

    // Fonction utilitaire pour calculer la force
    const getScore = (p: any) => (p.speed || 5) + (p.throwing || 5);

    // Fonction de distribution "Snake Draft"
    const distributeSnake = (pool: any[], numTeams: number) => {
        // Trier par force décroissante
        pool.sort((a, b) => getScore(b) - getScore(a));
        
        const buckets: any[][] = Array.from({ length: numTeams }, () => []);
        
        pool.forEach((player, index) => {
            // Calcul de l'index serpentin
            // Ex pour 2 équipes: 0, 1, 1, 0, 0, 1...
            const cycle = Math.floor(index / numTeams);
            const isZig = cycle % 2 === 0;
            const teamIndex = isZig ? (index % numTeams) : (numTeams - 1 - (index % numTeams));
            buckets[teamIndex].push(player);
        });
        return buckets;
    };

    if (teamMode === "mixed") {
        // MODE MIXTE : On répartit les H et les F équitablement dans les MÊMES équipes
        const men = presentPlayers.filter(p => p.gender === 'M');
        const women = presentPlayers.filter(p => p.gender !== 'M'); // F et X ensemble
        
        // On initialise les équipes vides
        const teams: any[][] = Array.from({ length: teamCount }, () => []);

        // On distribue les hommes
        const menTeams = distributeSnake(men, teamCount);
        // On distribue les femmes
        const womenTeams = distributeSnake(women, teamCount);

        // On fusionne
        for (let i = 0; i < teamCount; i++) {
            teams[i] = [...menTeams[i], ...womenTeams[i]];
        }
        setGeneratedTeams(teams);
        setGeneratedTeamsSplit(null);
    } else {
        // MODE PAR SEXE : On fait des équipes de gars VS gars, et filles VS filles
        const men = presentPlayers.filter(p => p.gender === 'M');
        const women = presentPlayers.filter(p => p.gender !== 'M');
        setGeneratedTeamsSplit({ men: distributeSnake(men, teamCount), women: distributeSnake(women, teamCount) });
        setGeneratedTeams([]);
    }
  };

  // 3. SAUVEGARDE EN BASE
  const saveTeamsToDb = async () => {
      const dataToSave = teamMode === 'mixed' ? generatedTeams : generatedTeamsSplit;
      
      const { error } = await supabase
        .from('sessions')
        .update({ generated_teams: dataToSave })
        .eq('id', sessionId);

      if (error) alert("Erreur de sauvegarde");
      else alert("Équipes publiées sur le tableau de bord !");
  };

  if (loading || !session) return <div className="flex h-screen items-center justify-center">Chargement...</div>;
  const dateObj = new Date(session.date);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
        
        {/* INFO SESSION */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
             <h2 className="text-2xl font-bold tracking-tight">{session.name}</h2>
             <div className="flex items-center gap-4 text-muted-foreground text-sm">
                <span className="flex items-center gap-1"><CalendarDays className="h-4 w-4" /> {dateObj.toLocaleDateString('fr-CA')}</span>
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {session.location || "Lieu non défini"}</span>
             </div>
          </div>
        </div>

        {/* ONGLETS : PRÉSENCES vs ÉQUIPES */}
        <Tabs defaultValue="attendance" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                <TabsTrigger value="attendance">1. Présences</TabsTrigger>
                <TabsTrigger value="teams">2. Équipes</TabsTrigger>
            </TabsList>

            {/* --- ONGLET 1 : GESTION DES PRÉSENCES --- */}
            <TabsContent value="attendance" className="mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Liste des joueurs ({Object.values(attendances).filter(s => s === 'present').length} présents)</CardTitle>
                        <CardDescription>Confirmez qui est là pour le match.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nom</TableHead>
                                    <TableHead className="text-center w-[300px]">Statut</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {members.map((member) => {
                                    const status = attendances[member.id] || "unknown";
                                    return (
                                        <TableRow key={member.id}>
                                            <TableCell className="font-medium">
                                                {member.full_name}
                                                <Badge variant="outline" className="ml-2 text-xs font-normal text-muted-foreground">{member.gender}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-center gap-2">
                                                    <Button size="sm" variant={status === 'present' ? "default" : "outline"} className={status === 'present' ? "bg-green-600 hover:bg-green-700" : ""} onClick={() => updateStatus(member.id, 'present')}>
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" variant={status === 'absent' ? "destructive" : "outline"} onClick={() => updateStatus(member.id, 'absent')}>
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* --- ONGLET 2 : GÉNÉRATEUR D'ÉQUIPES --- */}
            <TabsContent value="teams" className="mt-4 space-y-6">
                
                {/* CONTRÔLES */}
                <Card className="bg-slate-50 border-slate-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-indigo-500"/> Configuration
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row gap-6 items-end">
                        <div className="w-full sm:w-1/3 space-y-2">
                            <Label>Nombre d'équipes</Label>
                            <Input type="number" min={2} max={10} value={teamCount} onChange={(e) => setTeamCount(parseInt(e.target.value))} />
                        </div>
                        <div className="w-full sm:w-1/3 space-y-2">
                            <Label>Type de jeu</Label>
                            <div className="flex items-center gap-2 bg-white p-1 rounded-md border">
                                <Button variant={teamMode === 'mixed' ? 'default' : 'ghost'} className="flex-1" onClick={() => setTeamMode('mixed')}>Mixte</Button>
                                <Button variant={teamMode === 'split' ? 'default' : 'ghost'} className="flex-1" onClick={() => setTeamMode('split')}>Séparé</Button>
                            </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-1/3">
                             <Button className="flex-1" onClick={handleGenerateTeams} variant="outline"><Sparkles className="mr-2 h-4 w-4" /> Générer</Button>
                             {/* BOUTON SAUVEGARDER */}
                             {(generatedTeams.length > 0 || generatedTeamsSplit) && (
                                <Button className="flex-1" onClick={saveTeamsToDb}><Save className="mr-2 h-4 w-4" /> Publier</Button>
                             )}
                        </div>
                    </CardContent>
                </Card>

                {/* AFFICHAGE DES ÉQUIPES (Sans les stats de force) */}
                {teamMode === 'mixed' && generatedTeams.length > 0 && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {generatedTeams.map((team, idx) => (
                            <Card key={idx} className="border-t-4 border-t-indigo-500 shadow-sm">
                                <CardHeader className="bg-slate-50 pb-2 border-b">
                                    <div className="flex justify-between items-center">
                                        <CardTitle>Équipe {idx + 1}</CardTitle>
                                        <div className="text-xs text-muted-foreground font-medium">
                                            {team.length} joueurs
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <ul className="space-y-3">
                                        {team.map((p: any) => (
                                            <li key={p.id} className="text-sm flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-indigo-400"></div>
                                                <span className="font-medium">{p.full_name}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* RÉSULTATS : MODE PAR SEXE */}
                {teamMode === 'split' && generatedTeamsSplit && (
                     <div className="text-center p-4 bg-yellow-50 text-yellow-800 rounded-md">
                        Mode séparé généré. Cliquez sur Publier pour voir sur le dashboard.
                     </div>
                )}
            </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}