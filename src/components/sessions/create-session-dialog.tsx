"use client";

import { useState } from "react";
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
import { Plus, Loader2, Calendar } from "lucide-react";

interface CreateSessionDialogProps {
  clubId: string;
  onSuccess: () => void;
}

export function CreateSessionDialog({ clubId, onSuccess }: CreateSessionDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Par défaut, on propose la date de demain à 19h00
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 1);
  defaultDate.setHours(19, 0, 0, 0);
  // Format pour l'input datetime-local: YYYY-MM-DDTHH:mm
  const defaultDateString = defaultDate.toISOString().slice(0, 16);

  const [formData, setFormData] = useState({
    name: "Match de Ligue",
    date: defaultDateString,
    location: "Parc Local",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("sessions").insert({
        club_id: clubId,
        name: formData.name,
        date: new Date(formData.date).toISOString(), // Conversion importante pour SQL
        location: formData.location,
      });

      if (error) throw error;

      setOpen(false);
      onSuccess();
    } catch (error: any) {
      alert("Erreur : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Nouvelle Session
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Planifier une session</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom de l'événement</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Match #1, Pratique..."
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
            Ajouter au calendrier
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}