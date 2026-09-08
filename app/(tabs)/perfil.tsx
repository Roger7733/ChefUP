import { useUserStore } from '@/viewmodels/userStore';
import { StyleSheet, Text, View } from 'react-native';

import { Link } from 'expo-router';

export default function Perfil() {
  const coins = useUserStore((state) => state.coins);
  const xp = useUserStore((state) => state.xp);
  const level = useUserStore((state) => state.level);
  const streak = useUserStore((state) => state.streak);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Meu Perfil</Text>
      <Text style={styles.streak}>🔥 {streak} {streak === 1 ? 'dia' : 'dias'}</Text>
      <Text style={styles.info}>Nível: {level}</Text>
      <Text style={styles.info}>XP: {xp}</Text>
      <Text style={styles.info}>Moedas: {coins}</Text>
      
      <Link href="/avaliar" style={{ color: '#FF6B35', fontWeight: 'bold', marginTop: 20 }}>
        → Testar avaliar prato
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  streak: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  info: {
    fontSize: 18,
  },
});