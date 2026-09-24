const XP_POR_NIVEL = 100;

export function calcularNivel(xp: number): number {
  return Math.floor(xp / XP_POR_NIVEL) + 1;
}

export function xpParaProximoNivel(xp: number): number {
  const nivelAtual = calcularNivel(xp);
  const xpNecessario = nivelAtual * XP_POR_NIVEL;
  return xpNecessario - xp;
}

export function calcularXpDaNota(rewardXp: number, nota: number): number {
  return Math.round(rewardXp * (nota / 5));
}

// calcula o XP a ganhar considerando a melhor nota anterior (só premia melhoria)
export function calcularXpDaMelhoria(rewardXp: number, notaNova: number, melhorNotaAnterior: number): number {
  const xpNota = calcularXpDaNota(rewardXp, notaNova);
  const xpAnterior = calcularXpDaNota(rewardXp, melhorNotaAnterior);
  const diferenca = xpNota - xpAnterior;
  return diferenca > 0 ? diferenca : 0;
}