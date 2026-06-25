/**
 * Capa de datos geográficos: países y estados de country-state-city,
 * ciudades de GeoNames (pre-filtradas por país, carga lazy).
 *
 * Clasificación de continente:
 *   Como ICountry no expone `region`, derivamos el continente a partir
 *   del prefijo del primer timezone del país:
 *     America/*  →  AM (América)
 *     Europe/*   →  EU (Europa)
 *     Africa/*   →  AF (África)
 *     Asia/*     →  AS (Asia)
 *     Pacific/* o Australia/*  →  OC (Oceanía)
 */

import { Country, State } from "country-state-city";
import { CONTINENTS, type ContinentOption } from "./continents";

// Re-export para que otros módulos solo importen desde acá
export { CONTINENTS };
export type { ContinentOption };

// ── Tipos de opción para react-select ─────────────────────────────────────

export interface CountryOption {
  code: string;
  name: string;
}

export interface StateOption {
  code: string;
  name: string;
}

export interface CityOption {
  name: string;
}

// ── Derivación de continente desde timezone ───────────────────────────────

function deriveContinent(zoneName: string): string | null {
  if (!zoneName) return null;
  if (zoneName.startsWith("America/")) return "AM";
  if (zoneName.startsWith("Europe/")) return "EU";
  if (zoneName.startsWith("Africa/")) return "AF";
  if (zoneName.startsWith("Asia/")) return "AS";
  if (zoneName.startsWith("Pacific/") || zoneName.startsWith("Australia/")) return "OC";
  return null;
}

// ── Funciones de consulta: países y estados (síncronas) ──────────────────

/**
 * Devuelve los países que pertenecen a un continente, ordenados alfabéticamente.
 */
export function getCountriesByContinent(continentCode: string): CountryOption[] {
  const allCountries = Country.getAllCountries();
  return allCountries
    .filter((c) => {
      const tz = c.timezones?.[0];
      if (!tz) return false;
      return deriveContinent(tz.zoneName) === continentCode;
    })
    .map((c) => ({ code: c.isoCode, name: c.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Devuelve los estados/provincias de un país.
 */
export function getStatesByCountry(countryCode: string): StateOption[] {
  return State.getStatesOfCountry(countryCode).map((s) => ({
    code: s.isoCode,
    name: s.name,
  }));
}

// ── Ciudades: caché lazy-load desde GeoNames por país ────────────────────

interface GeoCity {
  name: string;
  stateCode: string;
}

/** Caché global: "COUNTRY-STATE" → CityOption[] */
const cityCache = new Map<string, CityOption[]>();

/**
 * Devuelve las ciudades de un estado dentro de un país.
 *
 * Carga asíncrona: la primera vez que se pide un país, se descarga
 * su archivo cities-{ISO}.json (generado por scripts/split-cities.mjs
 * desde GeoNames). Las ciudades se cachean por estado una vez cargadas.
 *
 * @param countryCode - ISO 3166-1 alpha-2 (ej: 'AR').
 * @param stateCode   - ISO 3166-2 subdivision code (ej: 'B').
 * @returns Promise con array de {name}.
 */
export async function getCitiesByState(
  countryCode: string,
  stateCode: string,
): Promise<CityOption[]> {
  const cacheKey = `${countryCode}-${stateCode}`;

  // Cache hit: ya cargamos este estado antes
  if (cityCache.has(cacheKey)) {
    return cityCache.get(cacheKey)!;
  }

  try {
    // fetch() desde public/ — Vite sirve los archivos estáticos directamente
    const response = await fetch(
      `/data/cities/cities-${countryCode}.json`,
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const cities: GeoCity[] = await response.json();

    // Indexar todas las ciudades del país por stateCode
    const byState = new Map<string, CityOption[]>();
    for (const c of cities) {
      const key = c.stateCode;
      if (!byState.has(key)) byState.set(key, []);
      byState.get(key)!.push({ name: c.name });
    }

    // Guardar todo en el caché global
    for (const [sc, opts] of byState) {
      cityCache.set(`${countryCode}-${sc}`, opts);
    }
  } catch {
    // País sin datos pre-generados → array vacío
    cityCache.set(cacheKey, []);
  }

  return cityCache.get(cacheKey) || [];
}
