import { createBrowserClient } from '@supabase/ssr';

// On récupère les variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Vérification de sécurité pour le développeur (toi)
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Il manque les variables d'environnement Supabase dans .env.local");
}

// Client optimisé pour le navigateur avec gestion automatique des cookies
// Cela permet la synchronisation entre client et serveur (middleware, layouts)
export const supabase = createBrowserClient(supabaseUrl, supabaseKey);
