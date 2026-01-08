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
import { PlusCircle, Loader2 } from "lucide-react";

// On définit le type ici pour pouvoir l'utiliser
export interface Member {
  id: string;
  full_name: string;
  email?: string | null;
  gender: "M" | "F" | "X";
  speed: number;
  throwing: number;
  is_active: boolean;
}

interface AddMemberDialogProps {
  open: boolean;                 // Est-ce que la fenêtre est ouverte ?
  onOpenChange: (open: boolean) => void; // Fonction pour fermer la fenêtre
  clubId: string;
  memberToEdit?: Member | null;  // Le membre à modifier (optionnel)
  onSuccess: () => void;
}

export function AddMemberDialog({ 
  open, 
  onOpenChange, 
  clubId, 
  memberToEdit, 
  onSuccess 
}: AddMemberDialogProps) {
  
  const [loading, setLoading] = useState(false);
  
  // État du formulaire
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "M",
    speed: 5,
    throwing: 5,
  });

  // Quand la fenêtre s'ouvre ou que le membre change, on met à jour le formulaire
  useEffect(() => {
    if (memberToEdit) {
      // Mode MODIFICATION : on remplit les champs
      setFormData({
        name: memberToEdit.full_name,
        email: "",
        gender: memberToEdit.gender,
        speed: memberToEdit.speed,
        throwing: memberToEdit.throwing,
      });
    } else {
      // Mode CRÉATION : on vide les champs
      setFormData({
        name: "",
        email: "",
        gender: "M",
        speed: 5,
        throwing: 5,
      });
    }
  }, [memberToEdit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Récupérer l'utilisateur connecté (pour l'assigner comme propriétaire)
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error("Utilisateur non connecté");
      
      if (memberToEdit) {
        // --- LOGIQUE DE MISE À JOUR (UPDATE) ---
        const { error } = await supabase
          .from("members")
          .update({
            full_name: formData.name,
            email: formData.email || null, // Si vide, on envoie null
            gender: formData.gender,
            speed: formData.speed,
            throwing: formData.throwing,
          })
          .eq('id', memberToEdit.id); // Important : on vise le bon ID

        if (error) throw error;

      } else {
        // --- LOGIQUE DE CRÉATION (INSERT) ---
        const { error } = await supabase
          .from("members")
          .insert({
            club_id: clubId,
            full_name: formData.name,
            gender: formData.gender,
            speed: formData.speed,
            throwing: formData.throwing,
            is_active: true,
          });

        if (error) throw error;
      }

      onSuccess(); // Rafraîchir le tableau
      onOpenChange(false); // Fermer la modale

    } catch (error: any) {
      alert("Erreur : " + error.message);
    } finally {
      setLoading(false);
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
                ? "Mettez à jour les informations du joueur." 
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
                placeholder="Ex: Jonathan Poulin"
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

            {/* VITESSE (Slider) */}
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

            {/* LANCER (Slider) */}
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
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {memberToEdit ? "Mettre à jour" : "Sauvegarder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}