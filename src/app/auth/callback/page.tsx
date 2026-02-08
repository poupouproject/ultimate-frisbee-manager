"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Page de callback OAuth
 *
 * Cette page reçoit le hash fragment avec les tokens d'authentification
 * de Supabase et établit la session avant de rediriger vers le dashboard.
 */
export default function AuthCallbackPage() {
  const [status, setStatus] = useState("Connexion en cours...");

  useEffect(() => {
    // Listen for auth state changes - this will fire when the hash is processed
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setStatus("Session établie, redirection...");
        // Small delay to ensure cookies are set
        await new Promise(resolve => setTimeout(resolve, 200));
        // Full page reload to ensure server sees the new cookies
        window.location.href = '/dashboard';
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // Token was refreshed, redirect to dashboard
        window.location.href = '/dashboard';
      } else if (event === 'SIGNED_OUT') {
        setStatus("Déconnecté, redirection...");
        window.location.href = '/login';
      }
    });

    // Also check if we already have a session (in case the event already fired)
    const checkExistingSession = async () => {
      // Wait a bit for the hash to be processed
      await new Promise(resolve => setTimeout(resolve, 500));

      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setStatus("Session trouvée, redirection...");
        window.location.href = '/dashboard';
      } else if (!window.location.hash.includes('access_token')) {
        // No hash fragment and no session = go back to login
        setStatus("Aucune session, retour au login...");
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      }
    };

    checkExistingSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-xl text-gray-700">{status}</h2>
        <p className="text-gray-400 text-sm mt-2">Veuillez patienter</p>
      </div>
    </div>
  );
}
