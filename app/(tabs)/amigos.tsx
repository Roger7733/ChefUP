import AdicionarView from '@/components/amigos/AdicionarView';
import FeedView from '@/components/amigos/FeedView';
import RankingView from '@/components/amigos/RankingView';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type Aba = 'feed' | 'ranking' | 'adicionar';

export default function Amigos() {
  const [aba, setAba] = useState<Aba>('feed');

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Amigos</Text>

      <View style={styles.abas}>
        <Pressable
          style={[styles.abaBotao, aba === 'feed' && styles.abaAtiva]}
          onPress={() => setAba('feed')}
        >
          <Text style={[styles.abaTexto, aba === 'feed' && styles.abaTextoAtivo]}>Feed</Text>
        </Pressable>
        <Pressable
          style={[styles.abaBotao, aba === 'ranking' && styles.abaAtiva]}
          onPress={() => setAba('ranking')}
        >
          <Text style={[styles.abaTexto, aba === 'ranking' && styles.abaTextoAtivo]}>Ranking</Text>
        </Pressable>
        <Pressable
          style={[styles.abaBotao, aba === 'adicionar' && styles.abaAtiva]}
          onPress={() => setAba('adicionar')}
        >
          <Text style={[styles.abaTexto, aba === 'adicionar' && styles.abaTextoAtivo]}>Adicionar</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.conteudo}>
        {aba === 'feed' && <FeedView />}
        {aba === 'ranking' && <RankingView />}
        {aba === 'adicionar' && <AdicionarView />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FBF6EC', paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2A1A12', paddingHorizontal: 20, marginBottom: 12 },
  abas: {
    flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 16,
  },
  abaBotao: {
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#F4ECD8',
  },
  abaAtiva: { backgroundColor: '#D63E2A' },
  abaTexto: { fontSize: 14, fontWeight: 'bold', color: '#9B8674' },
  abaTextoAtivo: { color: '#FFF' },
  conteudo: { paddingHorizontal: 20, paddingBottom: 40 },
});