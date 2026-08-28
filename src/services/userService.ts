import { User } from '@/models/User';
import { db } from '@/services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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