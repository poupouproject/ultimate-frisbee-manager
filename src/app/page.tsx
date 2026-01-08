import { Header } from "@/components/layout/header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { MembersTable } from "@/components/dashboard/members-table";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <StatsCards />
        <div className="grid gap-4 md:gap-8 lg:grid-cols-1 xl:grid-cols-3">
          <MembersTable />
          
          {/* Section latérale pour les sessions récentes ou à venir */}
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2 xl:col-span-1">
             {/* Tu pourras ajouter ici un composant "Prochaine Session" ou "Activité Récente" */}
             <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                <h3 className="font-semibold leading-none tracking-tight mb-4">Activité Récente</h3>
                <p className="text-sm text-muted-foreground">Aucune activité enregistrée cette semaine.</p>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}