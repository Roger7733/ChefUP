const XP_POR_NIVEL = 100;

export function calcularNivel(xp: number): number {
  return Math.floor(xp / XP_POR_NIVEL) + 1;
}

export function xpParaProximoNivel(xp: number): number {
  const nivelAtual = calcularNivel(xp);
  const xpNecessario = nivelAtual * XP_POR_NIVEL;
  return xpNecessario - xp;
}