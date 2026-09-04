import { Item } from '@/models/Item';
import { UserItem } from '@/models/UserItem';
import { db } from '@/services/firebase';
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';

export async function buscarItens(): Promise<Item[]> {
  const snapshot = await getDocs(collection(db, 'items'));
  return snapshot.docs.map((doc) => doc.data() as Item);
}

export async function buscarInventario(userId: string): Promise<UserItem[]> {
  const q = query(
    collection(db, 'userItems'),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as UserItem);
}

export async function registrarCompra(userItem: UserItem): Promise<void> {
  await setDoc(doc(db, 'userItems', userItem.id), userItem);
}