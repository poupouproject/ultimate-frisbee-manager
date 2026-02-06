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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, PlusCircle, Zap, Target, User, Trophy } from "lucide-react";
import { AddMemberDialog, Member } from "./add-member-dialog";
import { Badge } from "@/components/ui/badge";

export function MembersTable({ clubId }: { clubId: string }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('club_id', clubId)
      .order('full_name', { ascending: true });

    if (error) console.error("Erreur:", error);
    else setMembers((data as any[]) || []);
    setIsLoading(false);
  }, [clubId]);

  // Chargement initial
  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // --- ACTIONS ---

  // Ouvrir pour CRÉER
  const handleCreate = () => {
    setMemberToEdit(null);
    setIsDialogOpen(true);
  };

  // Ouvrir pour MODIFIER
  const handleEdit = (member: Member) => {
    setMemberToEdit(member);
    setIsDialogOpen(true);
  };

  // Action SUPPRIMER
  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('members').delete().eq('id', id);
    if (error) alert("Erreur lors de la suppression");
    else fetchMembers();
  };

  return (
    <Card className="xl:col-span-2">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Membres du Club</CardTitle>
          <CardDescription>
            Gérez vos joueurs. Cliquez sur un joueur pour modifier.
          </CardDescription>
        </div>
        <Button size="sm" className="ml-auto gap-1" onClick={handleCreate}>
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Ajouter
          </span>
        </Button>
      </CardHeader>
      <CardContent className="p-0 sm:p-6"> 
      {/* p-0 sur mobile pour gagner de la place */}
        
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : members.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            Aucun membre trouvé.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Joueur</TableHead>
                {/* On cache les colonnes détaillées sur mobile si besoin, ou on simplifie */}
                <TableHead className="text-right pr-4">Stats</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow 
                    key={member.id} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleEdit(member)} // Clic sur toute la ligne
                >
                  <TableCell className="pl-4 py-3">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border">
                            {member.full_name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm leading-none mb-1">{member.full_name}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                {member.gender === 'M' ? 'Homme' : member.gender === 'F' ? 'Femme' : 'Autre'}
                                {member.email && <span className="hidden sm:inline">• {member.email}</span>}
                            </span>
                        </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-right pr-4 py-3">
                    <div className="flex items-center justify-end gap-2 sm:gap-4">
                        {/* ELO RATING */}
                        <div className="flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-1 rounded border border-purple-100">
                            <Trophy className="h-3.5 w-3.5 text-purple-600" />
                            <span className="font-bold text-sm">{member.elo_rating ?? 1000}</span>
                        </div>

                        {/* VITESSE */}
                        <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded border border-yellow-100">
                            <Zap className="h-3.5 w-3.5 fill-yellow-500 text-yellow-600" />
                            <span className="font-bold text-sm">{member.speed}</span>
                        </div>

                        {/* LANCER */}
                        <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">
                            <Target className="h-3.5 w-3.5 text-blue-600" />
                            <span className="font-bold text-sm">{member.throwing}</span>
                        </div>
                    </div>
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
        onDelete={handleDelete} 
      />
    </Card>
  );
}