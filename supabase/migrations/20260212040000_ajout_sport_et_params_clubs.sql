-- Migration pour supporter plusieurs sports et paramètres de classement personnalisés
-- Issue #10: Généraliser l'application pour supporter d'autres sports

-- 1. Ajout du type de sport au club
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS sport TEXT DEFAULT 'ultimate_frisbee';

-- 2. Ajout des paramètres de classement personnalisés
-- Structure JSON pour stocker les attributs personnalisés selon le sport
-- Exemple: {"skill1": {"name": "Vitesse", "min": 1, "max": 10}, "skill2": {"name": "Lancer", "min": 1, "max": 10}}
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS ranking_params JSONB DEFAULT '{"skill1": {"name": "Vitesse", "enabled": true}, "skill2": {"name": "Lancer", "enabled": true}}';

-- 3. Commentaires pour documenter les colonnes
COMMENT ON COLUMN clubs.sport IS 'Type de sport du club (ultimate_frisbee, football, basketball, volleyball, etc.)';
COMMENT ON COLUMN clubs.ranking_params IS 'Paramètres de classement personnalisés en JSON - définit les attributs de compétence utilisés pour évaluer les joueurs';
