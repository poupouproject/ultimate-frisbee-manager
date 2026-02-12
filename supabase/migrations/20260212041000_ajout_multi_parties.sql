-- Migration pour supporter plusieurs parties par session
-- La colonne generated_teams existante stockera maintenant un tableau de parties
-- Chaque partie contient ses propres équipes
-- Format: { matches: [ {teams: [[joueur1, joueur2], [joueur3, ...]]}, {teams: [...]}, ... ] }

-- Pas besoin de modifier la colonne JSONB existante car elle peut déjà stocker n'importe quelle structure JSON
-- On va simplement utiliser un format différent pour les nouvelles sessions

-- Pour la rétro-compatibilité, on gardera la détection automatique du format dans le code
-- (ancien format: tableau d'équipes directement, nouveau format: objet avec propriété "matches")
