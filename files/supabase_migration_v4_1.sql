-- ═══════════════════════════════════════════════════════════════════
-- RÉGATES ORGANIZER V4.1 — Migration synchronisation complète
-- Projet : nqfrxqaryevpbqxoolqs
-- ═══════════════════════════════════════════════════════════════════
-- ⚠️ Ce script SUPPRIME et RECRÉE les 4 tables pour garantir que
-- les colonnes correspondent exactement à l'application V4.1.
-- Les données de test existantes seront effacées (les régates de
-- démonstration devront être recréées — c'est voulu).
--
-- À exécuter dans : SQL Editor → New query → coller → Run
-- ═══════════════════════════════════════════════════════════════════

-- 1. Nettoyage
DROP VIEW  IF EXISTS regatta_progress;
DROP TABLE IF EXISTS tasks       CASCADE;
DROP TABLE IF EXISTS volunteers  CASCADE;
DROP TABLE IF EXISTS admin_docs  CASCADE;
DROP TABLE IF EXISTS regattas    CASCADE;

-- 2. Table regattas
CREATE TABLE regattas (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  date            DATE,
  grade           TEXT DEFAULT '5B',
  location        TEXT DEFAULT '',
  expected_participants INTEGER DEFAULT 50,
  vhf1            TEXT DEFAULT '69',
  vhf2            TEXT DEFAULT '72',
  supports        JSONB DEFAULT '[]'::jsonb,
  share_code      TEXT UNIQUE NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_regattas_share_code ON regattas (share_code);

-- 3. Table tasks
CREATE TABLE tasks (
  id              TEXT PRIMARY KEY,
  regatta_id      TEXT NOT NULL REFERENCES regattas(id) ON DELETE CASCADE,
  category        TEXT DEFAULT 'admin',
  title           TEXT NOT NULL,
  description     TEXT DEFAULT '',
  days_before_event INTEGER DEFAULT 30,
  required        BOOLEAN DEFAULT false,
  done            BOOLEAN DEFAULT false,
  assignee        TEXT DEFAULT '',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_tasks_regatta ON tasks (regatta_id);

-- 4. Table volunteers
CREATE TABLE volunteers (
  id              TEXT PRIMARY KEY,
  regatta_id      TEXT NOT NULL REFERENCES regattas(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  first_name      TEXT DEFAULT '',
  email           TEXT DEFAULT '',
  phone           TEXT DEFAULT '',
  role            TEXT DEFAULT '',
  permis_bateau   BOOLEAN DEFAULT false,
  panier_repas    TEXT DEFAULT 'oui',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_volunteers_regatta ON volunteers (regatta_id);

-- 5. Table admin_docs
CREATE TABLE admin_docs (
  id              TEXT PRIMARY KEY,
  regatta_id      TEXT NOT NULL REFERENCES regattas(id) ON DELETE CASCADE,
  doc_type        TEXT NOT NULL,
  name            TEXT NOT NULL,
  status          TEXT DEFAULT 'pending',
  deadline_days   INTEGER DEFAULT 60,
  required        BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_admin_docs_regatta ON admin_docs (regatta_id);

-- 6. Trigger updated_at automatique
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON regattas   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON tasks      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON volunteers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON admin_docs FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 7. RLS : accès public complet (l'app utilise la clé anon)
ALTER TABLE regattas   ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks      ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_docs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "acces_total_regattas"   ON regattas   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acces_total_tasks"      ON tasks      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acces_total_volunteers" ON volunteers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acces_total_admin_docs" ON admin_docs FOR ALL USING (true) WITH CHECK (true);

-- 8. Realtime (sans erreur si déjà activé)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE regattas;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE volunteers;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE admin_docs;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ═══════════════════════════════════════════════════════════════════
-- FIN — Après exécution : recréez une régate dans l'application.
-- ═══════════════════════════════════════════════════════════════════
