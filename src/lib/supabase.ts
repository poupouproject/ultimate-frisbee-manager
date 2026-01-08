import { createClient } from '@supabase/supabase-js';

// On récupère les variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Vérification de sécurité pour le développeur (toi)
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Il manque les variables d'environnement Supabase dans .env.local");
}

// On crée et exporte le client unique
export const supabase = createClient(supabaseUrl, supabaseKey);