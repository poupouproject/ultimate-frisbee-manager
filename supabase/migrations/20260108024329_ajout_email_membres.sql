-- Ajout de la colonne email (optionnelle)
ALTER TABLE members ADD COLUMN IF NOT EXISTS email TEXT;