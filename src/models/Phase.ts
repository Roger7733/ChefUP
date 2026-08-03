export interface Phase {
    id: string;
    worldId: string;
    name: string;
    type: 'recipe' | 'technique';
    difficulty: 'easy' | 'medium' | 'hard';
    rewardXp: number; 
}