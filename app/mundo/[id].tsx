import { Phase } from '@/models/Phase';
import { buscarFasesDoMundo } from '@/services/phaseService';
import { useUserStore } from '@/viewmodels/userStore';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function MundoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [fases, setFases] = useState<Phase[]>([]);

  const xp = useUserStore((state) => state.xp);
  const level = useUserStore((state) => state.level);
  const coins = useUserStore((state) => state.coins);
  const completarFase = useUserStore((state) => state.completarFase);

  useEffect(() => {
    async function carregar() {
      const lista = await buscarFasesDoMundo(id);
      setFases(lista);
    }
    carregar();
  }, [id]);

  return (
    <View style={styles.screen}>
      <View style={styles.painel}>
        <Text style={styles.painelTexto}>Nível {level}</Text>
        <Text style={styles.painelTexto}>{xp} XP</Text>
        <Text style={styles.painelTexto}>{coins} moedas</Text>
      </View>

      <ScrollView contentContainerStyle={styles.trilha}>
        {fases.map((fase, indice) => (
          <View
            key={fase.id}
            style={[
              styles.faseWrapper,
              { alignItems: indice % 2 === 0 ? 'flex-start' : 'flex-end' },
            ]}
          >
            <Pressable
              style={styles.fase}
              onPress={() => completarFase(fase.rewardXp)}
            >
              <Text style={styles.faseNumero}>{indice + 1}</Text>
            </Pressable>
            <Text style={styles.faseNome}>
              {fase.name} (+{fase.rewardXp} XP)
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFF9F6',
  },
  painel: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FF6B35',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  painelTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  trilha: {
    padding: 24,
    gap: 28,
  },
  faseWrapper: {
    width: '100%',
  },
  fase: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  faseNumero: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  faseNome: {
    fontSize: 14,
    color: '#666666',
    marginTop: 6,
    maxWidth: 160,
  },
});