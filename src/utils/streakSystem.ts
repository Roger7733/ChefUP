export type ResultadoStreak = {
  novoStreak: number;
  protetoresRestantes: number;
  usouProtetor: boolean;
};

function diasDesde(lastAccess: string): number {
  const hoje = new Date();
  const ultimo = new Date(lastAccess);
  if (isNaN(ultimo.getTime())) return NaN;

  const hojeSemHora = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const ultimoSemHora = new Date(ultimo.getFullYear(), ultimo.getMonth(), ultimo.getDate());

  const umDiaEmMs = 1000 * 60 * 60 * 24;
  return Math.round((hojeSemHora.getTime() - ultimoSemHora.getTime()) / umDiaEmMs);
}

// mantida para compatibilidade (não usa protetor)
export function calcularStreak(streakAtual: number, lastAccess: string): number {
  const diferencaDias = diasDesde(lastAccess);
  if (isNaN(diferencaDias)) return streakAtual > 0 ? streakAtual : 1;
  if (diferencaDias <= 0) return streakAtual;
  if (diferencaDias === 1) return streakAtual + 1;
  return 1;
}

// nova: considera o protetor de streak
export function calcularStreakComProtetor(
  streakAtual: number,
  lastAccess: string,
  protetores: number
): ResultadoStreak {
  const diferencaDias = diasDesde(lastAccess);

  // primeiro acesso / data inválida: começa sem gastar protetor
  if (isNaN(diferencaDias)) {
    return { novoStreak: streakAtual > 0 ? streakAtual : 1, protetoresRestantes: protetores, usouProtetor: false };
  }
  // mesmo dia (ou relógio voltou): nada muda
  if (diferencaDias <= 0) {
    return { novoStreak: streakAtual, protetoresRestantes: protetores, usouProtetor: false };
  }
  // dia seguinte: streak continua normalmente
  if (diferencaDias === 1) {
    return { novoStreak: streakAtual + 1, protetoresRestantes: protetores, usouProtetor: false };
  }
  // perdeu um ou mais dias: usa 1 protetor se tiver
  if (protetores > 0) {
    return { novoStreak: streakAtual + 1, protetoresRestantes: protetores - 1, usouProtetor: true };
  }
  // sem protetor: recomeça em 1
  return { novoStreak: 1, protetoresRestantes: 0, usouProtetor: false };
}