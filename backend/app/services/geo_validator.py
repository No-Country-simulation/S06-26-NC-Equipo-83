"""Validador de coherencia geográfica usando pycountry (ISO 3166-1 / 3166-2).

Verifica:
1. continent_code  — pertenece al conjunto {AM, EU, AF, AS, OC}.
2. country_code    — existe en ISO 3166-1 (pycountry.countries).
3. state_code      — existe en ISO 3166-2 y pertenece al país declarado.

Nota MVP (2025-06-25):
  city_name NO se valida en backend porque pycountry no incluye catálogo
  de ciudades. El frontend obtiene ciudades desde country-state-city con
  dropdown restringido por estado. La validación server-side de ciudad
  queda pendiente para v2 (requiere integrar una fuente de datos geográfica).

  La coherencia continente↔país tampoco se valida estrictamente aquí
  porque pycountry no expone un atributo 'continent' confiable entre
  versiones. El frontend restringe países por región desde country-state-city
  y el riesgo es solo de etiquetado incorrecto, no de integridad de datos.
"""

import pycountry


VALID_CONTINENT_CODES = frozenset({"AM", "EU", "AF", "AS", "OC"})


class GeographicValidationError(ValueError):
    """Error semántico de validación geográfica cruzada."""


def validate_geographic_consistency(
    continent_code: str,
    country_code: str,
    state_code: str,
) -> None:
    """Valida que país y estado sean coherentes según ISO 3166-1 / 3166-2.

    Lanza GeographicValidationError con mensaje descriptivo si falla.
    No retorna nada si la validación es exitosa.

    Args:
        continent_code: Código de 2 letras (AM, EU, AF, AS, OC).
        country_code:   ISO 3166-1 alpha-2 (ej: 'AR').
        state_code:     ISO 3166-2 subdivision code (ej: 'B' para Buenos Aires).

    Raises:
        GeographicValidationError: Si algún dato no pasa la validación ISO.
    """
    if continent_code.upper() not in VALID_CONTINENT_CODES:
        raise GeographicValidationError(
            f"Código de continente inválido: '{continent_code}'. "
            f"Códigos aceptados: {sorted(VALID_CONTINENT_CODES)}."
        )

    country = pycountry.countries.get(alpha_2=country_code.upper())
    if country is None:
        raise GeographicValidationError(
            f"El código de país '{country_code}' no existe en ISO 3166-1."
        )

    subdivision_code = f"{country_code.upper()}-{state_code.upper()}"
    subdivision = pycountry.subdivisions.get(code=subdivision_code)

    if subdivision is None:
        raise GeographicValidationError(
            f"El código de estado/provincia '{state_code}' no pertenece al país "
            f"'{country.name}' ({country_code}) según ISO 3166-2."
        )
