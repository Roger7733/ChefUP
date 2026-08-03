export interface Friendship {
    id: string;
    userId1: string;
    userId2: string;
    status: 'pending' | 'accepted';
}