-- Ajout du système de classement Elo et statistiques de match

-- 1. Colonnes Elo et stats sur les membres (scopé par club via club_id existant)
ALTER TABLE members ADD COLUMN IF NOT EXISTS elo_rating INT DEFAULT 1000;
ALTER TABLE members ADD COLUMN IF NOT EXISTS wins INT DEFAULT 0;
ALTER TABLE members ADD COLUMN IF NOT EXISTS losses INT DEFAULT 0;

-- 2. Option pour activer le ranking Elo au niveau du club
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS use_elo_ranking BOOLEAN DEFAULT FALSE;
