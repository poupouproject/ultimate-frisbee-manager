"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { supabase } from "@/lib/supabase";
import { Settings, User, Trophy, LogOut, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [clubs, setClubs] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const user = session.user;
    setUserProfile({
      id: user.id,
      email: user.email,
      displayName: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "",
      avatarUrl: user.user_metadata?.avatar_url || "",
      provider: user.app_metadata?.provider || "",
    });

    const { data: clubsData } = await supabase
      .from("clubs")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (clubsData) {
      setClubs(clubsData);
    }

    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter((n) => n.length > 0)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Chargement...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
        {/* En-tête */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-100 text-slate-700 rounded-lg">
              <Settings className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Paramètres</h2>
              <p className="text-muted-foreground">
                Gérez votre profil et vos préférences
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Section Profil */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profil
              </CardTitle>
              <CardDescription>
                Vos informations personnelles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={userProfile.avatarUrl} alt={userProfile.displayName} />
                  <AvatarFallback className="text-lg">
                    {getInitials(userProfile.displayName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">{userProfile.displayName}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    Connecté via {userProfile.provider}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nom d&apos;affichage</Label>
                  <Input
                    value={userProfile.displayName}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Le nom d&apos;affichage provient de votre fournisseur d&apos;identité ({userProfile.provider}).
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Adresse courriel</Label>
                  <Input
                    value={userProfile.email}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section Clubs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Mes Clubs
              </CardTitle>
              <CardDescription>
                Les clubs dont vous êtes propriétaire
              </CardDescription>
            </CardHeader>
            <CardContent>
              {clubs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Vous n&apos;avez pas encore de club.
                  </p>
                  <Link href="/dashboard">
                    <Button>Créer un club</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {clubs.map((club) => (
                    <div
                      key={club.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{club.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Créé le{" "}
                          {new Date(club.created_at).toLocaleDateString("fr-CA")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                          Admin
                        </span>
                        <Link href="/dashboard">
                          <Button variant="ghost" size="sm">
                            Ouvrir
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Section Compte */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <LogOut className="h-5 w-5" />
              Zone de danger
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              La déconnexion vous redirigera vers la page de connexion.
            </p>
            <Button
              variant="destructive"
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = '/login';
              }}
            >
              Se déconnecter
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
