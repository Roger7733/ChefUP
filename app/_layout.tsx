import { auth } from '@/services/firebase';
import { Stack, router } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';

export default function RootLayout() {
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const inscricao = onAuthStateChanged(auth, (usuario) => {
      if (usuario) {
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