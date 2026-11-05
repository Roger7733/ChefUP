import { User } from '@/models/User';
import { db } from '@/services/firebase';
import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';

export async function salvarUsuario(usuario: User) {
  await setDoc(doc(db, 'users', usuario.id), usuario);
}

export async function buscarUsuario(id: string) {
  const snapshot = await getDoc(doc(db, 'users', id));
  if (snapshot.exists()) {
    return snapshot.data() as User;
  }
  return null;
}

// verifica se um @username ainda está livre (compara sempre em minúsculas)
export async function usernameDisponivel(username: string): Promise<boolean> {
  const limpo = username.trim().toLowerCase();
  if (limpo === '') return false;
  const q = query(collection(db, 'users'), where('username', '==', limpo));
  const snapshot = await getDocs(q);
  return snapshot.empty;
}