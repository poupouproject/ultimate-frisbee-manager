"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal, Loader2, PlusCircle, Trash2, Pencil } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AddMemberDialog, Member } from "./add-member-dialog";

export function MembersTable({ clubId }: { clubId: string }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // États pour gérer la modale (Dialog)
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);

  // Charger les membres
  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('club_id', clubId)
      .order('full_name', { ascending: true });

    if (error) {
      console.error("Erreur:", error);
    } else {
      setMembers((data as any[]) || []);
    }
    setIsLoading(false);
  }, [clubId]);

  // Chargement initial
  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // --- ACTIONS ---

  // Ouvrir pour CRÉER
  const handleCreate = () => {
    setMemberToEdit(null); // On vide la sélection
    setIsDialogOpen(true);
  };

  // Ouvrir pour MODIFIER
  const handleEdit = (member: Member) => {
    setMemberToEdit(member); // On remplit avec le membre cliqué
    setIsDialogOpen(true);
  };

  // Action SUPPRIMER
  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce joueur ?")) return;

    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id);

    if (error) {
      alert("Erreur lors de la suppression");
    } else {
      fetchMembers(); // On rafraîchit la liste
    }
  };

  return (
    <Card className="xl:col-span-2">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Membres du Club</CardTitle>
          <CardDescription>
            Gérez vos joueurs et leurs statistiques.
          </CardDescription>
        </div>
        
        {/* Bouton AJOUTER */}
        <Button size="sm" className="ml-auto gap-1" onClick={handleCreate}>
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Ajouter un joueur
          </span>
        </Button>

      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : members.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            Aucun membre trouvé. Cliquez sur "Ajouter un joueur" pour commencer !
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead className="hidden md:table-cell">Courriel</TableHead>
                <TableHead className="hidden sm:table-cell">Genre</TableHead>
                <TableHead className="hidden sm:table-cell">Vitesse</TableHead>
                <TableHead className="hidden md:table-cell">Lancer</TableHead>
                <TableHead className="text-right">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="font-medium">{member.full_name}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                    {member.email || "-"}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline">{member.gender}</Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {member.speed}/10
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {member.throwing}/10
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={member.is_active ? "secondary" : "destructive"}>
                      {member.is_active ? "Actif" : "Inactif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {/* Action Modifier */}
                        <DropdownMenuItem onClick={() => handleEdit(member)}>
                            <Pencil className="mr-2 h-4 w-4" /> Modifier
                        </DropdownMenuItem>
                        {/* Action Supprimer */}
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(member.id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Le Dialog unique qui sert pour Créer et Modifier */}
      <AddMemberDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        clubId={clubId}
        memberToEdit={memberToEdit}
        onSuccess={fetchMembers}
      />
    </Card>
  );
}