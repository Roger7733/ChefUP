export interface Item {
    id: string;
    name: string;
    category: string;
    price: number;
    minLevel: number;
    avatarHat: 'nenhum' | 'toque' | 'boina' | 'bandana';
}