export type DadosConquista = {
  level: number;
  fasesConcluidas: number;
  fasesCincoEstrelas: number;
};

export type Conquista = {
  id: string;
  icone: string;
  titulo: string;
  descricao: string;
  meta: number;
  atual: (d: DadosConquista) => number;
};

export const CONQUISTAS: Conquista[] = [
  { id: 'primeira-fase', icone: '🍳', titulo: 'Primeiros passos', descricao: 'Conclua sua primeira fase', meta: 1, atual: (d) => d.fasesConcluidas },
  { id: 'tres-fases', icone: '🍝', titulo: 'Pegando o jeito', descricao: 'Conclua 3 fases', meta: 3, atual: (d) => d.fasesConcluidas },
  { id: 'mestre-italiano', icone: '🇮🇹', titulo: 'Mestre Italiano', descricao: 'Conclua as 7 fases italianas', meta: 7, atual: (d) => d.fasesConcluidas },
  { id: 'primeira-estrela', icone: '⭐', titulo: 'Caprichou', descricao: 'Tire 5 estrelas em uma fase', meta: 1, atual: (d) => d.fasesCincoEstrelas },
  { id: 'tres-estrelas', icone: '🌟', titulo: 'Perfeccionista', descricao: 'Tire 5 estrelas em 3 fases', meta: 3, atual: (d) => d.fasesCincoEstrelas },
  { id: 'nivel-5', icone: '🎓', titulo: 'Aprendiz', descricao: 'Alcance o nível 5', meta: 5, atual: (d) => d.level },
  { id: 'nivel-10', icone: '👨‍🍳', titulo: 'Cozinheiro', descricao: 'Alcance o nível 10', meta: 10, atual: (d) => d.level },
];