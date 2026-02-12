"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Loader2, Settings2 } from "lucide-react";
import { SPORTS, getDefaultRankingParams, type RankingParams } from "@/lib/sports";

interface CreateClubFormProps {
  onClubCreated: () => void;
}

export function CreateClubForm({ onClubCreated }: CreateClubFormProps) {
  const [name, setName] = useState("");
  const [sport, setSport] = useState("ultimate_frisbee");
  const [useEloRanking, setUseEloRanking] = useState(false);
  const [rankingParams, setRankingParams] = useState<RankingParams>(getDefaultRankingParams("ultimate_frisbee"));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSportChange = (newSport: string) => {
    setSport(newSport);
    setRankingParams(getDefaultRankingParams(newSport));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non connecté");

      const generatedSlug = name
        .toLowerCase()
        .trim()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const { error } = await supabase.from('clubs').insert({
        name: name,
        owner_id: user.id,
        slug: generatedSlug,
        sport: sport,
        use_elo_ranking: useEloRanking,
        ranking_params: rankingParams,
      });

      if (error) throw error;
      
      onClubCreated(); 
    } catch (error: unknown) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
      alert("Erreur : " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const selectedSport = SPORTS.find(s => s.id === sport);

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Bienvenue !</CardTitle>
          <CardDescription>
            Créez votre club et configurez-le selon votre sport.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nom du club */}
            <div className="space-y-2">
              <Label htmlFor="clubName">Nom du Club</Label>
              <Input 
                id="clubName" 
                placeholder="Ex: Les Champions de Lévis" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Sélection du sport */}
            <div className="space-y-2">
              <Label htmlFor="sport">Type de sport</Label>
              <Select value={sport} onValueChange={handleSportChange}>
                <SelectTrigger id="sport">
                  <SelectValue placeholder="Sélectionnez un sport" />
                </SelectTrigger>
                <SelectContent>
                  {SPORTS.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      <span className="flex items-center gap-2">
                        <span>{s.icon}</span>
                        <span>{s.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mode de classement */}
            <div className="space-y-3">
              <Label>Mode de classement</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUseEloRanking(false)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    !useEloRanking 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted hover:border-muted-foreground/30'
                  }`}
                >
                  <div className="font-medium text-sm">Manuel</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {selectedSport?.defaultRankingParams.skill1.name} / {selectedSport?.defaultRankingParams.skill2.name}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setUseEloRanking(true)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    useEloRanking 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-muted hover:border-muted-foreground/30'
                  }`}
                >
                  <div className="font-medium text-sm flex items-center gap-1">
                    <Trophy className="h-3.5 w-3.5 text-purple-600" />
                    Classement Elo
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Ajustement auto après matchs
                  </div>
                </button>
              </div>
            </div>

            {/* Paramètres avancés */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Settings2 className="h-4 w-4" />
                {showAdvanced ? 'Masquer' : 'Afficher'} les paramètres avancés
              </button>

              {showAdvanced && (
                <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Personnalisez les attributs de classement manuel pour vos joueurs.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="skill1Name" className="text-xs">Nom du premier attribut</Label>
                      <Input
                        id="skill1Name"
                        value={rankingParams.skill1.name}
                        onChange={(e) => setRankingParams({
                          ...rankingParams,
                          skill1: { ...rankingParams.skill1, name: e.target.value }
                        })}
                        placeholder="Ex: Vitesse"
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="skill2Name" className="text-xs">Nom du second attribut</Label>
                      <Input
                        id="skill2Name"
                        value={rankingParams.skill2.name}
                        onChange={(e) => setRankingParams({
                          ...rankingParams,
                          skill2: { ...rankingParams.skill2, name: e.target.value }
                        })}
                        placeholder="Ex: Lancer"
                        className="h-9"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer mon club
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}