-- On ajoute une colonne JSON pour stocker la structure des équipes (ex: [[Joueur1, Joueur2], [Joueur3...]])
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS generated_teams JSONB;