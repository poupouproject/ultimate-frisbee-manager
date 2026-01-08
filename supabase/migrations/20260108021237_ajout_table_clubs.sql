-- 1. Création de la table 'clubs'
CREATE TABLE IF NOT EXISTS clubs (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW (),
    name TEXT NOT NULL,
    owner_id UUID REFERENCES auth.users NOT NULL DEFAULT auth.uid ()
);

-- 2. Sécurité (RLS) pour la table 'clubs'
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

-- Politique : Je peux voir mon propre club
CREATE POLICY "Users can view own club" ON clubs FOR
SELECT
    USING (auth.uid () = owner_id);

-- Politique : Je peux créer un club (pour moi-même)
CREATE POLICY "Users can insert own club" ON clubs FOR INSERT
WITH
    CHECK (auth.uid () = owner_id);

-- 3. Modification de la table 'members' pour ajouter le lien vers le club
-- On ajoute la colonne club_id
ALTER TABLE members
ADD COLUMN IF NOT EXISTS club_id UUID REFERENCES clubs (id);

-- 4. Mise à jour de la sécurité des membres
-- On supprime les anciennes règles qui étaient trop simples
DROP POLICY IF EXISTS "Users can view own members" ON members;

DROP POLICY IF EXISTS "Users can insert own members" ON members;

DROP POLICY IF EXISTS "Users can update own members" ON members;

DROP POLICY IF EXISTS "Users can delete own members" ON members;

-- On crée les nouvelles règles basées sur l'appartenance au club
-- "Je peux voir les membres SI je suis le propriétaire du club auquel ils appartiennent"
CREATE POLICY "Users can view club members" ON members FOR
SELECT
    USING (
        EXISTS (
            SELECT
                1
            FROM
                clubs
            WHERE
                id = members.club_id
                AND owner_id = auth.uid ()
        )
    );

CREATE POLICY "Users can insert club members" ON members FOR INSERT
WITH
    CHECK (
        EXISTS (
            SELECT
                1
            FROM
                clubs
            WHERE
                id = club_id
                AND owner_id = auth.uid ()
        )
    );

CREATE POLICY "Users can update club members" ON members FOR
UPDATE USING (
    EXISTS (
        SELECT
            1
        FROM
            clubs
        WHERE
            id = club_id
            AND owner_id = auth.uid ()
    )
);

CREATE POLICY "Users can delete club members" ON members FOR DELETE USING (
    EXISTS (
        SELECT
            1
        FROM
            clubs
        WHERE
            id = club_id
            AND owner_id = auth.uid ()
    )
);