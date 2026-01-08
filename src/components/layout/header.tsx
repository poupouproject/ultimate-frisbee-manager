"use client"; // Obligatoire car on utilise des hooks (usePathname, useRouter)

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CircleUser, Menu, Package2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Header() {
  const pathname = usePathname(); // Nous donne l'URL actuelle (ex: "/members")
  const router = useRouter();

  // Fonction pour gérer la déconnexion
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login"); // Redirection vers le login
  };

  // Petite fonction utilitaire pour savoir si un lien est actif
  const getLinkClass = (path: string) => {
    return pathname === path
      ? "text-foreground transition-colors hover:text-foreground" // Actif (Noir)
      : "text-muted-foreground transition-colors hover:text-foreground"; // Inactif (Gris)
  };

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <Package2 className="h-6 w-6" />
          <span className="sr-only">Ultimate Manager</span>
        </Link>
        
        {/* Lien Dashboard */}
        <Link href="/dashboard" className={getLinkClass("/dashboard")}>
          Tableau de bord
        </Link>
        
        {/* Lien Membres */}
        <Link href="/members" className={getLinkClass("/members")}>
          Membres
        </Link>

        {/* Lien Sessions (Pas encore fait) */}
        <Link href="/sessions" className={getLinkClass("/sessions")}>
          Sessions
        </Link>
      </nav>

      {/* --- MENU MOBILE --- */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu navigation</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold">
              <Package2 className="h-6 w-6" />
              <span>Ultimate Manager</span>
            </Link>
            <Link href="/dashboard" className={pathname === "/dashboard" ? "text-foreground" : "text-muted-foreground"}>
              Tableau de bord
            </Link>
            <Link href="/members" className={pathname === "/members" ? "text-foreground" : "text-muted-foreground"}>
              Membres
            </Link>
            <Link href="/sessions" className={pathname === "/sessions" ? "text-foreground" : "text-muted-foreground"}>
              Sessions
            </Link>
          </nav>
        </SheetContent>
      </Sheet>

      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto flex-1 sm:flex-initial">
          {/* Espace pour une barre de recherche future */}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">Menu utilisateur</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Paramètres</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            {/* Bouton Déconnexion fonctionnel */}
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4"/> Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}