export interface User {
    id: string;
    name: string;
    email: string;
    username?: string;
    level: number;
    xp: number;
    coins: number;
    streak: number;
    lastAccess: string;
    character: 'mulher' | 'homem';
    outfit: 'normal' | 'premium';
    equippedHat?: 'nenhum' | 'toque' | 'boina' | 'bandana';
    avatarColor?: string;
    equippedApron?: string;
    streakShields?: number;
}