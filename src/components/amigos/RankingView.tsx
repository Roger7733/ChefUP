import { User } from '@/models/User';
import { listarAmigos } from '@/services/friendshipService';
import { buscarUsuario } from '@/services/userService';
import { useUserStore } from '@/viewmodels/userStore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function RankingView() {
  const meuId = useUserStore((state) => state.id);

  const [ranking, setRanking] = useState<User[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarRanking();
  }, []);

  async function carregarRanking() {
    try {
      setCarregando(true);
      const eu = await buscarUsuario(meuId);
      const amizades = await listarAmigos(meuId);
      const amigos = await Promise.all(
        amizades.map(async (amizade) => {
          const amigoId = amizade.userId1 === meuId ? amizade.userId2 : amizade.userId1;
          return await buscarUsuario(amigoId);
        })
      );
      const todos = [eu, ...amigos].filter((u) => u !== null) as User[];
      todos.sort((a, b) => b.xp - a.xp);
      setRanking(todos);
    } catch (erro: any) {
      console.log('ERRO AO CARREGAR RANKING:', erro?.message);
    } finally {
      setCarregando(false);
    }
  }

  if (carregando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color="#D63E2A" />
      </View>
    );
  }

  const podio = ranking.slice(0, 3);
  const resto = ranking.slice(3);
  const primeiro = podio[0];
  const segundo = podio[1];
  const terceiro = podio[2];

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.podio}>
        {segundo ? (
          <View style={styles.podioItem}>
            <View style={[styles.podioAvatar, styles.avatarPrata]}>
              <Text style={styles.podioAvatarTexto}>{segundo.name.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.podioMedalha}>🥈</Text>
            <View style={[styles.podioBase, styles.baseSegundo]}>
              <Text style={styles.podioPosicao}>2</Text>
            </View>
            <Text style={styles.podioNome} numberOfLines={1}>
              {segundo.id === meuId ? 'Você' : segundo.name}
            </Text>
            <Text style={styles.podioXp}>{segundo.xp} XP</Text>
          </View>
        ) : (
          <View style={styles.podioItem} />
        )}

        {primeiro ? (
          <View style={styles.podioItem}>
            <Text style={styles.coroa}>👑</Text>
            <View style={[styles.podioAvatar, styles.avatarOuro]}>
              <Text style={styles.podioAvatarTexto}>{primeiro.name.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.podioMedalha}>🥇</Text>
            <View style={[styles.podioBase, styles.basePrimeiro]}>
              <Text style={styles.podioPosicao}>1</Text>
            </View>
            <Text style={styles.podioNome} numberOfLines={1}>
              {primeiro.id === meuId ? 'Você' : primeiro.name}
            </Text>
            <Text style={styles.podioXp}>{primeiro.xp} XP</Text>
          </View>
        ) : (
          <View style={styles.podioItem} />
        )}

        {terceiro ? (
          <View style={styles.podioItem}>
            <View style={[styles.podioAvatar, styles.avatarBronze]}>
              <Text style={styles.podioAvatarTexto}>{terceiro.name.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.podioMedalha}>🥉</Text>
            <View style={[styles.podioBase, styles.baseTerceiro]}>
              <Text style={styles.podioPosicao}>3</Text>
            </View>
            <Text style={styles.podioNome} numberOfLines={1}>
              {terceiro.id === meuId ? 'Você' : terceiro.name}
            </Text>
            <Text style={styles.podioXp}>{terceiro.xp} XP</Text>
          </View>
        ) : (
          <View style={styles.podioItem} />
        )}
      </View>

      {resto.map((usuario, indice) => {
        const posicao = indice + 4;
        const souEu = usuario.id === meuId;
        return (
          <View key={usuario.id} style={[styles.linha, souEu && styles.linhaEu]}>
            <Text style={styles.posicao}>{posicao}º</Text>
            <View style={styles.avatar}>
              <Text style={styles.avatarTexto}>{usuario.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.nome}>
                {usuario.name} {souEu && <Text style={styles.voce}>(você)</Text>}
              </Text>
              <Text style={styles.nivel}>Nível {usuario.level}</Text>
            </View>
            <Text style={styles.xp}>{usuario.xp} XP</Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centro: { paddingVertical: 60, justifyContent: 'center', alignItems: 'center' },
  podio: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', marginBottom: 24, gap: 8 },
  podioItem: { flex: 1, alignItems: 'center' },
  coroa: { fontSize: 22, marginBottom: 2 },
  podioAvatar: {
    width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center', borderWidth: 3,
  },
  avatarOuro: { backgroundColor: '#E8A736', borderColor: '#C68514' },
  avatarPrata: { backgroundColor: '#B0B0B0', borderColor: '#909090' },
  avatarBronze: { backgroundColor: '#C0803C', borderColor: '#9B6428' },
  podioAvatarTexto: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  podioMedalha: { fontSize: 20, marginTop: -8 },
  podioBase: {
    width: '90%', justifyContent: 'flex-start', alignItems: 'center',
    borderTopLeftRadius: 8, borderTopRightRadius: 8, paddingTop: 6, marginTop: 4,
  },
  basePrimeiro: { height: 70, backgroundColor: '#E8A736' },
  baseSegundo: { height: 50, backgroundColor: '#B0B0B0' },
  baseTerceiro: { height: 36, backgroundColor: '#C0803C' },
  podioPosicao: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  podioNome: { fontSize: 14, fontWeight: 'bold', color: '#2A1A12', marginTop: 6, maxWidth: 90 },
  podioXp: { fontSize: 12, color: '#E8A736', fontWeight: 'bold', marginTop: 2 },
  linha: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FFF', padding: 14, borderRadius: 12, marginBottom: 10,
  },
  linhaEu: { borderWidth: 2, borderColor: '#D63E2A' },
  posicao: { fontSize: 18, fontWeight: 'bold', color: '#9B8674', width: 36 },
  avatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#D63E2A',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarTexto: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  info: { flex: 1 },
  nome: { fontSize: 16, fontWeight: 'bold', color: '#2A1A12' },
  voce: { color: '#D63E2A', fontWeight: 'normal' },
  nivel: { fontSize: 13, color: '#9B8674', marginTop: 2 },
  xp: { fontSize: 16, fontWeight: 'bold', color: '#E8A736' },
});