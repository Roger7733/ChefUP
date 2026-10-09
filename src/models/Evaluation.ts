export interface Evaluation {
    id: string;
    userId: string;
    userName: string;
    phaseId: string;
    phaseName: string;
    stars: number;
    feedback: string;
    caption: string;
    photoUrl: string;
    date: string;
    likedBy?: string[];
    avatarHat?: string;
    avatarColor?: string;
}