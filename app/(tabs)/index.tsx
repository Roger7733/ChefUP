import Header from '@/components/Header';
import { useUserStore } from '@/viewmodels/userStore';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function Index() {
  const coins = useUserStore((state) => state.coins);
  const xp = useUserStore((state) => state.xp);
  const addCoins = useUserStore((state) => state.addCoins);
  const addXp = useUserStore((state) => state.addXp);

  return (
    <View style={styles.screen}>
      <Header title="Bem-vindo ao ChefUP" />

      <View style={styles.content}>

        <Text style={styles.coinText}>Moedas: {coins}</Text>

        <Pressable style={styles.button} onPress={() => addCoins(5)}>
          <Text style={styles.buttonText}>Ganhar moeda</Text>
        </Pressable>

        <Text style={styles.coinText}>XP: {xp}</Text>

        <Pressable style={styles.button} onPress={() => addXp(10)}>
          <Text style={styles.buttonText}>Ganhar XP</Text>
        </Pressable>

        <Link href="/cadastro" style={styles.coinText}>Ir para cadastro →</Link>

        <Link href="/login" style={styles.coinText}>Ir para login →</Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 24,
    gap: 16,
  },
  coinText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#FF6B35',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});