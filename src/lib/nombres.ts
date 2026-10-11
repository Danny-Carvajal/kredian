/** Compara nombres de perfil vs insignia: minúsculas, sin tildes, espacios colapsados. */
export function normalizarNombre(valor: string): string {
  return valor
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function nombresCoinciden(perfil: string, insignia: string): boolean {
  const a = normalizarNombre(perfil);
  const b = normalizarNombre(insignia);
  return a.length > 0 && a === b;
}
