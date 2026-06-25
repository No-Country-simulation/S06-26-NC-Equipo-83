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
}

export const CONTINENTS: ContinentOption[] = [
  { code: "AM", name: "América" },
  { code: "EU", name: "Europa" },
  { code: "AF", name: "África" },
  { code: "AS", name: "Asia" },
  { code: "OC", name: "Oceanía" },
];
