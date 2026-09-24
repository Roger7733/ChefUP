import { User } from '@/models/User';
import { UserItem } from '@/models/UserItem';
import { registrarCompra } from '@/services/shopService';
import { salvarUsuario } from '@/services/userService';
import { calcularNivel } from '@/utils/levelSystem';
import { calcularStreak } from '@/utils/streakSystem';
import { create } from 'zustand';

type UserState = {
  id: string;
  name: string;
  email: string;
  coins: number;
  xp: number;
  level: number;
  streak: number;
  lastAccess: string;
  character: 'mulher' | 'homem';
  outfit: 'normal' | 'premium';
  addCoins: (amount: number) => void;
  addXp: (amount: number) => void;
  setUsuario: (usuario: User) => void;
  completarFase: (rewardXp: number) => Promise<void>;
  registrarAcesso: () => Promise<void>;
  comprarItem: (itemId: string, preco: number) => Promise<boolean>;
  mudarAparencia: (character: 'mulher' | 'homem', outfit: 'normal' | 'premium') => Promise<void>;
};

export const useUserStore = create<UserState>((set, get) => ({
  id: '',
  name: '',
  email: '',
  coins: 0,
  xp: 0,
  level: 1,
  streak: 0,
  lastAccess: '',
  character: 'mulher',
  outfit: 'normal',

  addCoins: (amount) =>
    set((state) => ({ coins: state.coins + amount })),

  addXp: (amount) =>
    set((state) => ({ xp: state.xp + amount })),

  setUsuario: (usuario) =>
    set({
      id: usuario.id,
      name: usuario.name,
      email: usuario.email,
      coins: usuario.coins,
      xp: usuario.xp,
      level: usuario.level,
      streak: usuario.streak,
      lastAccess: usuario.lastAccess,
      character: usuario.character || 'mulher',
      outfit: usuario.outfit || 'normal',
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
      email: estado.email,
      coins: novasMoedas,
      xp: novoXp,
      level: novoNivel,
      streak: estado.streak,
      lastAccess: estado.lastAccess,
      character: estado.character,
      outfit: estado.outfit,
    };

    await salvarUsuario(usuarioAtualizado);
  },

  registrarAcesso: async () => {
    const estado = get();

    const novoStreak = calcularStreak(estado.streak, estado.lastAccess);
    const hoje = new Date().toISOString();

    set({ streak: novoStreak, lastAccess: hoje });

    const usuarioAtualizado: User = {
      id: estado.id,
      name: estado.name,
      email: estado.email,
      coins: estado.coins,
      xp: estado.xp,
      level: estado.level,
      streak: novoStreak,
      lastAccess: hoje,
      character: estado.character,
      outfit: estado.outfit,
    };

    await salvarUsuario(usuarioAtualizado);
  },

  comprarItem: async (itemId, preco) => {
    const estado = get();

    if (estado.coins < preco) {
      return false;
    }

    const novasMoedas = estado.coins - preco;
    set({ coins: novasMoedas });

    const usuarioAtualizado: User = {
      id: estado.id,
      name: estado.name,
      email: estado.email,
      coins: novasMoedas,
      xp: estado.xp,
      level: estado.level,
      streak: estado.streak,
      lastAccess: estado.lastAccess,
      character: estado.character,
      outfit: estado.outfit,
    };
    await salvarUsuario(usuarioAtualizado);

    const novoUserItem: UserItem = {
      id: `${estado.id}_${itemId}`,
      userId: estado.id,
      itemId: itemId,
      equipped: false,
    };
    await registrarCompra(novoUserItem);

    return true;
  },

  mudarAparencia: async (character, outfit) => {
    const estado = get();

    set({ character, outfit });

    const usuarioAtualizado: User = {
      id: estado.id,
      name: estado.name,
      email: estado.email,
      coins: estado.coins,
      xp: estado.xp,
      level: estado.level,
      streak: estado.streak,
      lastAccess: estado.lastAccess,
      character: character,
      outfit: outfit,
    };

    await salvarUsuario(usuarioAtualizado);
  },
}));