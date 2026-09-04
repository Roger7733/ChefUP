export function calcularStreak(streakAtual: number, lastAccess: string): number {
  const hoje = new Date();
  const ultimoAcesso = new Date(lastAccess);

  const hojeSemHora = new Date(
    hoje.getFullYear(),
    hoje.getMonth(),
    hoje.getDate()
  );
  const ultimoSemHora = new Date(
    ultimoAcesso.getFullYear(),
    ultimoAcesso.getMonth(),
    ultimoAcesso.getDate()
  );

  const umDiaEmMs = 1000 * 60 * 60 * 24;
  const diferencaDias = Math.round(
    (hojeSemHora.getTime() - ultimoSemHora.getTime()) / umDiaEmMs
  );

  if (diferencaDias === 0) {
    return streakAtual;
  } else if (diferencaDias === 1) {
    return streakAtual + 1;
  } else {
    return 1;
  }
}