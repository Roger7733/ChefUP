export interface Comment {
    id: string;
    evaluationId: string;
    userId: string;
    userName: string;
    text: string;
    date: string;
    avatarColor?: string;
    avatarHat?: string;
}