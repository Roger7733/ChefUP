import { Friendship } from '@/models/Friendship';
import { User } from '@/models/User';
import { db } from '@/services/firebase';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';

// 1. Buscar usuários pelo nome (para achar quem adicionar)
export async function buscarUsuariosPorNome(termo: string, meuId: string): Promise<User[]> {
  const q = query(
    collection(db, 'users'),
    where('name', '>=', termo),
    where('name', '<=', termo + '\uf8ff')
  );
  const snapshot = await getDocs(q);

  const usuarios: User[] = [];
  snapshot.forEach((documento) => {
    const usuario = documento.data() as User;
    if (usuario.id !== meuId) {
      usuarios.push(usuario);
    }
  });
  return usuarios;
}

// 2. Enviar pedido de amizade
export async function enviarPedido(meuId: string, outroId: string): Promise<void> {
  await addDoc(collection(db, 'friendships'), {
    userId1: meuId,
    userId2: outroId,
    status: 'pending',
  });
}

// 3. Aceitar um pedido de amizade
export async function aceitarPedido(friendshipId: string): Promise<void> {
  await updateDoc(doc(db, 'friendships', friendshipId), {
    status: 'accepted',
  });
}

// 4. Listar os amigos aceitos do usuário
export async function listarAmigos(meuId: string): Promise<Friendship[]> {
  // amizades onde eu sou o userId1
  const q1 = query(
    collection(db, 'friendships'),
    where('status', '==', 'accepted'),
    where('userId1', '==', meuId)
  );
  // amizades onde eu sou o userId2
  const q2 = query(
    collection(db, 'friendships'),
    where('status', '==', 'accepted'),
    where('userId2', '==', meuId)
  );

  const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

  const amizades: Friendship[] = [];
  snap1.forEach((d) => amizades.push({ id: d.id, ...d.data() } as Friendship));
  snap2.forEach((d) => amizades.push({ id: d.id, ...d.data() } as Friendship));

  return amizades;
}

// 5. Listar os pedidos de amizade que EU recebi (pendentes)
export async function listarPedidosRecebidos(meuId: string): Promise<Friendship[]> {
  const q = query(
    collection(db, 'friendships'),
    where('status', '==', 'pending'),
    where('userId2', '==', meuId)
  );
  const snapshot = await getDocs(q);

  const pedidos: Friendship[] = [];
  snapshot.forEach((d) => pedidos.push({ id: d.id, ...d.data() } as Friendship));
  return pedidos;
}

// 6. Listar os pedidos que EU enviei (pendentes)
export async function listarPedidosEnviados(meuId: string): Promise<Friendship[]> {
  const q = query(
    collection(db, 'friendships'),
    where('status', '==', 'pending'),
    where('userId1', '==', meuId)
  );
  const snapshot = await getDocs(q);

  const pedidos: Friendship[] = [];
  snapshot.forEach((d) => pedidos.push({ id: d.id, ...d.data() } as Friendship));
  return pedidos;
}