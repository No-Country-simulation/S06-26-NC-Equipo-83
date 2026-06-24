/**
 * Extrae un mensaje de error legible de una respuesta de FastAPI.
 *
 * FastAPI puede devolver `detail` como string (errores 401, 404, 409, 500)
 * o como array de objetos (errores 422 de validación).
 *
 * Ejemplo 422:
 *   {"detail": [{"loc": ["body","email"], "msg": "invalid email", "type": "..."}]}
 *   → "email: invalid email"
 */
export function extractErrorMessage(err: any): string {
  const detail = err?.response?.data?.detail;
  if (!detail) return "Error inesperado. Intentá de nuevo.";

  // FastAPI 422: detail es un array de objetos con loc y msg
  if (Array.isArray(detail)) {
    return detail
      .map((d: any) => {
        const field = d.loc?.slice(1).join(".") || "campo";
        return `${field}: ${d.msg}`;
      })
      .join(". ");
  }

  // FastAPI otros errores: detail es un string
  return String(detail);
}
