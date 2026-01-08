-- 1. Table des SESSIONS
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID REFERENCES clubs(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  date TIMESTAMPTZ NOT NULL, -- Date et Heure de l'événement
  location TEXT,             -- Ex: Parc de la Rivière
  name TEXT,                 -- Ex: Match #3 ou Pratique
  notes TEXT
);

-- Sécurité Sessions
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage club sessions" ON sessions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM clubs WHERE id = sessions.club_id AND owner_id = auth.uid())
  );

-- 2. Table des PRÉSENCES (Attendances)
CREATE TABLE IF NOT EXISTS attendances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('present', 'absent', 'maybe', 'unknown')) DEFAULT 'unknown',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, member_id) -- Un membre ne peut avoir qu'un statut par session
);

-- Sécurité Présences
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage attendances" ON attendances
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM sessions 
      JOIN clubs ON sessions.club_id = clubs.id
      WHERE sessions.id = attendances.session_id AND clubs.owner_id = auth.uid()
    )
  );