import Avatar from '@/components/Avatar';
import EscanearQrModal from '@/components/amigos/EscanearQrModal';
import MeuQrModal from '@/components/amigos/MeuQrModal';
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
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

type PedidoComNome = {
  friendship: Friendship;
  remetente: User;
};

export default function AdicionarView() {
  const meuId = useUserStore((state) => state.id);

  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState<User[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [buscou, setBuscou] = useState(false);

  const [pedidos, setPedidos] = useState<PedidoComNome[]>([]);
  const [amigos, setAmigos] = useState<User[]>([]);

  const [idsAmigos, setIdsAmigos] = useState<string[]>([]);
  const [idsEnviados, setIdsEnviados] = useState<string[]>([]);
  const [idsRecebidos, setIdsRecebidos] = useState<string[]>([]);

  const [mostrarMeuQr, setMostrarMeuQr] = useState(false);
  const [mostrarScanner, setMostrarScanner] = useState(false);

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
      setBuscou(true);
    } catch (erro: any) {
      Alert.alert('Erro', erro?.message || 'Não foi possível buscar usuários.');
    } finally {
      setBuscando(false);
    }
  }

  function limparBusca() {
    setTermo('');
    setResultados([]);
    setBuscou(false);
  }

  async function handleSeguir(outroId: string) {
    try {
      await enviarPedido(meuId, outroId);
      setIdsEnviados([...idsEnviados, outroId]);
    } catch (erro: any) {
      Alert.alert('Erro', erro?.message || 'Não foi possível enviar o pedido.');
    }
  }

  function estadoRelacao(usuarioId: string): 'amigo' | 'enviado' | 'recebido' | 'nenhum' {
    if (idsAmigos.includes(usuarioId)) return 'amigo';
    if (idsEnviados.includes(usuarioId)) return 'enviado';
    if (idsRecebidos.includes(usuarioId)) return 'recebido';
    return 'nenhum';
  }

  function botaoRelacao(item: User) {
    const estado = estadoRelacao(item.id);
    if (estado === 'nenhum') {
      return (
        <Pressable style={styles.botaoSeguir} onPress={() => handleSeguir(item.id)}>
          <Text style={styles.botaoTexto}>+ Adicionar</Text>
        </Pressable>
      );
    }
    const rotulo = estado === 'enviado' ? 'Pendente' : estado === 'recebido' ? 'Te adicionou' : '✓ Amigo';
    return <View style={styles.botaoNeutro}><Text style={styles.botaoNeutroTexto}>{rotulo}</Text></View>;
  }

  return (
    <View>
      {/* BUSCA */}
      <View style={styles.buscaCard}>
        <Ionicons name="search" size={18} color="#9B8674" />
        <TextInput
          style={styles.buscaInput}
          placeholder="Buscar um chef pelo nome"
          placeholderTextColor="#B3A796"
          value={termo}
          onChangeText={setTermo}
          autoCapitalize="none"
          returnKeyType="search"
          onSubmitEditing={handleBuscar}
        />
        {termo.length > 0 && (
          <Pressable onPress={limparBusca} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color="#C9BEAE" />
          </Pressable>
        )}
      </View>

      {/* QR — card dividido */}
      <View style={styles.qrCard}>
        <Pressable style={styles.qrMetade} onPress={() => setMostrarMeuQr(true)}>
          <View style={styles.miniQr}>
            {meuId ? <QRCode value={meuId} size={46} color="#2A1A12" backgroundColor="#FFFFFF" /> : null}
          </View>
          <Text style={styles.qrLabel}>Meu código</Text>
        </Pressable>

        <View style={styles.qrDivisor} />

        <Pressable style={styles.qrMetade} onPress={() => setMostrarScanner(true)}>
          <View style={styles.qrIcone}>
            <Ionicons name="scan" size={28} color="#D63E2A" />
          </View>
          <Text style={styles.qrLabel}>Escanear</Text>
        </Pressable>
      </View>

      {/* PEDIDOS */}
      {pedidos.length > 0 && (
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Pedidos recebidos · {pedidos.length}</Text>
          {pedidos.map((p) => (
            <View key={p.friendship.id} style={styles.card}>
              <View style={styles.cardEsquerda}>
                <Avatar size={44} circleColor={p.remetente.avatarColor ?? '#C0392B'} hat={p.remetente.equippedHat ?? 'toque'} outfit="normal" />
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

      {/* RESULTADOS (buscando) ou MEUS AMIGOS */}
      {buscando ? (
        <ActivityIndicator size="large" color="#D63E2A" style={{ marginTop: 20 }} />
      ) : buscou ? (
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Resultados</Text>
          {resultados.length === 0 ? (
            <Text style={styles.vazio}>Nenhum chef encontrado com esse nome.</Text>
          ) : (
            resultados.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardEsquerda}>
                  <Avatar size={44} circleColor={item.avatarColor ?? '#C0392B'} hat={item.equippedHat ?? 'toque'} outfit="normal" />
                  <View>
                    <Text style={styles.nome}>{item.name}</Text>
                    <Text style={styles.nivel}>Nível {item.level}</Text>
                  </View>
                </View>
                {botaoRelacao(item)}
              </View>
            ))
          )}
        </View>
      ) : (
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Meus amigos ({amigos.length})</Text>
          {amigos.length === 0 ? (
            <Text style={styles.vazio}>Você ainda não tem amigos. Busque por nome ou use o QR Code!</Text>
          ) : (
            amigos.map((amigo) => (
              <View key={amigo.id} style={styles.card}>
                <View style={styles.cardEsquerda}>
                  <Avatar size={44} circleColor={amigo.avatarColor ?? '#C0392B'} hat={amigo.equippedHat ?? 'toque'} outfit="normal" />
                  <View>
                    <Text style={styles.nome}>{amigo.name}</Text>
                    <Text style={styles.nivel}>Nível {amigo.level}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      <MeuQrModal visivel={mostrarMeuQr} onFechar={() => setMostrarMeuQr(false)} />
      <EscanearQrModal
        visivel={mostrarScanner}
        onFechar={() => setMostrarScanner(false)}
        onAdicionou={carregarTudo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  buscaCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FFF', borderWidth: 1, borderColor: '#F0E6D2', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12, marginBottom: 16,
  },
  buscaInput: { flex: 1, fontSize: 16, color: '#2A1A12', padding: 0 },

  qrCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF', borderWidth: 1, borderColor: '#F0E6D2', borderRadius: 16,
    padding: 14, marginBottom: 20,
  },
  qrMetade: { flex: 1, alignItems: 'center', gap: 8 },
  qrDivisor: { width: 1, alignSelf: 'stretch', backgroundColor: '#F0E6D2', marginVertical: 4 },
  miniQr: { padding: 6, backgroundColor: '#FFF', borderRadius: 10, borderWidth: 1, borderColor: '#F0E6D2' },
  qrIcone: { width: 58, height: 58, borderRadius: 12, backgroundColor: '#FBEEDD', alignItems: 'center', justifyContent: 'center' },
  qrLabel: { fontSize: 13, fontWeight: 'bold', color: '#2A1A12' },

  secao: { marginBottom: 24, gap: 10 },
  secaoTitulo: { fontSize: 13, fontWeight: 'bold', color: '#9B8674', textTransform: 'uppercase' },
  vazio: { color: '#9B8674', fontStyle: 'italic' },
  card: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#FFF', padding: 14, borderRadius: 12,
  },
  cardEsquerda: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  nome: { fontSize: 16, fontWeight: 'bold', color: '#2A1A12' },
  nivel: { fontSize: 13, color: '#9B8674', marginTop: 2 },
  botaoSeguir: { backgroundColor: '#D63E2A', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  botaoAceitar: { backgroundColor: '#4F7239', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  botaoTexto: { color: '#FFF', fontWeight: 'bold' },
  botaoNeutro: { backgroundColor: '#F4ECD8', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  botaoNeutroTexto: { color: '#9B8674', fontWeight: 'bold' },
});