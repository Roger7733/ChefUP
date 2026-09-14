import { User } from '@/models/User';
import { buscarUsuariosPorNome, enviarPedido } from '@/services/friendshipService';
import { useUserStore } from '@/viewmodels/userStore';
import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function Amigos() {
  const meuId = useUserStore((state) => state.id);

  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState<User[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [enviados, setEnviados] = useState<string[]>([]);

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
      setEnviados([...enviados, outroId]);
    } catch (erro: any) {
      console.log('ERRO DO SEGUIR:', JSON.stringify(erro), erro?.message);
      Alert.alert('Erro', erro?.message || 'Não foi possível enviar o pedido.');
    }
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Adicionar amigos</Text>

      <View style={styles.buscaLinha}>
        <TextInput
          style={styles.input}
          placeholder="Buscar por nome"
          value={termo}
          onChangeText={setTermo}
          autoCapitalize="none"
        />
        <Pressable style={styles.botaoBuscar} onPress={handleBuscar}>
          <Text style={styles.botaoBuscarTexto}>Buscar</Text>
        </Pressable>
      </View>

      {buscando && <ActivityIndicator size="large" color="#D63E2A" style={{ marginTop: 20 }} />}

      <FlatList
        data={resultados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 10, paddingTop: 16 }}
        ListEmptyComponent={
          !buscando ? <Text style={styles.vazio}>Busque por um nome para encontrar amigos.</Text> : null
        }
        renderItem={({ item }) => {
          const jaEnviado = enviados.includes(item.id);
          return (
            <View style={styles.card}>
              <View>
                <Text style={styles.nome}>{item.name}</Text>
                <Text style={styles.nivel}>Nível {item.level}</Text>
              </View>
              <Pressable
                style={[styles.botaoSeguir, jaEnviado && styles.botaoEnviado]}
                onPress={() => handleSeguir(item.id)}
                disabled={jaEnviado}
              >
                <Text style={[styles.botaoSeguirTexto, jaEnviado && styles.botaoEnviadoTexto]}>
                  {jaEnviado ? 'Enviado' : '+ Seguir'}
                </Text>
              </Pressable>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#FBF6EC' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2A1A12', marginBottom: 16 },
  buscaLinha: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1, borderWidth: 1, borderColor: '#DDD', borderRadius: 10,
    padding: 12, fontSize: 16, backgroundColor: '#FFF',
  },
  botaoBuscar: {
    backgroundColor: '#D63E2A', paddingHorizontal: 18, justifyContent: 'center', borderRadius: 10,
  },
  botaoBuscarTexto: { color: '#FFF', fontWeight: 'bold' },
  vazio: { textAlign: 'center', color: '#9B8674', marginTop: 30 },
  card: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#FFF', padding: 16, borderRadius: 12,
  },
  nome: { fontSize: 16, fontWeight: 'bold', color: '#2A1A12' },
  nivel: { fontSize: 13, color: '#9B8674', marginTop: 2 },
  botaoSeguir: {
    backgroundColor: '#D63E2A', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8,
  },
  botaoSeguirTexto: { color: '#FFF', fontWeight: 'bold' },
  botaoEnviado: { backgroundColor: '#F4ECD8' },
  botaoEnviadoTexto: { color: '#9B8674' },
});