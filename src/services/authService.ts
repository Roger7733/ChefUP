import { auth } from '@/services/firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from 'firebase/auth';

export async function registrar(email: string, senha: string) {
  const credencial = await createUserWithEmailAndPassword(auth, email, senha);
  return credencial.user;
}

export async function entrar(email: string, senha: string) {
  const credencial = await signInWithEmailAndPassword(auth, email, senha);
  return credencial.user;
}