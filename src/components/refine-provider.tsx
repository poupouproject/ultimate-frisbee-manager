"use client";

import { Refine } from "@refinedev/core";
import routerProvider from "@refinedev/nextjs-router/app";
import { dataProvider } from "@refinedev/supabase";
import { supabase } from "@/lib/supabase";
import { authProvider } from "@/lib/refine-auth-provider";

/**
 * RefineProvider fournit le contexte Refine à l'application :
 * - authProvider : gestion de l'authentification OAuth via Supabase
 * - dataProvider : accès CRUD aux tables Supabase (members, sessions)
 * - routerProvider : intégration avec le routeur Next.js App Router
 * - resources : ressources gérées (membres, sessions)
 */
export function RefineProvider({ children }: { children: React.ReactNode }) {
  return (
    <Refine
      routerProvider={routerProvider}
      dataProvider={dataProvider(supabase)}
      authProvider={authProvider}
      resources={[
        {
          name: "members",
          list: "/members",
          meta: { label: "Membres" },
        },
        {
          name: "sessions",
          list: "/sessions",
          meta: { label: "Sessions" },
        },
      ]}
      options={{
        syncWithLocation: false,
        warnWhenUnsavedChanges: true,
        disableTelemetry: true,
      }}
    >
      {children}
    </Refine>
  );
}
