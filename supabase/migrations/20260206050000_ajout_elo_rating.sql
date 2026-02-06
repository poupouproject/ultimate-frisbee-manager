-- Ajout de la colonne elo_rating pour le système de classement Elo
ALTER TABLE members ADD COLUMN IF NOT EXISTS elo_rating INT DEFAULT 1000;
