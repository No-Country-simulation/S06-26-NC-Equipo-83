/**
 * split-cities.mjs — Genera JSONs de ciudades por país desde GeoNames.
 *
 * Uso: node scripts/split-cities.mjs
 *
 * Input:
 *   scripts/allCountries.txt       — GeoNames complete places dataset
 *   scripts/admin1CodesASCII.txt — GeoNames admin1 code → name mapping
 *
 * Output:
 *   public/data/cities/cities-{ISO}.json  — Array<{ name: string, stateCode: string }>
 *
 * El script genera SOLO para los países target del proyecto:
 * App BiT → "alcance en Brasil, Angola y LATAM" (docs/Descripción General.md)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { State } from "country-state-city";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CITIES_SRC = path.join(ROOT, "scripts", "allCountries.txt");
const ADMIN1_SRC = path.join(ROOT, "scripts", "admin1CodesASCII.txt");
const OUT_DIR = path.join(ROOT, "public", "data", "cities");

// ── Países target ────────────────────────────────────────────────────────
// LATAM (hispano) + Brasil + Angola

const TARGET_COUNTRIES = new Set([
  "AR", "BO", "BR", "CL", "CO", "CR", "CU", "DO", "EC", "SV",
  "GT", "HN", "MX", "NI", "PA", "PY", "PE", "UY", "VE", // LATAM + BR
  "AO", // Angola
]);

// ── Overrides manuales de mapeo de nombres ────────────────────────────────
// Formato: "COUNTRY_CODE|admin1_name" → "isoCode"

const NAME_OVERRIDES = {
  // Argentina: GeoNames usa nombres sin acentos; CABA tiene nombre distinto
  "AR|Cordoba": "X",
  "AR|Entre Rios": "E",
  "AR|Neuquen": "Q",
  "AR|Rio Negro": "R",
  "AR|Tucuman": "T",
  "AR|Buenos Aires F.D.": "C", // CABA

  // Brasil: emparejar por nombre normalizado
  "BR|Acre": "AC",
  "BR|Alagoas": "AL",
  "BR|Amapa": "AP",
  "BR|Amazonas": "AM",
  "BR|Bahia": "BA",
  "BR|Ceara": "CE",
  "BR|Distrito Federal": "DF",
  "BR|Espirito Santo": "ES",
  "BR|Goias": "GO",
  "BR|Maranhao": "MA",
  "BR|Mato Grosso": "MT",
  "BR|Mato Grosso do Sul": "MS",
  "BR|Minas Gerais": "MG",
  "BR|Para": "PA",
  "BR|Paraiba": "PB",
  "BR|Parana": "PR",
  "BR|Pernambuco": "PE",
  "BR|Piaui": "PI",
  "BR|Rio de Janeiro": "RJ",
  "BR|Rio Grande do Norte": "RN",
  "BR|Rio Grande do Sul": "RS",
  "BR|Rondonia": "RO",
  "BR|Roraima": "RR",
  "BR|Santa Catarina": "SC",
  "BR|Sao Paulo": "SP",
  "BR|Sergipe": "SE",
  "BR|Tocantins": "TO",

  // Angola
  "AO|Bengo": "BGO",
  "AO|Benguela": "BGU",
  "AO|Bie": "BIE",
  "AO|Cabinda": "CAB",
  "AO|Cuando Cubango": "CCU",
  "AO|Cuanza Norte": "CNO",
  "AO|Kwanza Sul": "CUS",
  "AO|Cunene": "CNN",
  "AO|Huambo": "HUA",
  "AO|Huila": "HUI",
  "AO|Luanda": "LUA",
  "AO|Lunda Norte": "LNO",
  "AO|Lunda Sul": "LSU",
  "AO|Malanje": "MAL",
  "AO|Moxico": "MOX",
  "AO|Uige": "UIG",
  "AO|Zaire": "ZAI",

  // Brasil — federal district
  "BR|Federal District": "DF",

  // Chile
  "CL|Santiago Metropolitan": "RM",
  "CL|Region of Magallanes": "MA",
  "CL|Aysén": "AI",
  "CL|O'Higgins Region": "LI",

  // México
  "MX|Mexico City": "CMX",
  "MX|Aguascalientes": "AGU",
  "MX|Baja California": "BCN",
  "MX|Baja California Sur": "BCS",
  "MX|Campeche": "CAM",
  "MX|Chiapas": "CHP",
  "MX|Chihuahua": "CHH",
  "MX|Ciudad de Mexico": "CMX",
  "MX|Coahuila": "COA",
  "MX|Colima": "COL",
  "MX|Durango": "DUR",
  "MX|Guanajuato": "GUA",
  "MX|Guerrero": "GRO",
  "MX|Hidalgo": "HID",
  "MX|Jalisco": "JAL",
  "MX|Mexico": "MEX",
  "MX|Michoacan": "MIC",
  "MX|Morelos": "MOR",
  "MX|Nayarit": "NAY",
  "MX|Nuevo Leon": "NLE",
  "MX|Oaxaca": "OAX",
  "MX|Puebla": "PUE",
  "MX|Queretaro": "QUE",
  "MX|Quintana Roo": "ROO",
  "MX|San Luis Potosi": "SLP",
  "MX|Sinaloa": "SIN",
  "MX|Sonora": "SON",
  "MX|Tabasco": "TAB",
  "MX|Tamaulipas": "TAM",
  "MX|Tlaxcala": "TLA",
  "MX|Veracruz": "VER",
  "MX|Yucatan": "YUC",
  "MX|Zacatecas": "ZAC",

  // Colombia
  "CO|San Andres y Providencia": "SAP",

  // Costa Rica
  "CR|Cartago Province": "C",

  // República Dominicana
  "DO|Elias Pina": "11",
  "DO|Elías Piña": "11",

  // Guatemala
  "GT|Zacapa": "ZA",

  // Panamá
  "PA|Naso Tjër Di": "NT",

  // Paraguay
  "PY|Asuncion": "ASU",

  // Perú
  "PE|Cuzco Department": "CUS",

  // Venezuela
  "VE|Dependencias Federales": "W",
  "VE|Distrito Federal": "A",
  "VE|Vargas": "X",

  // Angola — nombres alternativos
  "AO|Luanda Norte": "LNO",
  "AO|Namibe": "NAM",
  "AO|Moxico Leste Province": "MOX",
  "AO|Cuando Province": "CCU",
};

import readline from "node:readline";

// ── Helpers ────────────────────────────────────────────────────────────────

/** Eliminar acentos y pasar a minúsculas para comparación insensible. */
function normalize(s) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Sanitizar nombre de ciudad: capitalizar y limpiar. */
function sanitizeCityName(name) {
  return name
    .replace(/\s+/g, " ")
    .trim();
}

// ── Main ───────────────────────────────────────────────────────────────────

console.log("🔨 split-cities — generando JSONs de ciudades por país\n");

// 1. Leer admin1CodesASCII.txt → { "COUNTRY.admin1": "name" }
console.log("  Leyendo admin1CodesASCII.txt...");
const admin1Name = {};
for (const line of fs.readFileSync(ADMIN1_SRC, "utf8").split("\n")) {
  const m = line.match(/^([A-Z]{2})\.(\S+)\t(.+?)\t/);
  if (!m) continue;
  const [, country, code, name] = m;
  if (TARGET_COUNTRIES.has(country)) {
    admin1Name[`${country}|${code}`] = name;
  }
}

// 2. Construir mapping: admin1_code → ISO code por país
console.log("  Construyendo mapping admin1 → ISO...");
const admin1ToISO = {}; // "COUNTRY|admin1" → "isoCode"

for (const country of TARGET_COUNTRIES) {
  const states = State.getStatesOfCountry(country);
  if (!states.length) {
    console.log(`  ⚠ Sin estados en country-state-city para ${country}`);
    continue;
  }

  // Índice: name normalizado → isoCode desde country-state-city
  const nameToISO = {};
  for (const st of states) {
    nameToISO[normalize(st.name)] = st.isoCode;
  }

  // Para cada admin1 de GeoNames de este país, buscar match
  let matched = 0;
  for (const [key, geoName] of Object.entries(admin1Name)) {
    const [cc, code] = key.split("|");
    if (cc !== country) continue;

    // 1) Override manual
    const overrideKey = `${country}|${geoName}`;
    if (NAME_OVERRIDES[overrideKey]) {
      admin1ToISO[key] = NAME_OVERRIDES[overrideKey];
      matched++;
      continue;
    }

    // 2) Match exacto normalizado
    const normGeo = normalize(geoName);
    if (nameToISO[normGeo]) {
      admin1ToISO[key] = nameToISO[normGeo];
      matched++;
      continue;
    }

    // 3) Match parcial (el nombre de country-state-city contiene el de GeoNames o viceversa)
    let found = null;
    for (const [cscName, iso] of Object.entries(nameToISO)) {
      if (cscName.includes(normGeo) || normGeo.includes(cscName)) {
        found = iso;
        break;
      }
    }
    if (found) {
      admin1ToISO[key] = found;
      matched++;
    } else {
      console.log(`  ⚠ ${country}: sin match para admin1=${code} "${geoName}"`);
    }
  }
  console.log(`  ${country}: ${matched}/${Object.keys(admin1Name).filter(k=>k.startsWith(country+'|')).length} admin1 mapeados`);
}

// 3. Procesar allCountries.txt por streaming y agrupar por país
console.log("\n  Procesando allCountries.txt (streaming)...");
const byCountry = {}; // country → [{ name, stateCode }]

let totalCities = 0;
let linesRead = 0;
const input = fs.createReadStream(CITIES_SRC, "utf8");
const rl = readline.createInterface({ input, crlfDelay: Infinity });

for await (const line of rl) {
  linesRead++;
  if (!line.trim()) continue;
  const cols = line.split("\t");
  const countryCode = cols[8];
  if (!TARGET_COUNTRIES.has(countryCode)) continue;

  // Solo lugares poblados (P = populated place, excluye montañas, ríos, etc.)
  const featureClass = cols[6];
  if (featureClass !== "P") continue;

  const admin1 = cols[10];
  const rawName = cols[1];
  if (!admin1 || !rawName) continue;

  const mappingKey = `${countryCode}|${admin1}`;
  const stateCode = admin1ToISO[mappingKey];
  if (!stateCode) continue;

  if (!byCountry[countryCode]) byCountry[countryCode] = [];
  byCountry[countryCode].push({
    name: sanitizeCityName(rawName),
    stateCode,
  });
  totalCities++;

  // Progress cada 1M líneas
  if (linesRead % 1_000_000 === 0) {
    console.log(`    ${(linesRead / 1_000_000).toFixed(0)}M líneas, ${totalCities} ciudades encontradas...`);
  }
}
console.log(`    Total: ${(linesRead / 1_000_000).toFixed(1)}M líneas procesadas`);


// 4. Escribir JSONs
console.log(`\n  Total ciudades procesadas: ${totalCities}`);
fs.mkdirSync(OUT_DIR, { recursive: true });

for (const [country, cities] of Object.entries(byCountry)) {
  // Ordenar y deduplicar
  const seen = new Set();
  const unique = cities.filter((c) => {
    const key = `${c.name}|${c.stateCode}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  unique.sort((a, b) => a.name.localeCompare(b.name));

  const outPath = path.join(OUT_DIR, `cities-${country}.json`);
  fs.writeFileSync(outPath, JSON.stringify(unique), "utf8");
  const kb = (fs.statSync(outPath).size / 1024).toFixed(1);
  console.log(`  ✅ ${country}: ${unique.length} ciudades (${kb} KB)`);
}

console.log("\n✅ split-cities completado.");
