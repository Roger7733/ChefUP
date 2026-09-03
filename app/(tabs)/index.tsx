import Header from '@/components/Header';
import { World } from '@/models/World';
import { buscarMundos } from '@/services/worldService';
import { useUserStore } from '@/viewmodels/userStore';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function Index() {
  const [mundos, setMundos] = useState<World[]>([]);
  const level = useUserStore((state) => state.level);

  useEffect(() => {
    async function carregar() {
      const lista = await buscarMundos();
      setMundos(lista);
    }
    carregar();
  }, []);

  return (
    <View style={styles.screen}>
      <Header title="Mundos" />
      <ScrollView contentContainerStyle={styles.content}>
        {mundos.map((mundo) => {
          const bloqueado = level < mundo.minLevel;

          return (
            <View
              key={mundo.id}
              style={[styles.card, bloqueado && styles.cardBloqueado]}
            >
              <Text style={[styles.cardTitle, bloqueado && styles.textoBloqueado]}>
                {bloqueado ? '🔒 ' : ''}{mundo.name}
              </Text>
              <Text style={styles.cardSubtitle}>{mundo.cuisineType}</Text>
              <Text style={styles.cardLevel}>
                {bloqueado
                  ? `Requer nível ${mundo.minLevel}`
                  : 'Liberado'}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFF3EE',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFD9C9',
  },
  cardBloqueado: {
    backgroundColor: '#F0F0F0',
    borderColor: '#DDDDDD',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  textoBloqueado: {
    color: '#999999',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  cardLevel: {
    fontSize: 13,
    color: '#999999',
    marginTop: 8,
  },
});