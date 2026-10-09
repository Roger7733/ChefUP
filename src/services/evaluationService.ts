import { Evaluation } from '@/models/Evaluation';
import { db } from '@/services/firebase';
import { addDoc, arrayRemove, arrayUnion, collection, doc, getDocs, limit, orderBy, query, updateDoc, where } from 'firebase/firestore';

// Salvar uma avaliação publicada no feed
export async function salvarAvaliacao(avaliacao: Omit<Evaluation, 'id'>): Promise<void> {
  await addDoc(collection(db, 'evaluations'), { ...avaliacao, likedBy: avaliacao.likedBy ?? [] });
}

// Avaliações de uma lista de usuários (amigos)
export async function listarAvaliacoesDe(userIds: string[]): Promise<Evaluation[]> {
  if (userIds.length === 0) return [];
  const q = query(
    collection(db, 'evaluations'),
    where('userId', 'in', userIds),
    orderBy('date', 'desc')
  );
  const snapshot = await getDocs(q);
  const avaliacoes: Evaluation[] = [];
  snapshot.forEach((d) => avaliacoes.push({ id: d.id, ...d.data() } as Evaluation));
  return avaliacoes;
}

// Minhas avaliações
export async function listarMinhasAvaliacoes(userId: string): Promise<Evaluation[]> {
  const q = query(
    collection(db, 'evaluations'),
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );
  const snapshot = await getDocs(q);
  const avaliacoes: Evaluation[] = [];
  snapshot.forEach((d) => avaliacoes.push({ id: d.id, ...d.data() } as Evaluation));
  return avaliacoes;
}

// Todas as avaliações (as 50 mais recentes)
export async function listarTodasAvaliacoes(): Promise<Evaluation[]> {
  const q = query(
    collection(db, 'evaluations'),
    orderBy('date', 'desc'),
    limit(50)
  );
  const snapshot = await getDocs(q);
  const avaliacoes: Evaluation[] = [];
  snapshot.forEach((d) => avaliacoes.push({ id: d.id, ...d.data() } as Evaluation));
  return avaliacoes;
}

// Curtir / descurtir uma avaliação
export async function alternarCurtida(evaluationId: string, userId: string, curtindo: boolean): Promise<void> {
  const ref = doc(db, 'evaluations', evaluationId);
  await updateDoc(ref, {
    likedBy: curtindo ? arrayUnion(userId) : arrayRemove(userId),
  });
}