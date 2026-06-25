-- ============================================================================
-- Migración 001: User schema v2
-- Branch: fix/login-register
--
-- Divide los campos geográficos genéricos en código ISO + nombre legible:
--   continent  → continent_code (VARCHAR(2)) + continent_name
--   country    → country_code (VARCHAR(2))   + country_name
--   state      → state_code                  + state_name
--   city       → city_name
--   whatsapp   → whatsapp_e164 (con validación E.164)
--
-- Nueva columna: language_code (VARCHAR(2), default 'es')
--
-- IMPORTANTE:
--   SQLModel usa CREATE TABLE IF NOT EXISTS y NO migra automáticamente.
--   Si la tabla users ya existe con el schema viejo, tenés que correr
--   esta migración manualmente antes de levantar el backend.
-- ============================================================================

-- ── Opción A: Borrar y recrear (rápido, sin datos reales) ─────────────────
-- Descomentá si estás en desarrollo y no tenés usuarios reales.
/*
DROP TABLE IF EXISTS users CASCADE;
-- Al reiniciar el backend, SQLModel crea la tabla con el schema nuevo.
*/


-- ── Opción B: Migración paso a paso (preserva datos) ──────────────────────

BEGIN;

-- 1. Agregar columnas nuevas (con valor por defecto para filas existentes)
ALTER TABLE users
  ADD COLUMN continent_code VARCHAR(2)   NOT NULL DEFAULT '',
  ADD COLUMN continent_name VARCHAR      NOT NULL DEFAULT '',
  ADD COLUMN country_code   VARCHAR(2)   NOT NULL DEFAULT '',
  ADD COLUMN country_name   VARCHAR      NOT NULL DEFAULT '',
  ADD COLUMN state_code     VARCHAR      NOT NULL DEFAULT '',
  ADD COLUMN state_name     VARCHAR      NOT NULL DEFAULT '',
  ADD COLUMN city_name      VARCHAR      NOT NULL DEFAULT '',
  ADD COLUMN whatsapp_e164  VARCHAR      NOT NULL DEFAULT '',
  ADD COLUMN language_code  VARCHAR(2)   NOT NULL DEFAULT 'es',
  ADD COLUMN career_objective VARCHAR;  -- solo si no existe (verificar)

-- 2. Migrar datos existentes de columnas viejas a nuevas
--    continent_code usa 'OT' (Otro) como fallback si no hay mapeo
UPDATE users SET
  continent_code  = COALESCE(
                      (SELECT code FROM (VALUES
                        ('América', 'AM'), ('Europa', 'EU'),
                        ('África', 'AF'), ('Asia', 'AS'),
                        ('Oceanía', 'OC')
                      ) AS cc(name, code)
                      WHERE cc.name = users.continent),
                      'OT'
                    ),
  continent_name  = continent,
  country_code    = 'OT',   -- sin mapping, requiere entrada manual
  country_name    = country,
  state_code      = 'OT',   -- sin mapping, requiere entrada manual
  state_name      = state,
  city_name       = city,
  whatsapp_e164   = COALESCE(NULLIF(whatsapp, ''), '+1234567890'),
  language_code   = 'es';

-- 3. Índices nuevos
CREATE INDEX IF NOT EXISTS ix_users_country_code ON users (country_code);
CREATE INDEX IF NOT EXISTS ix_users_city_name    ON users (city_name);

-- 4. Dropear columnas viejas
ALTER TABLE users
  DROP COLUMN IF EXISTS continent,
  DROP COLUMN IF EXISTS country,
  DROP COLUMN IF EXISTS state,
  DROP COLUMN IF EXISTS city,
  DROP COLUMN IF EXISTS whatsapp;

COMMIT;
