import { useUserStore } from '@/viewmodels/userStore';
import { StyleSheet, Text, View } from 'react-native';

export default function Perfil() {
  const coins = useUserStore((state) => state.coins);
  const xp = useUserStore((state) => state.xp);
  const level = useUserStore((state) => state.level);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Meu Perfil</Text>
      <Text style={styles.info}>Nível: {level}</Text>
      <Text style={styles.info}>XP: {xp}</Text>
      <Text style={styles.info}>Moedas: {coins}</Text>
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
  info: {
    fontSize: 18,
  },
});