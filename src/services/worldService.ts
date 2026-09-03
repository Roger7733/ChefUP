import { World } from '@/models/World';
import { db } from '@/services/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function buscarMundos(): Promise<World[]> {
  const snapshot = await getDocs(collection(db, 'worlds'));
  const mundos = snapshot.docs.map((doc) => doc.data() as World);
  return mundos;
}