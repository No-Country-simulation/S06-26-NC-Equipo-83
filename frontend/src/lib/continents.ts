/** Opciones de continente con código de 2 letras y nombre legible.
 *
 * Códigos:
 *   AM = América (Norte + Sur)
 *   EU = Europa
 *   AF = África
 *   AS = Asia
 *   OC = Oceanía
 *
 * Estos códigos se persisten en la DB como continent_code (max 2 chars).
 */

export interface ContinentOption {
  code: string;
  name: string;
  labelKey: string;
}

export const CONTINENTS: ContinentOption[] = [
  { code: "AM", name: "América", labelKey: "auth:data.continents.AM" },
  { code: "EU", name: "Europa", labelKey: "auth:data.continents.EU" },
  { code: "AF", name: "África", labelKey: "auth:data.continents.AF" },
  { code: "AS", name: "Asia", labelKey: "auth:data.continents.AS" },
  { code: "OC", name: "Oceanía", labelKey: "auth:data.continents.OC" },
];
