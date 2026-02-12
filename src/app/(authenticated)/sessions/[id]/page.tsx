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
import { 
  ArrowLeft, CalendarDays, MapPin, CheckCircle2, XCircle, HelpCircle, 
  Sparkles, ClipboardList, Shirt, Loader2, RefreshCw, Trophy,
  ChevronLeft, ChevronRight, ArrowRightLeft, Check
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { 
  generateMultipleMatches,
  BalanceMode, 
  getBalanceModeConfig,
  RankingMode,
  Match,
  MultiMatchData,
  isMultiMatchData,
  convertToMultiMatchFormat,
  swapPlayers,
  Player
} from "@/lib/team-balancer";
import { computeEloUpdates, DEFAULT_ELO_RATING } from "@/lib/elo";

export default function SessionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  // --- ÉTATS ---
  const [activeTab, setActiveTab] = useState("attendance");
  const [session, setSession] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [attendances, setAttendances] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingTeams, setSavingTeams] = useState(false);

  // Générateur - Multi-match support
  const [teamCount, setTeamCount] = useState(2);
  const [matchCount, setMatchCount] = useState(1);
  const [teamMode, setTeamMode] = useState<"mixed" | "split">("mixed");
  const [balanceMode, setBalanceMode] = useState<BalanceMode>("flexible");
  const [multiMatchData, setMultiMatchData] = useState<MultiMatchData | null>(null);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [declaringWinner, setDeclaringWinner] = useState(false);

  // Player swap mode
  const [swapMode, setSwapMode] = useState(false);
  const [selectedPlayerForSwap, setSelectedPlayerForSwap] = useState<{
    teamIndex: number;
    playerIndex: number;
    player: Player;
  } | null>(null);

  // Elo
  const [clubUseElo, setClubUseElo] = useState(false);
  const [useEloForSession, setUseEloForSession] = useState(false);

  // Get current match
  const currentMatch = multiMatchData?.matches[currentMatchIndex] ?? null;

  // 1. CHARGEMENT
  const fetchData = useCallback(async () => {
    try {
      const { data: sessionData } = await supabase.from("sessions").select("*").eq("id", sessionId).single();
      setSession(sessionData);

      // Si des équipes sont déjà sauvegardées en base, on les charge !
      if (sessionData?.generated_teams) {
        // Detect format: new multi-match format or legacy format
        if (isMultiMatchData(sessionData.generated_teams)) {
          setMultiMatchData(sessionData.generated_teams);
          setTeamMode(sessionData.generated_teams.teamMode || "mixed");
        } else if (Array.isArray(sessionData.generated_teams)) {
          // Legacy format: array of teams (mixed mode)
          const converted = convertToMultiMatchFormat(sessionData.generated_teams, "mixed");
          setMultiMatchData(converted);
          setTeamMode("mixed");
        } else if (sessionData.generated_teams.men && sessionData.generated_teams.women) {
          // Legacy format: split mode
          const converted = convertToMultiMatchFormat(sessionData.generated_teams, "split");
          setMultiMatchData(converted);
          setTeamMode("split");
        }
      }

      // Charger le club pour récupérer le setting use_elo_ranking
      const { data: clubData } = await supabase.from("clubs").select("use_elo_ranking").eq("id", sessionData.club_id).single();
      if (clubData) {
        setClubUseElo(clubData.use_elo_ranking ?? false);
        setUseEloForSession(clubData.use_elo_ranking ?? false);
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

  // 2. GÉNÉRATEUR ET SAUVEGARDE AUTOMATIQUE - MULTI-MATCH
  const handleGenerateTeams = async () => {
    const presentPlayers = members.filter(m => attendances[m.id] === "present");
    if (presentPlayers.length < teamCount) {
        alert("Pas assez de joueurs présents !");
        return;
    }

    setSavingTeams(true);

    const rankingMode: RankingMode = useEloForSession ? "elo" : "manual";

    // Generate multiple matches
    const data = generateMultipleMatches(
      presentPlayers,
      teamCount,
      matchCount,
      balanceMode,
      teamMode,
      100,
      rankingMode
    );

    // Update local state
    setMultiMatchData(data);
    setCurrentMatchIndex(0);
    setSwapMode(false);
    setSelectedPlayerForSwap(null);

    // --- SAUVEGARDE AUTOMATIQUE ---
    const { error } = await supabase
        .from("sessions")
        .update({ generated_teams: data })
        .eq("id", sessionId);

    setSavingTeams(false);

    if (error) {
        alert("Erreur lors de la sauvegarde automatique.");
    }
  };

  // 3. ÉCHANGE DE JOUEURS
  const handlePlayerClick = (teamIndex: number, playerIndex: number, player: Player) => {
    if (!swapMode || !currentMatch) return;

    if (!selectedPlayerForSwap) {
      // First player selection
      setSelectedPlayerForSwap({ teamIndex, playerIndex, player });
    } else {
      // Second player selection - perform swap
      if (selectedPlayerForSwap.teamIndex === teamIndex && selectedPlayerForSwap.playerIndex === playerIndex) {
        // Same player clicked - deselect
        setSelectedPlayerForSwap(null);
        return;
      }

      // Perform the swap
      const newMatch = swapPlayers(
        currentMatch,
        { teamIndex: selectedPlayerForSwap.teamIndex, playerIndex: selectedPlayerForSwap.playerIndex },
        { teamIndex, playerIndex }
      );

      // Update the multi-match data
      if (multiMatchData) {
        const newMatches = [...multiMatchData.matches];
        newMatches[currentMatchIndex] = newMatch;
        const newData: MultiMatchData = { ...multiMatchData, matches: newMatches };
        setMultiMatchData(newData);
        
        // Save to database
        saveMultiMatchData(newData);
      }

      setSelectedPlayerForSwap(null);
    }
  };

  const saveMultiMatchData = async (data: MultiMatchData) => {
    const { error } = await supabase
      .from("sessions")
      .update({ generated_teams: data })
      .eq("id", sessionId);

    if (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    }
  };

  // 4. DÉCLARATION DU VAINQUEUR ET MISE À JOUR ELO + STATS
  const handleDeclareWinner = async (winningTeamIndex: number) => {
    if (!currentMatch || !multiMatchData) return;

    const willUpdateElo = clubUseElo && useEloForSession;
    const matchLabel = multiMatchData.matches.length > 1 
      ? `(Partie ${currentMatchIndex + 1}) ` 
      : "";
    const confirmMsg = willUpdateElo
      ? `${matchLabel}Déclarer l'Équipe ${winningTeamIndex + 1} gagnante et mettre à jour les classements Elo ?`
      : `${matchLabel}Déclarer l'Équipe ${winningTeamIndex + 1} gagnante et mettre à jour les statistiques ?`;

    if (!confirm(confirmMsg)) {
      return;
    }

    setDeclaringWinner(true);

    try {
      const teams = currentMatch.teams;

      // Mettre à jour les wins/losses pour tous les joueurs
      const statsUpdates = [];
      for (let teamIdx = 0; teamIdx < teams.length; teamIdx++) {
        const isWinner = teamIdx === winningTeamIndex;
        for (const player of teams[teamIdx]) {
          const currentWins = player.wins ?? 0;
          const currentLosses = player.losses ?? 0;
          statsUpdates.push(
            supabase
              .from("members")
              .update({
                wins: isWinner ? currentWins + 1 : currentWins,
                losses: isWinner ? currentLosses : currentLosses + 1,
              })
              .eq("id", player.id)
          );
        }
      }

      // Mettre à jour Elo seulement si activé
      if (willUpdateElo) {
        const teamsWithElo = teams.map((team) =>
          team.map((p: Player) => ({
            id: p.id,
            elo_rating: p.elo_rating ?? DEFAULT_ELO_RATING,
          }))
        );

        const updates = computeEloUpdates(teamsWithElo, winningTeamIndex);

        for (const update of updates) {
          statsUpdates.push(
            supabase
              .from("members")
              .update({ elo_rating: update.newRating })
              .eq("id", update.memberId)
          );
        }
      }

      // Mark the match winner in the data
      const newMatches = [...multiMatchData.matches];
      newMatches[currentMatchIndex] = { ...currentMatch, winnerTeamIndex: winningTeamIndex };
      const newData: MultiMatchData = { ...multiMatchData, matches: newMatches };
      setMultiMatchData(newData);
      
      // Save to database
      await saveMultiMatchData(newData);

      // Exécuter toutes les mises à jour en parallèle
      await Promise.all(statsUpdates.map(q => Promise.resolve(q)));

      // Recharger les données pour refléter les changements
      await fetchData();

      alert("Statistiques mises à jour avec succès !");
    } catch (error: any) {
      alert("Erreur lors de la mise à jour : " + error.message);
    } finally {
      setDeclaringWinner(false);
    }
  };

  if (loading || !session) return <div className="flex h-screen items-center justify-center">Chargement...</div>;
  const dateObj = new Date(session.date);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40 pb-20 md:pb-0"> 
      <Header />
      
      <main className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
        
        {/* EN-TÊTE SESSION */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
             <h2 className="text-xl md:text-2xl font-bold tracking-tight">{session.name}</h2>
             <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-sm mt-1">
                <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {dateObj.toLocaleDateString('fr-CA')}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {session.location || "Lieu non défini"}</span>
             </div>
          </div>
        </div>

        {/* CONTENU PRINCIPAL */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            
            {/* Onglets Desktop */}
            <TabsList className="hidden md:grid w-full grid-cols-2 max-w-[400px]">
                <TabsTrigger value="attendance">1. Présences</TabsTrigger>
                <TabsTrigger value="teams">2. Équipes</TabsTrigger>
            </TabsList>

            {/* --- ONGLET 1 : PRÉSENCES --- */}
            <TabsContent value="attendance" className="mt-0 md:mt-4">
                <Card className="border-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card">
                    <CardHeader className="px-0 md:px-6">
                        <CardTitle>Joueurs ({Object.values(attendances).filter(s => s === 'present').length} présents)</CardTitle>
                        <CardDescription className="hidden md:block">Confirmez qui est là pour le match.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-0 md:px-6">
                        
                        {/* 1. TABLEAU DESKTOP */}
                        <div className="hidden md:block">
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
                                                        <Button size="sm" variant={status === 'maybe' ? "secondary" : "outline"} onClick={() => updateStatus(member.id, 'maybe')}>
                                                            <HelpCircle className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>

                        {/* 2. LISTE MOBILE */}
                        <div className="md:hidden space-y-3">
                            {members.map((member) => {
                                const status = attendances[member.id] || "unknown";
                                return (
                                    <div key={member.id} className="bg-white border rounded-lg p-4 shadow-sm flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-lg">
                                                {member.full_name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-sm">{member.full_name}</div>
                                                <div className="text-xs text-muted-foreground">{member.gender === 'M' ? 'Homme' : member.gender === 'F' ? 'Femme' : 'Autre'}</div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-2">
                                            {/* Bouton Absent */}
                                            <button 
                                                onClick={() => updateStatus(member.id, 'absent')}
                                                className={cn(
                                                    "h-10 w-10 rounded-full flex items-center justify-center border transition-all",
                                                    status === 'absent' 
                                                        ? "bg-red-100 border-red-500 text-red-600 shadow-inner" 
                                                        : "bg-white border-slate-200 text-slate-400"
                                                )}
                                            >
                                                <XCircle className="h-6 w-6" />
                                            </button>

                                            {/* Bouton Présent */}
                                            <button 
                                                onClick={() => updateStatus(member.id, 'present')}
                                                className={cn(
                                                    "h-10 w-10 rounded-full flex items-center justify-center border transition-all",
                                                    status === 'present' 
                                                        ? "bg-green-100 border-green-500 text-green-600 shadow-inner" 
                                                        : "bg-white border-slate-200 text-slate-400"
                                                )}
                                            >
                                                <CheckCircle2 className="h-6 w-6" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                    </CardContent>
                </Card>
            </TabsContent>

            {/* --- ONGLET 2 : ÉQUIPES --- */}
            <TabsContent value="teams" className="mt-4 space-y-6">
                <Card className="bg-slate-50 border-slate-200">
                    <CardHeader className="pb-3"><CardTitle className="text-lg flex items-center gap-2"><Sparkles className="h-5 w-5 text-indigo-500"/> Configuration</CardTitle></CardHeader>
                    <CardContent className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="space-y-2">
                                <Label>Nombre d&apos;équipes</Label>
                                <Input type="number" min={2} max={10} value={teamCount} onChange={(e) => setTeamCount(parseInt(e.target.value))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Nombre de parties</Label>
                                <Input type="number" min={1} max={10} value={matchCount} onChange={(e) => setMatchCount(parseInt(e.target.value))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Type de jeu</Label>
                                <div className="flex items-center gap-2 bg-white p-1 rounded-md border">
                                    <Button variant={teamMode === "mixed" ? "default" : "ghost"} className="flex-1 text-xs" onClick={() => setTeamMode("mixed")}>Mixte</Button>
                                    <Button variant={teamMode === "split" ? "default" : "ghost"} className="flex-1 text-xs" onClick={() => setTeamMode("split")}>Séparé</Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Équilibrage</Label>
                                <Select value={balanceMode} onValueChange={(value) => setBalanceMode(value as BalanceMode)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="strict">Strict (5%)</SelectItem>
                                        <SelectItem value="flexible">Flexible (15%)</SelectItem>
                                        <SelectItem value="random">Aléatoire</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="sm:invisible">Action</Label>
                                <Button 
                                    className="w-full" 
                                    onClick={handleGenerateTeams} 
                                    disabled={savingTeams}
                                >
                                    {savingTeams ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publication...</>
                                    ) : (
                                        <><Sparkles className="mr-2 h-4 w-4" /> Générer</>
                                    )}
                                </Button>
                            </div>
                        </div>
                        
                        {/* Balance mode description */}
                        <div className="text-xs text-muted-foreground bg-white p-3 rounded-md border">
                            {getBalanceModeConfig(balanceMode).description}
                        </div>

                        {/* Elo toggle (visible si le club a activé le Elo) */}
                        {clubUseElo && (
                          <div className="flex items-center justify-between bg-white p-3 rounded-md border">
                            <div>
                              <Label className="text-sm font-medium">Équilibrage Elo</Label>
                              <p className="text-xs text-muted-foreground">Utiliser le classement Elo au lieu des stats manuelles pour cette session</p>
                            </div>
                            <Button
                              variant={useEloForSession ? "default" : "outline"}
                              size="sm"
                              onClick={() => setUseEloForSession(!useEloForSession)}
                              className={useEloForSession ? "bg-purple-600 hover:bg-purple-700" : ""}
                            >
                              <Trophy className="mr-1 h-3.5 w-3.5" />
                              {useEloForSession ? "Elo activé" : "Elo désactivé"}
                            </Button>
                          </div>
                        )}
                    </CardContent>
                </Card>

                {/* MULTI-MATCH DISPLAY */}
                {multiMatchData && multiMatchData.matches.length > 0 && (
                    <>
                        {/* Match Navigation & Controls */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg border">
                            {/* Match Navigation */}
                            {multiMatchData.matches.length > 1 && (
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setCurrentMatchIndex(Math.max(0, currentMatchIndex - 1))}
                                        disabled={currentMatchIndex === 0}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <div className="flex items-center gap-2">
                                        {multiMatchData.matches.map((match, idx) => (
                                            <Button
                                                key={idx}
                                                variant={currentMatchIndex === idx ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setCurrentMatchIndex(idx)}
                                                className={cn(
                                                    "min-w-[40px]",
                                                    match.winnerTeamIndex !== undefined && "border-amber-500"
                                                )}
                                            >
                                                {idx + 1}
                                                {match.winnerTeamIndex !== undefined && (
                                                    <Check className="ml-1 h-3 w-3 text-amber-500" />
                                                )}
                                            </Button>
                                        ))}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setCurrentMatchIndex(Math.min(multiMatchData.matches.length - 1, currentMatchIndex + 1))}
                                        disabled={currentMatchIndex === multiMatchData.matches.length - 1}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                                {/* Swap Mode Toggle */}
                                <Button
                                    variant={swapMode ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => {
                                        setSwapMode(!swapMode);
                                        setSelectedPlayerForSwap(null);
                                    }}
                                    className={swapMode ? "bg-orange-600 hover:bg-orange-700" : ""}
                                >
                                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                                    {swapMode ? "Mode échange actif" : "Échanger joueurs"}
                                </Button>
                                
                                {/* Regenerate button */}
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={handleGenerateTeams}
                                    disabled={savingTeams}
                                >
                                    {savingTeams ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Regénération...</>
                                    ) : (
                                        <><RefreshCw className="mr-2 h-4 w-4" /> Regénérer</>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Match Title */}
                        {multiMatchData.matches.length > 1 && (
                            <div className="text-center">
                                <h3 className="text-lg font-semibold">
                                    Partie {currentMatchIndex + 1} sur {multiMatchData.matches.length}
                                </h3>
                                {currentMatch?.winnerTeamIndex !== undefined && (
                                    <Badge className="mt-1 bg-amber-500">
                                        <Trophy className="mr-1 h-3 w-3" />
                                        Équipe {currentMatch.winnerTeamIndex + 1} gagnante
                                    </Badge>
                                )}
                            </div>
                        )}

                        {/* Swap Mode Instructions */}
                        {swapMode && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                                <p className="text-sm text-orange-800">
                                    {selectedPlayerForSwap 
                                        ? `Joueur sélectionné : ${selectedPlayerForSwap.player.full_name}. Cliquez sur un autre joueur pour échanger.`
                                        : "Cliquez sur un joueur pour le sélectionner, puis cliquez sur un autre joueur pour les échanger."
                                    }
                                </p>
                                {selectedPlayerForSwap && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-2"
                                        onClick={() => setSelectedPlayerForSwap(null)}
                                    >
                                        Annuler la sélection
                                    </Button>
                                )}
                            </div>
                        )}
                        
                        {/* Teams Grid */}
                        {currentMatch && (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {currentMatch.teams.map((team, teamIdx) => (
                                    <Card 
                                        key={teamIdx} 
                                        className={cn(
                                            "border-t-4 shadow-sm",
                                            currentMatch.winnerTeamIndex === teamIdx 
                                                ? "border-t-amber-500 bg-amber-50/30" 
                                                : "border-t-indigo-500"
                                        )}
                                    >
                                        <CardHeader className="bg-slate-50 pb-2 border-b p-4">
                                            <div className="flex justify-between items-center">
                                                <CardTitle className="text-base flex items-center gap-2">
                                                    Équipe {teamIdx + 1}
                                                    {currentMatch.winnerTeamIndex === teamIdx && (
                                                        <Trophy className="h-4 w-4 text-amber-500" />
                                                    )}
                                                </CardTitle>
                                                <div className="text-xs text-muted-foreground font-medium">{team.length} joueurs</div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-4 p-4">
                                            <ul className="space-y-3">
                                                {team.map((p: Player, playerIdx: number) => {
                                                    const isSelected = selectedPlayerForSwap?.teamIndex === teamIdx && 
                                                                     selectedPlayerForSwap?.playerIndex === playerIdx;
                                                    return (
                                                        <li 
                                                            key={p.id} 
                                                            className={cn(
                                                                "text-sm flex items-center justify-between rounded-md p-2 -mx-2 transition-all",
                                                                swapMode && "cursor-pointer hover:bg-indigo-50",
                                                                isSelected && "bg-orange-100 ring-2 ring-orange-400"
                                                            )}
                                                            onClick={() => handlePlayerClick(teamIdx, playerIdx, p)}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <div className={cn(
                                                                    "h-2 w-2 rounded-full",
                                                                    isSelected ? "bg-orange-500" : "bg-indigo-400"
                                                                )}></div>
                                                                <span className="font-medium">{p.full_name}</span>
                                                            </div>
                                                            <span className="text-xs text-purple-600 font-semibold">{p.elo_rating ?? DEFAULT_ELO_RATING}</span>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                            {currentMatch.winnerTeamIndex === undefined && (
                                                <Button
                                                    className={cn(
                                                        "w-full mt-4",
                                                        swapMode 
                                                            ? "bg-slate-400 cursor-not-allowed" 
                                                            : "bg-amber-600 hover:bg-amber-700"
                                                    )}
                                                    size="sm"
                                                    disabled={declaringWinner || swapMode}
                                                    onClick={() => handleDeclareWinner(teamIdx)}
                                                    title={swapMode ? "Désactivez le mode échange pour déclarer un vainqueur" : undefined}
                                                >
                                                    {declaringWinner ? (
                                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mise à jour...</>
                                                    ) : (
                                                        <><Trophy className="mr-2 h-4 w-4" /> Déclarer vainqueur</>
                                                    )}
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </TabsContent>
        </Tabs>
      </main>

      {/* --- BOTTOM NAVIGATION BAR (MOBILE ONLY) --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t flex z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
         <button 
            onClick={() => setActiveTab("attendance")}
            className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 transition-colors",
                activeTab === "attendance" ? "text-indigo-600 bg-indigo-50/50" : "text-slate-400 hover:bg-slate-50"
            )}
         >
            <ClipboardList className={cn("h-6 w-6", activeTab === "attendance" && "fill-current opacity-20")} />
            <span className="text-[10px] font-medium">Présences</span>
         </button>

         <div className="w-[1px] bg-slate-100 h-10 self-center"></div>

         <button 
            onClick={() => setActiveTab("teams")}
            className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 transition-colors",
                activeTab === "teams" ? "text-indigo-600 bg-indigo-50/50" : "text-slate-400 hover:bg-slate-50"
            )}
         >
            <Shirt className={cn("h-6 w-6", activeTab === "teams" && "fill-current opacity-20")} />
            <span className="text-[10px] font-medium">Équipes</span>
         </button>
      </div>

    </div>
  );
}