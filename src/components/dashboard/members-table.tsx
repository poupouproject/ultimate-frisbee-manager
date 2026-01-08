"use client";

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
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Données fictives (mock) en attendant Supabase
const members = [
  { id: 1, name: "Jonathan Poulin", gender: "M", speed: 8, throw: 9, status: "Actif" },
  { id: 2, name: "Valérie Gignac", gender: "F", speed: 7, throw: 8, status: "Actif" },
  { id: 3, name: "Arnaud Poulin", gender: "M", speed: 9, throw: 6, status: "Blessé" },
  { id: 4, name: "Alex (LAN)", gender: "M", speed: 6, throw: 9, status: "Actif" },
  { id: 5, name: "Bruno (Host)", gender: "M", speed: 5, throw: 5, status: "Inactif" },
];

export function MembersTable() {
  return (
    <Card className="xl:col-span-2">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Membres du Club</CardTitle>
          <CardDescription>
            Gérez vos joueurs et leurs statistiques.
          </CardDescription>
        </div>
        <Button size="sm" className="ml-auto gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Ajouter un joueur
          </span>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
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
                  <div className="font-medium">{member.name}</div>
                  <div className="hidden text-sm text-muted-foreground md:inline">
                    utilisateur@example.com
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant="outline">{member.gender}</Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {member.speed}/10
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {member.throw}/10
                </TableCell>
                <TableCell className="text-right">
                    <Badge variant={member.status === "Actif" ? "secondary" : "destructive"}>
                        {member.status}
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
                      <DropdownMenuItem>Modifier</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Supprimer</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}