"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Calendar, Pencil, Plus } from "lucide-react";

interface SessionDialogProps {
  clubId: string;
  sessionToEdit?: any; // Si présent, on est en mode "MODIFICATION"
  onSuccess: () => void;
}

export function SessionDialog({ clubId, sessionToEdit, onSuccess }: SessionDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    location: "",
  });

  // Quand la fenêtre s'ouvre, on remplit le formulaire si c'est une modification
  useEffect(() => {
    if (open) {
      if (sessionToEdit) {
        // Astuce pour convertir la date UTC (Supabase) en format local pour l'input (YYYY-MM-DDTHH:mm)
        const dateObj = new Date(sessionToEdit.date);
        const offset = dateObj.getTimezoneOffset() * 60000; // Décalage en ms
        const localIso = new Date(dateObj.getTime() - offset).toISOString().slice(0, 16);

        setFormData({
          name: sessionToEdit.name,
          date: localIso,
          location: sessionToEdit.location || "",
        });
      } else {
        // Mode CRÉATION : Date par défaut (Demain 19h)
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 1);
        defaultDate.setHours(19, 0, 0, 0);
        const offset = defaultDate.getTimezoneOffset() * 60000;
        const localIso = new Date(defaultDate.getTime() - offset).toISOString().slice(0, 16);

        setFormData({
          name: "Match de Ligue",
          date: localIso,
          location: "Parc Local",
        });
      }
    }
  }, [open, sessionToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        club_id: clubId,
        name: formData.name,
        date: new Date(formData.date).toISOString(), // On renvoie en UTC
        location: formData.location,
      };

      if (sessionToEdit) {
        // --- UPDATE ---
        const { error } = await supabase
          .from("sessions")
          .update(payload)
          .eq("id", sessionToEdit.id);
        if (error) throw error;
      } else {
        // --- INSERT ---
        const { error } = await supabase.from("sessions").insert(payload);
        if (error) throw error;
      }

      setOpen(false);
      onSuccess(); // Rafraîchir la page parente
    } catch (error: any) {
      alert("Erreur : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {sessionToEdit ? (
            // Bouton Petit Crayon (Mode Modif)
            <Button variant="ghost" size="icon" className="h-8 w-8">
                <Pencil className="h-4 w-4 text-muted-foreground" />
            </Button>
        ) : (
            // Bouton Normal (Mode Création)
            <Button>
                <Plus className="mr-2 h-4 w-4" /> Nouvelle Session
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{sessionToEdit ? "Modifier la session" : "Planifier une session"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom de l'événement</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Match #1"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Date et Heure</Label>
              <div className="flex items-center gap-2">
                 <Calendar className="h-4 w-4 text-muted-foreground"/>
                 <Input
                    id="date"
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                 />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Lieu</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {sessionToEdit ? "Sauvegarder les modifications" : "Ajouter au calendrier"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}