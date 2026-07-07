function flattenErrors(obj: any, prefix = ""): string[] {
  if (!obj || typeof obj !== "object") return [];
  if (Array.isArray(obj)) {
    return obj.flatMap((item) => {
      if (typeof item === "object" && item.msg) {
        const field = item.loc?.slice(1).join(".") || "campo";
        return [`${field}: ${item.msg}`];
      }
      return flattenErrors(item, prefix);
    });
  }
  return Object.entries(obj).flatMap(([key, val]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof val === "string") {
      if (key === "detail" && !prefix) return [val];
      return [`${path}: ${val}`];
    }
    if (Array.isArray(val)) {
      if (key === "detail" && !prefix) {
        return val.map((item: any) =>
          item.msg
            ? `${item.loc?.slice(1).join(".") || "campo"}: ${item.msg}`
            : String(item),
        );
      }
      return val.flatMap((item) =>
        typeof item === "string" ? [`${path}: ${item}`] : flattenErrors(item, path),
      );
    }
    if (typeof val === "object" && val !== null) {
      return flattenErrors(val, path);
    }
    return [];
  });
}

export function extractErrorMessage(err: any): string {
  const data = err?.response?.data;
  if (!data) {
    if (err?.message) return String(err.message);
    return "Error inesperado. Intentá de nuevo.";
  }

  if (typeof data === "string") return data;

  const messages = flattenErrors(data);
  return messages.length > 0
    ? messages.join(". ")
    : "Error inesperado. Intentá de nuevo.";
}
