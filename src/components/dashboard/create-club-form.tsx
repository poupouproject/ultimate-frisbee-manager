"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Loader2 } from "lucide-react";

interface CreateClubFormProps {
  onClubCreated: () => void; // Pour dire à la page parent "C'est bon, recharge !"
}

export function CreateClubForm({ onClubCreated }: CreateClubFormProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non connecté");

      // 1. On génère le slug automatiquement
      // Ex: "Club de Lévis !" devient "club-de-levis"
      const generatedSlug = name
        .toLowerCase()
        .trim()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Enlève les accents (é -> e)
        .replace(/[^a-z0-9]+/g, '-') // Remplace les espaces et symboles par des tirets
        .replace(/^-+|-+$/g, ''); // Enlève les tirets en trop au début ou à la fin

      // 2. On l'envoie à Supabase avec le reste
      const { error } = await supabase.from('clubs').insert({
        name: name,
        owner_id: user.id,
        slug: generatedSlug // <--- C'est la ligne qui manquait !
      });

      if (error) throw error;
      
      onClubCreated(); 
    } catch (error: any) {
      console.error(error);
      alert("Erreur : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Bienvenue !</CardTitle>
          <CardDescription>
            Pour commencer, donnez un nom à votre club d'Ultimate.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clubName">Nom du Club</Label>
              <Input 
                id="clubName" 
                placeholder="Ex: Club Cycliste de Lévis... oups, Ultimate de Lévis !" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
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