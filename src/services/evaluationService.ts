import { Evaluation } from '@/models/Evaluation';
import { db } from '@/services/firebase';
import { addDoc, collection, getDocs, orderBy, query, where } from 'firebase/firestore';

// 1. Salvar uma avaliação publicada no feed
export async function salvarAvaliacao(avaliacao: Omit<Evaluation, 'id'>): Promise<void> {
  await addDoc(collection(db, 'evaluations'), avaliacao);
}

// 2. Listar as avaliações de uma lista de usuários (os amigos + eu)
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