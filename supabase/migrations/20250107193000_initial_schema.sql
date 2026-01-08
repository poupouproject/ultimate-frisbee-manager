-- =============================================================================
-- 1. CONFIGURATION INITIALE & ENUMS
-- =============================================================================
-- On s'assure que l'extension pour les UUID est active
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum pour le genre (permet d'ajouter d'autres catégories proprement plus tard)
CREATE TYPE gender_type AS ENUM ('M', 'F', 'X');

-- Enum pour l'état d'une session
CREATE TYPE session_status AS ENUM ('planned', 'active', 'completed');

-- =============================================================================
-- 2. CRÉATION DES TABLES
-- =============================================================================
-- TABLE : CLUBS
-- Le point d'entrée. Lié à l'utilisateur Supabase Auth via auth.users
CREATE TABLE clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW (),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW (),
        name TEXT NOT NULL,
        -- slug pour les URLs (ex: app.com/club/levis-ultimate)
        slug TEXT UNIQUE NOT NULL,
        -- Lien direct vers la table d'utilisateurs interne de Supabase
        owner_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE
);

-- TABLE : MEMBRES
-- Les joueurs appartenant à un club spécifique
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW (),
        club_id UUID NOT NULL REFERENCES clubs (id) ON DELETE CASCADE,
        full_name TEXT NOT NULL,
        gender gender_type DEFAULT 'M',
        -- Contraintes pour éviter les données farfelues (ex: vitesse 99)
        speed INT CHECK (speed BETWEEN 1 AND 10) DEFAULT 5,
        throwing INT CHECK (throwing BETWEEN 1 AND 10) DEFAULT 5,
        is_active BOOLEAN DEFAULT TRUE,
        notes TEXT
);

-- TABLE : SESSIONS (Entraînements/Matchs)
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW (),
        club_id UUID NOT NULL REFERENCES clubs (id) ON DELETE CASCADE,
        session_date TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW (),
        status session_status DEFAULT 'planned',
        -- Nombre d'équipes désirées pour cette soirée (2, 3, 4...)
        target_team_count INT DEFAULT 2,
        -- ID de l'équipe gagnante (pour les stats futures)
        winning_team_index INT
);

-- TABLE : PRÉSENCES (Attendance)
-- Table de liaison : Qui était là ? Dans quelle équipe ?
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    session_id UUID NOT NULL REFERENCES sessions (id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members (id) ON DELETE CASCADE,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW (),
        -- Équipe assignée par l'algo (0 = pas d'équipe, 1 = A, 2 = B, etc.)
        assigned_team_index INT,
        -- Pour s'assurer qu'un joueur n'est pas ajouté 2 fois à la même session
        UNIQUE (session_id, member_id)
);

-- =============================================================================
-- 3. SÉCURITÉ (ROW LEVEL SECURITY - RLS)
-- C'est ici que la magie du multi-tenant opère.
-- =============================================================================
-- Activer la sécurité sur toutes les tables
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

ALTER TABLE members ENABLE ROW LEVEL SECURITY;

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- --- POLITIQUES POUR 'CLUBS' ---
-- Un utilisateur ne peut voir et modifier que SON propre club
CREATE POLICY "Users can CRUD their own clubs" ON clubs USING (auth.uid () = owner_id);

-- --- POLITIQUES POUR 'MEMBERS' ---
-- On utilise une sous-requête pour vérifier si l'user possède le club du membre
CREATE POLICY "Users can CRUD members of their own clubs" ON members USING (
    EXISTS (
        SELECT
            1
        FROM
            clubs
        WHERE
            clubs.id = members.club_id
            AND clubs.owner_id = auth.uid ()
    )
);

-- --- POLITIQUES POUR 'SESSIONS' ---
CREATE POLICY "Users can CRUD sessions of their own clubs" ON sessions USING (
    EXISTS (
        SELECT
            1
        FROM
            clubs
        WHERE
            clubs.id = sessions.club_id
            AND clubs.owner_id = auth.uid ()
    )
);

-- --- POLITIQUES POUR 'ATTENDANCE' ---
-- Un peu plus complexe : on vérifie via la session liée
CREATE POLICY "Users can CRUD attendance of their own sessions" ON attendance USING (
    EXISTS (
        SELECT
            1
        FROM
            sessions
            JOIN clubs ON sessions.club_id = clubs.id
        WHERE
            sessions.id = attendance.session_id
            AND clubs.owner_id = auth.uid ()
    )
);

-- =============================================================================
-- 4. INDEX DE PERFORMANCE
-- =============================================================================
-- Index pour accélérer les recherches fréquentes (WHERE club_id = ...)
CREATE INDEX idx_members_club_id ON members (club_id);

CREATE INDEX idx_sessions_club_id ON sessions (club_id);

CREATE INDEX idx_attendance_session_id ON attendance (session_id);

CREATE INDEX idx_attendance_member_id ON attendance (member_id);