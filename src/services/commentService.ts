import { Comment } from '@/models/Comment';
import { db } from '@/services/firebase';
import { addDoc, collection, doc, getDocs, increment, query, updateDoc, where } from 'firebase/firestore';

export async function listarComentarios(evaluationId: string): Promise<Comment[]> {
  const q = query(collection(db, 'comments'), where('evaluationId', '==', evaluationId));
  const snapshot = await getDocs(q);
  const comentarios: Comment[] = [];
  snapshot.forEach((d) => comentarios.push({ id: d.id, ...d.data() } as Comment));
  return comentarios.sort((a, b) => a.date.localeCompare(b.date));
}

export async function adicionarComentario(comentario: Omit<Comment, 'id'>): Promise<Comment> {
  const ref = await addDoc(collection(db, 'comments'), comentario);
  // soma 1 no contador do post (best-effort — não quebra o comentário se falhar)
  try {
    await updateDoc(doc(db, 'evaluations', comentario.evaluationId), {
      commentCount: increment(1),
    });
  } catch {
    // contador é secundário
  }
  return { id: ref.id, ...comentario };
}