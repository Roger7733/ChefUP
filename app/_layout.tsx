import { auth } from '@/services/firebase';
import { buscarUsuario } from '@/services/userService';
import { useUserStore } from '@/viewmodels/userStore';
import { Stack, router } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';

export default function RootLayout() {
  const [carregando, setCarregando] = useState(true);
  const setUsuario = useUserStore((state) => state.setUsuario);

  useEffect(() => {
    const inscricao = onAuthStateChanged(auth, async (usuario) => {
      if (usuario) {
        const dados = await buscarUsuario(usuario.uid);
        if (dados) {
          setUsuario(dados);
        }
        router.replace('/(tabs)');
      } else {
        router.replace('/login');
      }
      setCarregando(false);
    });

    return inscricao;
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}