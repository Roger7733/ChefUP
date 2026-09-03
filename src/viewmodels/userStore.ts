import { User } from '@/models/User';
import { salvarUsuario } from '@/services/userService';
import { calcularNivel } from '@/utils/levelSystem';
import { create } from 'zustand';

type UserState = {
  id: string;
  name: string;
  coins: number;
  xp: number;
  level: number;
  streak: number;
  lastAccess: string;
  addCoins: (amount: number) => void;
  addXp: (amount: number) => void;
  setUsuario: (usuario: User) => void;
  completarFase: (rewardXp: number) => Promise<void>;
};

export const useUserStore = create<UserState>((set, get) => ({
  id: '',
  name: '',
  coins: 0,
  xp: 0,
  level: 1,
  streak: 0,
  lastAccess: '',

  addCoins: (amount) =>
    set((state) => ({ coins: state.coins + amount })),

  addXp: (amount) =>
    set((state) => ({ xp: state.xp + amount })),

  setUsuario: (usuario) =>
    set({
      id: usuario.id,
      name: usuario.name,
      coins: usuario.coins,
      xp: usuario.xp,
      level: usuario.level,
      streak: usuario.streak,
      lastAccess: usuario.lastAccess,
    }),

  completarFase: async (rewardXp) => {
    const estado = get();

    const novoXp = estado.xp + rewardXp;
    const novasMoedas = estado.coins + 10;
    const novoNivel = calcularNivel(novoXp);

    set({ xp: novoXp, coins: novasMoedas, level: novoNivel });

    const usuarioAtualizado: User = {
      id: estado.id,
      name: estado.name,
      email: '',
      coins: novasMoedas,
      xp: novoXp,
      level: novoNivel,
      streak: estado.streak,
      lastAccess: new Date().toISOString(),
    };

    await salvarUsuario(usuarioAtualizado);
  },
}));