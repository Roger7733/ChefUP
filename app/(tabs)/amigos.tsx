import { Friendship } from '@/models/Friendship';
import { User } from '@/models/User';
import {
  aceitarPedido,
  buscarUsuariosPorNome,
  enviarPedido,
  listarAmigos,
  listarPedidosEnviados,
  listarPedidosRecebidos,
} from '@/services/friendshipService';
import { buscarUsuario } from '@/services/userService';
import { useUserStore } from '@/viewmodels/userStore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

type PedidoComNome = {
  friendship: Friendship;
  remetente: User;
};

export default function Amigos() {
  const meuId = useUserStore((state) => state.id);

  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState<User[]>([]);
  const [buscando, setBuscando] = useState(false);

  const [pedidos, setPedidos] = useState<PedidoComNome[]>([]);
  const [amigos, setAmigos] = useState<User[]>([]);

  // ids de quem já tem relação comigo
  const [idsAmigos, setIdsAmigos] = useState<string[]>([]);
  const [idsEnviados, setIdsEnviados] = useState<string[]>([]);
  const [idsRecebidos, setIdsRecebidos] = useState<string[]>([]);

  useEffect(() => {
    carregarTudo();
  }, []);

  async function carregarTudo() {
    await Promise.all([carregarPedidos(), carregarAmigos(), carregarEnviados()]);
  }

  async function carregarPedidos() {
    try {
      const listaPedidos = await listarPedidosRecebidos(meuId);
      const comNomes = await Promise.all(
        listaPedidos.map(async (friendship) => {
          const remetente = await buscarUsuario(friendship.userId1);
          return { friendship, remetente } as PedidoComNome;
        })
      );
      const validos = comNomes.filter((p) => p.remetente !== null);
      setPedidos(validos);
      setIdsRecebidos(validos.map((p) => p.remetente.id));
    } catch (erro: any) {
      console.log('ERRO AO CARREGAR PEDIDOS:', erro?.message);
    }
  }

  async function carregarEnviados() {
    try {
      const enviados = await listarPedidosEnviados(meuId);
      setIdsEnviados(enviados.map((f) => f.userId2));
    } catch (erro: any) {
      console.log('ERRO AO CARREGAR ENVIADOS:', erro?.message);
    }
  }

  async function carregarAmigos() {
    try {
      const amizades = await listarAmigos(meuId);
      const usuarios = await Promise.all(
        amizades.map(async (amizade) => {
          const amigoId = amizade.userId1 === meuId ? amizade.userId2 : amizade.userId1;
          return await buscarUsuario(amigoId);
        })
      );
      const validos = usuarios.filter((u) => u !== null) as User[];
      validos.sort((a, b) => a.name.localeCompare(b.name));
      setAmigos(validos);
      setIdsAmigos(validos.map((u) => u.id));
    } catch (erro: any) {
      console.log('ERRO AO CARREGAR AMIGOS:', erro?.message);
    }
  }

  async function handleAceitar(friendshipId: string) {
    try {
      await aceitarPedido(friendshipId);
      setPedidos(pedidos.filter((p) => p.friendship.id !== friendshipId));
      Alert.alert('Pronto!', 'Vocês agora são amigos.');
      carregarAmigos();
    } catch (erro: any) {
      Alert.alert('Erro', 'Não foi possível aceitar o pedido.');
    }
  }

  async function handleBuscar() {
    if (termo.trim() === '') return;
    try {
      setBuscando(true);
      const usuarios = await buscarUsuariosPorNome(termo.trim(), meuId);
      setResultados(usuarios);
    } catch (erro: any) {
      console.log('ERRO DA BUSCA:', JSON.stringify(erro), erro?.message);
      Alert.alert('Erro', erro?.message || 'Não foi possível buscar usuários.');
    } finally {
      setBuscando(false);
    }
  }

  async function handleSeguir(outroId: string) {
    try {
      await enviarPedido(meuId, outroId);
      setIdsEnviados([...idsEnviados, outroId]);
    } catch (erro: any) {
      console.log('ERRO DO SEGUIR:', JSON.stringify(erro), erro?.message);
      Alert.alert('Erro', erro?.message || 'Não foi possível enviar o pedido.');
    }
  }

  // decide o que mostrar no botão de cada resultado da busca
  function estadoRelacao(usuarioId: string): 'amigo' | 'enviado' | 'recebido' | 'nenhum' {
    if (idsAmigos.includes(usuarioId)) return 'amigo';
    if (idsEnviados.includes(usuarioId)) return 'enviado';
    if (idsRecebidos.includes(usuarioId)) return 'recebido';
    return 'nenhum';
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Amigos</Text>

      {pedidos.length > 0 && (
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Pedidos recebidos</Text>
          {pedidos.map((p) => (
            <View key={p.friendship.id} style={styles.card}>
              <View style={styles.cardEsquerda}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarTexto}>{p.remetente.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View>
                  <Text style={styles.nome}>{p.remetente.name}</Text>
                  <Text style={styles.nivel}>quer ser seu amigo</Text>
                </View>
              </View>
              <Pressable style={styles.botaoAceitar} onPress={() => handleAceitar(p.friendship.id)}>
                <Text style={styles.botaoTexto}>Aceitar</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <View style={styles.buscaLinha}>
        <TextInput
          style={styles.input}
          placeholder="Buscar por nome"
          value={termo}
          onChangeText={setTermo}
          autoCapitalize="none"
        />
        <Pressable style={styles.botaoBuscar} onPress={handleBuscar}>
          <Text style={styles.botaoTexto}>Buscar</Text>
        </Pressable>
      </View>

      {buscando && <ActivityIndicator size="large" color="#D63E2A" style={{ marginTop: 20 }} />}

      {resultados.length > 0 && (
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Resultados</Text>
          {resultados.map((item) => {
            const estado = estadoRelacao(item.id);
            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardEsquerda}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarTexto}>{item.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View>
                    <Text style={styles.nome}>{item.name}</Text>
                    <Text style={styles.nivel}>Nível {item.level}</Text>
                  </View>
                </View>

                {estado === 'nenhum' && (
                  <Pressable style={styles.botaoSeguir} onPress={() => handleSeguir(item.id)}>
                    <Text style={styles.botaoTexto}>+ Adicionar</Text>
                  </Pressable>
                )}
                {estado === 'enviado' && (
                  <View style={styles.botaoNeutro}>
                    <Text style={styles.botaoNeutroTexto}>Pendente</Text>
                  </View>
                )}
                {estado === 'recebido' && (
                  <View style={styles.botaoNeutro}>
                    <Text style={styles.botaoNeutroTexto}>Te adicionou</Text>
                  </View>
                )}
                {estado === 'amigo' && (
                  <View style={styles.botaoNeutro}>
                    <Text style={styles.botaoNeutroTexto}>✓ Amigo</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      <View style={styles.secao}>
        <Text style={styles.secaoTitulo}>Meus amigos ({amigos.length})</Text>
        {amigos.length === 0 ? (
          <Text style={styles.vazio}>Você ainda não tem amigos. Busque por nome para adicionar!</Text>
        ) : (
          amigos.map((amigo) => (
            <View key={amigo.id} style={styles.card}>
              <View style={styles.cardEsquerda}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarTexto}>{amigo.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View>
                  <Text style={styles.nome}>{amigo.name}</Text>
                  <Text style={styles.nivel}>Nível {amigo.level}</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#FBF6EC' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2A1A12', marginBottom: 16 },
  secao: { marginBottom: 24, gap: 10 },
  secaoTitulo: { fontSize: 13, fontWeight: 'bold', color: '#9B8674', textTransform: 'uppercase' },
  buscaLinha: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  input: {
    flex: 1, borderWidth: 1, borderColor: '#DDD', borderRadius: 10,
    padding: 12, fontSize: 16, backgroundColor: '#FFF',
  },
  botaoBuscar: {
    backgroundColor: '#D63E2A', paddingHorizontal: 18, justifyContent: 'center', borderRadius: 10,
  },
  vazio: { color: '#9B8674', fontStyle: 'italic' },
  card: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#FFF', padding: 14, borderRadius: 12,
  },
  cardEsquerda: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#D63E2A',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarTexto: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  nome: { fontSize: 16, fontWeight: 'bold', color: '#2A1A12' },
  nivel: { fontSize: 13, color: '#9B8674', marginTop: 2 },
  botaoSeguir: {
    backgroundColor: '#D63E2A', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8,
  },
  botaoAceitar: {
    backgroundColor: '#4F7239', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8,
  },
  botaoTexto: { color: '#FFF', fontWeight: 'bold' },
  botaoNeutro: {
    backgroundColor: '#F4ECD8', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8,
  },
  botaoNeutroTexto: { color: '#9B8674', fontWeight: 'bold' },
});