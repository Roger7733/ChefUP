import { Progress } from '@/models/Progress';
import { db } from '@/services/firebase';
import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';

// busca o progresso de um usuário numa fase específica (ou null se nunca fez)
export async function buscarProgresso(userId: string, phaseId: string): Promise<Progress | null> {
  const id = `${userId}_${phaseId}`;
  const snapshot = await getDoc(doc(db, 'progress', id));
  if (snapshot.exists()) {
    return snapshot.data() as Progress;
  }
  return null;
}

// salva ou atualiza a melhor nota do usuário numa fase
export async function salvarProgresso(userId: string, phaseId: string, bestStars: number): Promise<void> {
  const id = `${userId}_${phaseId}`;
  const progresso: Progress = {
    id,
    userId,
    phaseId,
    bestStars,
    updatedAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'progress', id), progresso);
}

// lista todo o progresso do usuário (todas as fases que ele já fez)
export async function listarProgressoDoUsuario(userId: string): Promise<Progress[]> {
  const q = query(
    collection(db, 'progress'),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);

  const lista: Progress[] = [];
  snapshot.forEach((d) => lista.push(d.data() as Progress));
  return lista;
}