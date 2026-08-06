import { create } from 'zustand';

type UserState = {
  coins: number;
  xp: number;
  level: number;
  addCoins: (amount: number) => void;
  addXp: (amount: number) => void;
};

export const useUserStore = create<UserState>((set) => ({
  coins: 0,
  xp: 0,
  level: 1,

  addCoins: (amount) =>
    set((state) => ({ coins: state.coins + amount })),

  addXp: (amount) =>
    set((state) => ({ xp: state.xp + amount })),
}));