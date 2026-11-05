import { User } from '@/models/User';
import { UserItem } from '@/models/UserItem';
import { registrarCompra } from '@/services/shopService';
import { salvarUsuario } from '@/services/userService';
import { calcularNivel } from '@/utils/levelSystem';
import { calcularStreakComProtetor, ResultadoStreak } from '@/utils/streakSystem';
import { create } from 'zustand';

type Chapeu = 'nenhum' | 'toque' | 'boina' | 'bandana';

type UserState = {
  id: string;
  name: string;
  email: string;
  username: string;
  coins: number;
  xp: number;
  level: number;
  streak: number;
  lastAccess: string;
  character: 'mulher' | 'homem';
  outfit: 'normal' | 'premium';
  equippedHat: Chapeu;
  avatarColor: string;
  equippedApron: string;
  streakShields: number;
  addCoins: (amount: number) => void;
  addXp: (amount: number) => void;
  setUsuario: (usuario: User) => void;
  completarFase: (rewardXp: number) => Promise<void>;
  registrarAcesso: () => Promise<ResultadoStreak>;
  comprarItem: (itemId: string, preco: number) => Promise<boolean>;
  comprarProtetor: (preco: number) => Promise<boolean>;
  mudarAparencia: (character: 'mulher' | 'homem', outfit: 'normal' | 'premium') => Promise<void>;
  equiparChapeu: (hat: Chapeu) => Promise<void>;
  escolherCor: (cor: string) => Promise<void>;
  equiparAvental: (apron: string) => Promise<void>;
};

export const useUserStore = create<UserState>((set, get) => ({
  id: '',
  name: '',
  email: '',
  username: '',
  coins: 0,
  xp: 0,
  level: 1,
  streak: 0,
  lastAccess: '',
  character: 'mulher',
  outfit: 'normal',
  equippedHat: 'toque',
  avatarColor: '#C0392B',
  equippedApron: 'nenhum',
  streakShields: 0,

  addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),

  addXp: (amount) => set((state) => ({ xp: state.xp + amount })),

  setUsuario: (usuario) =>
    set({
      id: usuario.id,
      name: usuario.name,
      email: usuario.email,
      username: usuario.username || '',
      coins: usuario.coins,
      xp: usuario.xp,
      level: usuario.level,
      streak: usuario.streak,
      lastAccess: usuario.lastAccess,
      character: usuario.character || 'mulher',
      outfit: usuario.outfit || 'normal',
      equippedHat: usuario.equippedHat || 'toque',
      avatarColor: usuario.avatarColor || '#C0392B',
      equippedApron: usuario.equippedApron || 'nenhum',
      streakShields: usuario.streakShields || 0,
    }),

  completarFase: async (rewardXp) => {
    const estado = get();
    const novoXp = estado.xp + rewardXp;
    const novasMoedas = estado.coins + 10;
    const novoNivel = calcularNivel(novoXp);
    set({ xp: novoXp, coins: novasMoedas, level: novoNivel });

    const usuarioAtualizado: User = {
      id: estado.id, name: estado.name, email: estado.email, username: estado.username,
      coins: novasMoedas, xp: novoXp, level: novoNivel,
      streak: estado.streak, lastAccess: estado.lastAccess,
      character: estado.character, outfit: estado.outfit,
      equippedHat: estado.equippedHat, avatarColor: estado.avatarColor,
      equippedApron: estado.equippedApron, streakShields: estado.streakShields,
    };
    await salvarUsuario(usuarioAtualizado);
  },

  registrarAcesso: async () => {
    const estado = get();
    const resultado = calcularStreakComProtetor(estado.streak, estado.lastAccess, estado.streakShields);
    const hoje = new Date().toISOString();
    set({ streak: resultado.novoStreak, streakShields: resultado.protetoresRestantes, lastAccess: hoje });

    const usuarioAtualizado: User = {
      id: estado.id, name: estado.name, email: estado.email, username: estado.username,
      coins: estado.coins, xp: estado.xp, level: estado.level,
      streak: resultado.novoStreak, lastAccess: hoje,
      character: estado.character, outfit: estado.outfit,
      equippedHat: estado.equippedHat, avatarColor: estado.avatarColor,
      equippedApron: estado.equippedApron, streakShields: resultado.protetoresRestantes,
    };
    await salvarUsuario(usuarioAtualizado);
    return resultado;
  },

  comprarItem: async (itemId, preco) => {
    const estado = get();
    if (estado.coins < preco) return false;

    const novasMoedas = estado.coins - preco;
    set({ coins: novasMoedas });

    const usuarioAtualizado: User = {
      id: estado.id, name: estado.name, email: estado.email, username: estado.username,
      coins: novasMoedas, xp: estado.xp, level: estado.level,
      streak: estado.streak, lastAccess: estado.lastAccess,
      character: estado.character, outfit: estado.outfit,
      equippedHat: estado.equippedHat, avatarColor: estado.avatarColor,
      equippedApron: estado.equippedApron, streakShields: estado.streakShields,
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

  comprarProtetor: async (preco) => {
    const estado = get();
    if (estado.coins < preco) return false;

    const novasMoedas = estado.coins - preco;
    const novosShields = estado.streakShields + 1;
    set({ coins: novasMoedas, streakShields: novosShields });

    const usuarioAtualizado: User = {
      id: estado.id, name: estado.name, email: estado.email, username: estado.username,
      coins: novasMoedas, xp: estado.xp, level: estado.level,
      streak: estado.streak, lastAccess: estado.lastAccess,
      character: estado.character, outfit: estado.outfit,
      equippedHat: estado.equippedHat, avatarColor: estado.avatarColor,
      equippedApron: estado.equippedApron, streakShields: novosShields,
    };
    await salvarUsuario(usuarioAtualizado);
    return true;
  },

  mudarAparencia: async (character, outfit) => {
    const estado = get();
    set({ character, outfit });

    const usuarioAtualizado: User = {
      id: estado.id, name: estado.name, email: estado.email, username: estado.username,
      coins: estado.coins, xp: estado.xp, level: estado.level,
      streak: estado.streak, lastAccess: estado.lastAccess,
      character: character, outfit: outfit,
      equippedHat: estado.equippedHat, avatarColor: estado.avatarColor,
      equippedApron: estado.equippedApron, streakShields: estado.streakShields,
    };
    await salvarUsuario(usuarioAtualizado);
  },

  equiparChapeu: async (hat) => {
    const estado = get();
    set({ equippedHat: hat });

    const usuarioAtualizado: User = {
      id: estado.id, name: estado.name, email: estado.email, username: estado.username,
      coins: estado.coins, xp: estado.xp, level: estado.level,
      streak: estado.streak, lastAccess: estado.lastAccess,
      character: estado.character, outfit: estado.outfit,
      equippedHat: hat, avatarColor: estado.avatarColor,
      equippedApron: estado.equippedApron, streakShields: estado.streakShields,
    };
    await salvarUsuario(usuarioAtualizado);
  },

  escolherCor: async (cor) => {
    const estado = get();
    set({ avatarColor: cor });

    const usuarioAtualizado: User = {
      id: estado.id, name: estado.name, email: estado.email, username: estado.username,
      coins: estado.coins, xp: estado.xp, level: estado.level,
      streak: estado.streak, lastAccess: estado.lastAccess,
      character: estado.character, outfit: estado.outfit,
      equippedHat: estado.equippedHat, avatarColor: cor,
      equippedApron: estado.equippedApron, streakShields: estado.streakShields,
    };
    await salvarUsuario(usuarioAtualizado);
  },

  equiparAvental: async (apron) => {
    const estado = get();
    set({ equippedApron: apron });

    const usuarioAtualizado: User = {
      id: estado.id, name: estado.name, email: estado.email, username: estado.username,
      coins: estado.coins, xp: estado.xp, level: estado.level,
      streak: estado.streak, lastAccess: estado.lastAccess,
      character: estado.character, outfit: estado.outfit,
      equippedHat: estado.equippedHat, avatarColor: estado.avatarColor,
      equippedApron: apron, streakShields: estado.streakShields,
    };
    await salvarUsuario(usuarioAtualizado);
  },
}));