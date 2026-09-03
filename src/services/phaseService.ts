import { Phase } from '@/models/Phase';
import { db } from '@/services/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export async function buscarFasesDoMundo(worldId: string): Promise<Phase[]> {
  const q = query(
    collection(db, 'phases'),
    where('worldId', '==', worldId)
  );
  const snapshot = await getDocs(q);
  const fases = snapshot.docs.map((doc) => doc.data() as Phase);
  return fases;
}