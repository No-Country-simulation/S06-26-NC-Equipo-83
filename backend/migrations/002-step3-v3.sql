-- ============================================================================
-- Migración 002: Step 3 v3 — nuevos campos profesionales + bio + tecnologías
-- ============================================================================

BEGIN;

-- 1. Agregar columnas nuevas
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS current_situation  VARCHAR     NOT NULL DEFAULT 'student',
  ADD COLUMN IF NOT EXISTS work_sector        VARCHAR,
  ADD COLUMN IF NOT EXISTS seniority          VARCHAR,
  ADD COLUMN IF NOT EXISTS interest_areas     JSON        NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS current_search     VARCHAR,
  ADD COLUMN IF NOT EXISTS known_technologies JSON        NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS bio                VARCHAR(500);

-- 2. Vuelve nullable las columnas que el nuevo registro ya no envía
ALTER TABLE users ALTER COLUMN professional_level DROP NOT NULL;
ALTER TABLE users ALTER COLUMN tech_area          DROP NOT NULL;
ALTER TABLE users ALTER COLUMN career_objective   DROP NOT NULL;

COMMIT;