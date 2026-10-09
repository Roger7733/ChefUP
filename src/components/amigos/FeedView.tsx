import Avatar from '@/components/Avatar';
import ComentariosModal from '@/components/amigos/ComentariosModal';
import { Evaluation } from '@/models/Evaluation';
import {
  alternarCurtida,
  listarAvaliacoesDe,
  listarMinhasAvaliacoes,
  listarTodasAvaliacoes,
} from '@/services/evaluationService';
import { listarAmigos } from '@/services/friendshipService';
import { useUserStore } from '@/viewmodels/userStore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';

type Aba = 'amigos' | 'minhas' | 'todos';

const ABAS: { key: Aba; label: string }[] = [
  { key: 'amigos', label: 'Amigos' },
  { key: 'minhas', label: 'Minhas' },
  { key: 'todos', label: 'Todos' },
];

const CORES = ['#C0392B', '#4F7239', '#5B3A57', '#2C6E7F', '#B9770E', '#8E44AD'];
function corDoUsuario(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return CORES[h % CORES.length];
}

function tempoAtras(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h`;
  const d = Math.floor(h / 24);
  return `${d} d`;
}

export default function FeedView() {
  const meuId = useUserStore((state) => state.id);

  const [aba, setAba] = useState<Aba>('amigos');
  const [posts, setPosts] = useState<Evaluation[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [postComentando, setPostComentando] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      try {
        let avaliacoes: Evaluation[] = [];
        if (aba === 'minhas') {
          avaliacoes = await listarMinhasAvaliacoes(meuId);
        } else if (aba === 'amigos') {
          const amizades = await listarAmigos(meuId);
          const idsAmigos = amizades.map((a) => (a.userId1 === meuId ? a.userId2 : a.userId1));
          avaliacoes = idsAmigos.length > 0 ? await listarAvaliacoesDe(idsAmigos) : [];
        } else {
          avaliacoes = await listarTodasAvaliacoes();
        }
        setPosts(avaliacoes);
      } catch (erro: any) {
        console.log('ERRO AO CARREGAR FEED:', erro?.message);
      } finally {
        setCarregando(false);
      }
    }
    if (meuId) carregar();
  }, [aba, meuId]);

  async function curtir(post: Evaluation) {
    const jaCurtiu = (post.likedBy ?? []).includes(meuId);
    setPosts((atual) =>
      atual.map((p) => {
        if (p.id !== post.id) return p;
        const lista = p.likedBy ?? [];
        return { ...p, likedBy: jaCurtiu ? lista.filter((x) => x !== meuId) : [...lista, meuId] };
      })
    );
    try {
      await alternarCurtida(post.id, meuId, !jaCurtiu);
    } catch (erro: any) {
      console.log('ERRO AO CURTIR:', erro?.message);
    }
  }

  return (
    <View style={{ gap: 16 }}>
      <View style={styles.tabs}>
        {ABAS.map((t) => (
          <Pressable key={t.key} style={[styles.tab, aba === t.key && styles.tabAtiva]} onPress={() => setAba(t.key)}>
            <Text style={[styles.tabTexto, aba === t.key && styles.tabTextoAtiva]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      {carregando ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color="#D63E2A" />
        </View>
      ) : posts.length === 0 ? (
        <View style={styles.centro}>
          <Text style={styles.vazio}>Nada por aqui ainda.</Text>
          <Text style={styles.vazioSub}>
            {aba === 'minhas'
              ? 'Avalie um prato e publique pra aparecer aqui.'
              : aba === 'amigos'
              ? 'Adicione amigos pra ver os pratos deles.'
              : 'Seja o primeiro a publicar um prato!'}
          </Text>
        </View>
      ) : (
        posts.map((post) => {
          const curtidas = (post.likedBy ?? []).length;
          const jaCurtiu = (post.likedBy ?? []).includes(meuId);
          return (
            <View key={post.id} style={styles.card}>
              <View style={styles.cabecalho}>
                <Avatar
                  size={40}
                  hat={(post.avatarHat as any) ?? 'toque'}
                  outfit="normal"
                  circleColor={post.avatarColor ?? corDoUsuario(post.userId)}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.nome}>{post.userId === meuId ? 'Você' : post.userName}</Text>
                  <Text style={styles.prato}>{post.phaseName} · {tempoAtras(post.date)}</Text>
                </View>
              </View>

              <Image source={{ uri: post.photoUrl }} style={styles.foto} />

              <View style={styles.corpo}>
                <Text style={styles.estrelas}>{'⭐'.repeat(post.stars)}</Text>
                {post.caption && post.caption.length > 0 ? <Text style={styles.legenda}>{post.caption}</Text> : null}
                {post.feedback ? <Text style={styles.feedbackIA}>🤖 {post.feedback}</Text> : null}

                <View style={styles.divisor} />

                <View style={styles.acoes}>
                  <Pressable style={styles.acao} onPress={() => curtir(post)}>
                    <Text style={styles.acaoIcone}>{jaCurtiu ? '❤️' : '🤍'}</Text>
                    <Text style={styles.acaoTexto}>{curtidas}</Text>
                  </Pressable>
                  <Pressable style={styles.acao} onPress={() => setPostComentando(post.id)}>
                    <Text style={styles.acaoIcone}>💬</Text>
                    <Text style={styles.acaoTexto}>{post.commentCount ?? 0}</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          );
        })
      )}

      <ComentariosModal
        evaluationId={postComentando}
        onFechar={() => setPostComentando(null)}
        onComentou={(id) =>
          setPosts((atual) => atual.map((p) => (p.id === id ? { ...p, commentCount: (p.commentCount ?? 0) + 1 } : p)))
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: 8 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFFFFF', alignItems: 'center', borderWidth: 1, borderColor: '#F0E6D2' },
  tabAtiva: { backgroundColor: '#2A1A12', borderColor: '#2A1A12' },
  tabTexto: { fontSize: 13, fontWeight: 'bold', color: '#9B8674' },
  tabTextoAtiva: { color: '#FFFFFF' },

  centro: { paddingVertical: 60, justifyContent: 'center', alignItems: 'center', gap: 6 },
  vazio: { fontSize: 16, fontWeight: 'bold', color: '#2A1A12' },
  vazioSub: { fontSize: 14, color: '#9B8674', textAlign: 'center' },

  card: { backgroundColor: '#FFF', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#F0E6D2' },
  cabecalho: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  nome: { fontSize: 15, fontWeight: 'bold', color: '#2A1A12' },
  prato: { fontSize: 13, color: '#9B8674', marginTop: 1 },
  foto: { width: '100%', height: 260, backgroundColor: '#F0EEE9' },
  corpo: { padding: 14, gap: 6 },
  estrelas: { fontSize: 18 },
  legenda: { fontSize: 15, color: '#2A1A12' },
  feedbackIA: { fontSize: 13, color: '#9B8674', fontStyle: 'italic' },
  divisor: { height: 1, backgroundColor: '#F0EEE9', marginTop: 6 },
  acoes: { flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 2 },
  acao: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
  acaoIcone: { fontSize: 18 },
  acaoTexto: { fontSize: 14, fontWeight: 'bold', color: '#2A1A12' },
});