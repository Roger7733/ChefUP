import Header from '@/components/Header';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function Index() {
  const [coins, setCoins] = useState(0);
  const [xp, setXp] = useState(0);

  return (
    <View style={styles.screen}>
      <Header title="Bem-vindo ao ChefUP" />

      <View style={styles.content}>
        <Text style={styles.coinText}>Moedas: {coins}</Text>

        <Pressable style={styles.button} onPress={() => setCoins(coins + 5)}>
          <Text style={styles.buttonText}>Ganhar moeda</Text>
        </Pressable>
      
        <Text style={styles.coinText}>XP: {xp}</Text>

        <Pressable style={styles.button} onPress={() => setXp(xp + 10)}>
          <Text style={styles.buttonText}>Ganhar XP</Text>
        </Pressable>
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