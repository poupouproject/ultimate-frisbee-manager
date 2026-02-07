"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2 } from "lucide-react"; 

export interface Member {
  id: string;
  full_name: string;
  email?: string | null;
  gender: "M" | "F" | "X";
  speed: number;
  throwing: number;
  is_active: boolean;
  elo_rating: number;
  wins: number;
  losses: number;
}

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clubId: string;
  memberToEdit?: Member | null;
  onSuccess: () => void;
  onDelete?: (id: string) => void;
  useEloRanking?: boolean;
}

export function AddMemberDialog({ 
  open, 
  onOpenChange, 
  clubId, 
  memberToEdit, 
  onSuccess,
  onDelete,
  useEloRanking 
}: AddMemberDialogProps) {
  
  const [loading, setLoading] = useState(false);
  
  // État du formulaire
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "M",
    speed: 5,
    throwing: 5,
    elo_rating: 1000,
  });

  // Quand la fenêtre s'ouvre ou que le membre change, on met à jour le formulaire
  useEffect(() => {
    if (memberToEdit) {
      // Mode MODIFICATION : on remplit les champs
      setFormData({
        name: memberToEdit.full_name,
        email: memberToEdit.email || "",
        gender: memberToEdit.gender,
        speed: memberToEdit.speed,
        throwing: memberToEdit.throwing,
        elo_rating: memberToEdit.elo_rating ?? 1000,
      });
    } else {
      // Mode CRÉATION : on vide les champs
      setFormData({
        name: "",
        email: "",
        gender: "M",
        speed: 5,
        throwing: 5,
        elo_rating: 1000,
      });
    }
  }, [memberToEdit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        club_id: clubId,
        full_name: formData.name,
        email: formData.email || null,
        gender: formData.gender,
        speed: formData.speed,
        throwing: formData.throwing,
        is_active: true,
        elo_rating: formData.elo_rating,
      };

      if (memberToEdit) {
        const { error } = await supabase
          .from("members")
          .update(payload)
          .eq('id', memberToEdit.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("members")
          .insert(payload);
        if (error) throw error;
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      alert("Erreur : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Gestion du clic sur Supprimer
  const handleDeleteClick = () => {
    if (memberToEdit && onDelete) {
        if (confirm("Êtes-vous sûr de vouloir supprimer ce joueur ?")) {
            onDelete(memberToEdit.id);
            onOpenChange(false);
        }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {memberToEdit ? "Modifier le joueur" : "Ajouter un joueur"}
            </DialogTitle>
            <DialogDescription>
              {memberToEdit 
                ? "Modifiez les infos ou supprimez le joueur." 
                : "Créez un nouveau profil de joueur pour votre club."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* NOM */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nom</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="col-span-3"
                required
              />
            </div>

            {/* COURRIEL */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Courriel</Label>
              <Input
                id="email"
                type="email"
                placeholder="Optionnel"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="col-span-3"
              />
            </div>

            {/* GENRE */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gender" className="text-right">Genre</Label>
              <select
                id="gender"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
              >
                <option value="M">Homme</option>
                <option value="F">Femme</option>
                <option value="X">Autre</option>
              </select>
            </div>

            {/* VITESSE */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Vitesse</Label>
              <div className="col-span-3 flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  value={formData.speed}
                  onChange={(e) => setFormData({...formData, speed: Number(e.target.value)})}
                />
                <span className="font-bold w-6">{formData.speed}</span>
              </div>
            </div>

            {/* LANCER */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Lancer</Label>
              <div className="col-span-3 flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  value={formData.throwing}
                  onChange={(e) => setFormData({...formData, throwing: Number(e.target.value)})}
                />
                <span className="font-bold w-6">{formData.throwing}</span>
              </div>
            </div>

            {/* ELO RATING (visible uniquement si le club utilise le Elo) */}
            {useEloRanking && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="elo_rating" className="text-right">Elo</Label>
                <Input
                  id="elo_rating"
                  type="number"
                  min="0"
                  value={formData.elo_rating}
                  onChange={(e) => setFormData({...formData, elo_rating: Number(e.target.value)})}
                  className="col-span-3"
                />
              </div>
            )}

            {/* STATS WIN/LOSS (lecture seule, visible en modification) */}
            {memberToEdit && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Stats</Label>
                <div className="col-span-3 flex items-center gap-4 text-sm">
                  <span className="text-green-600 font-semibold">{memberToEdit.wins ?? 0} V</span>
                  <span className="text-red-600 font-semibold">{memberToEdit.losses ?? 0} D</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-row justify-between sm:justify-between items-center w-full gap-2">
            {/* Bouton SUPPRIMER (Seulement en modification) */}
            {memberToEdit ? (
                <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={handleDeleteClick}
                >
                    <Trash2 className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Supprimer</span>
                </Button>
            ) : (
                <div /> /* Spacer vide si pas de bouton supprimer */
            )}

            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {memberToEdit ? "Sauvegarder" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}