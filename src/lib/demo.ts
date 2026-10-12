export function credencialesDemo(): { correo: string; clave: string } | null {
  const correo = process.env.KREDIAN_DEMO_EMAIL?.trim() ?? "";
  const clave = process.env.KREDIAN_DEMO_PASSWORD ?? "";
  if (!correo || !clave) return null;
  return { correo, clave };
}

export function isDemoConfigured(): boolean {
  return credencialesDemo() !== null;
}
