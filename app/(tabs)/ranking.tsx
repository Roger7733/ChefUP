import { User } from '@/models/User';
import { listarAmigos } from '@/services/friendshipService';
import { buscarUsuario } from '@/services/userService';
import { useUserStore } from '@/viewmodels/userStore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function Ranking() {
  const meuId = useUserStore((state) => state.id);

  const [ranking, setRanking] = useState<User[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarRanking();
  }, []);

  async function carregarRanking() {
    try {
      setCarregando(true);

      // 1. eu mesmo (dados atuais do banco)
      const eu = await buscarUsuario(meuId);

      // 2. meus amigos
      const amizades = await listarAmigos(meuId);
      const amigos = await Promise.all(
        amizades.map(async (amizade) => {
          const amigoId = amizade.userId1 === meuId ? amizade.userId2 : amizade.userId1;
          return await buscarUsuario(amigoId);
        })
      );

      // 3. junta eu + amigos, remove nulos
      const todos = [eu, ...amigos].filter((u) => u !== null) as User[];

      // 4. ordena por XP (maior primeiro)
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

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Ranking</Text>
      <Text style={styles.subtitulo}>Você e seus amigos</Text>

      {ranking.map((usuario, indice) => {
        const posicao = indice + 1;
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
  screen: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#FBF6EC' },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FBF6EC' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2A1A12' },
  subtitulo: { fontSize: 14, color: '#9B8674', marginBottom: 20 },
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