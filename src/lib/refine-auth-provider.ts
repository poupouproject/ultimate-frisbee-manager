import type { AuthProvider } from "@refinedev/core";
import { supabase } from "./supabase";

/**
 * Refine auth provider adapté pour l'authentification OAuth (GitHub, Google, Azure)
 * via Supabase Auth.
 */
export const authProvider: AuthProvider = {
  login: async ({ provider }: { provider?: "github" | "google" | "azure" }) => {
    if (!provider) {
      return {
        success: false,
        error: { name: "LoginError", message: "Un fournisseur OAuth est requis." },
      };
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL ?? ""}/auth/callback`,
      },
    });

    if (error) {
      return { success: false, error: { name: error.name, message: error.message } };
    }

    return { success: true };
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { success: false, error: { name: error.name, message: error.message } };
    }
    return { success: true, redirectTo: "/login" };
  },

  check: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      return { authenticated: true };
    }

    return { authenticated: false, redirectTo: "/login" };
  },

  getIdentity: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    return {
      id: user.id,
      name: user.user_metadata?.full_name ?? user.email ?? user.id,
      avatar: user.user_metadata?.avatar_url as string | undefined,
      email: user.email,
    };
  },

  onError: async (error: unknown) => {
    const status =
      (error as { status?: number })?.status ??
      (error as { statusCode?: number })?.statusCode;
    if (status === 401 || status === 403) {
      return { logout: true, redirectTo: "/login" };
    }
    return {};
  },
};
