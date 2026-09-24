import { Evaluation } from '@/models/Evaluation';
import { listarAvaliacoesDe } from '@/services/evaluationService';
import { listarAmigos } from '@/services/friendshipService';
import { useUserStore } from '@/viewmodels/userStore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

export default function FeedView() {
  const meuId = useUserStore((state) => state.id);

  const [posts, setPosts] = useState<Evaluation[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarFeed();
  }, []);

  async function carregarFeed() {
    try {
      setCarregando(true);

      // 1. monta a lista: eu + meus amigos
      const amizades = await listarAmigos(meuId);
      const idsAmigos = amizades.map((a) => (a.userId1 === meuId ? a.userId2 : a.userId1));
      const todosIds = [meuId, ...idsAmigos];
      console.log('FEED - meus ids buscados:', JSON.stringify(todosIds));

      // 2. busca as avaliações de todos eles
      const avaliacoes = await listarAvaliacoesDe(todosIds);
      setPosts(avaliacoes);
    } catch (erro: any) {
      console.log('ERRO AO CARREGAR FEED:', erro?.message);
    } finally {
      setCarregando(false);
    }
  }

  function formatarData(iso: string): string {
    const data = new Date(iso);
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  }

  if (carregando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color="#D63E2A" />
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View style={styles.centro}>
        <Text style={styles.vazio}>Nenhum prato publicado ainda.</Text>
        <Text style={styles.vazioSub}>Avalie um prato e compartilhe, ou adicione amigos!</Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 16 }}>
      {posts.map((post) => (
        <View key={post.id} style={styles.card}>
          <View style={styles.cabecalho}>
            <View style={styles.avatar}>
              <Text style={styles.avatarTexto}>{post.userName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.nome}>
                {post.userId === meuId ? 'Você' : post.userName}
              </Text>
              <Text style={styles.prato}>{post.phaseName} · {formatarData(post.date)}</Text>
            </View>
          </View>

          <Image source={{ uri: post.photoUrl }} style={styles.foto} />

          <View style={styles.corpo}>
            <Text style={styles.estrelas}>{'⭐'.repeat(post.stars)}</Text>
            {post.caption.length > 0 && <Text style={styles.legenda}>{post.caption}</Text>}
            <Text style={styles.feedbackIA}>🤖 {post.feedback}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  centro: { paddingVertical: 60, justifyContent: 'center', alignItems: 'center', gap: 6 },
  vazio: { fontSize: 16, fontWeight: 'bold', color: '#2A1A12' },
  vazioSub: { fontSize: 14, color: '#9B8674', textAlign: 'center' },
  card: { backgroundColor: '#FFF', borderRadius: 16, overflow: 'hidden' },
  cabecalho: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  avatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#D63E2A',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarTexto: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  nome: { fontSize: 15, fontWeight: 'bold', color: '#2A1A12' },
  prato: { fontSize: 13, color: '#9B8674', marginTop: 1 },
  foto: { width: '100%', height: 260, backgroundColor: '#F0EEE9' },
  corpo: { padding: 14, gap: 6 },
  estrelas: { fontSize: 18 },
  legenda: { fontSize: 15, color: '#2A1A12' },
  feedbackIA: { fontSize: 13, color: '#9B8674', fontStyle: 'italic' },
});