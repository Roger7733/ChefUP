import { avaliarPrato, ResultadoIA } from '@/services/iaService';
import { calcularXpDaNota } from '@/utils/levelSystem';
import { useUserStore } from '@/viewmodels/userStore';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function Avaliar() {
  const { rewardXp, faseNome } = useLocalSearchParams<{
    faseId: string;
    rewardXp: string;
    faseNome: string;
  }>();

  const xpBase = Number(rewardXp) || 20;

  const [foto, setFoto] = useState<string | null>(null);
  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoIA | null>(null);
  const [xpGanho, setXpGanho] = useState<number | null>(null);

  const completarFase = useUserStore((state) => state.completarFase);

  async function escolherFoto() {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert('Permissão necessária', 'Precisamos acessar suas fotos para avaliar o prato.');
      return;
    }

    const selecao = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      base64: true,
    });

    if (selecao.canceled) return;

    const uriLocal = selecao.assets[0].uri;
    const base64 = selecao.assets[0].base64;
    setFoto(uriLocal);
    setResultado(null);
    setXpGanho(null);

    try {
      setProcessando(true);
      const avaliacao = await avaliarPrato(base64!, faseNome || 'prato');
      setResultado(avaliacao);

      const xp = calcularXpDaNota(xpBase, avaliacao.nota);
      await completarFase(xp);
      setXpGanho(xp);
    } catch (erro: any) {
      Alert.alert('Erro', erro.message);
    } finally {
      setProcessando(false);
    }
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Avaliar prato</Text>
      {faseNome && <Text style={styles.subtitulo}>{faseNome}</Text>}

      {foto ? (
        <Image source={{ uri: foto }} style={styles.foto} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderTexto}>Fotografe seu prato</Text>
        </View>
      )}

      {processando && (
        <View style={styles.processando}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.processandoTexto}>Avaliando seu prato...</Text>
        </View>
      )}

      {resultado && (
        <View style={styles.resultado}>
          <Text style={styles.estrelas}>{'⭐'.repeat(resultado.nota)}</Text>
          <Text style={styles.notaTexto}>Nota: {resultado.nota}/5</Text>
          <Text style={styles.feedback}>{resultado.feedback}</Text>
          {xpGanho !== null && (
            <Text style={styles.xp}>+{xpGanho} XP · +10 moedas 🎉</Text>
          )}
        </View>
      )}

      {xpGanho !== null ? (
        <Pressable style={styles.botao} onPress={() => router.back()}>
          <Text style={styles.botaoTexto}>Voltar à trilha</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.botao} onPress={escolherFoto} disabled={processando}>
          <Text style={styles.botaoTexto}>Escolher foto do prato</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center',
    gap: 16, backgroundColor: '#FFF9F6',
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FF6B35' },
  subtitulo: { fontSize: 16, color: '#666666', textAlign: 'center' },
  foto: { width: 240, height: 240, borderRadius: 16 },
  placeholder: {
    width: 240, height: 240, borderRadius: 16,
    backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center',
  },
  placeholderTexto: { color: '#999999' },
  processando: { alignItems: 'center', gap: 8 },
  processandoTexto: { color: '#FF6B35', fontWeight: 'bold' },
  resultado: {
    alignItems: 'center', gap: 6, backgroundColor: '#FFFFFF',
    padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#FFD9C9',
    width: '100%',
  },
  estrelas: { fontSize: 28 },
  notaTexto: { fontSize: 18, fontWeight: 'bold', color: '#333333' },
  feedback: { fontSize: 15, color: '#666666', textAlign: 'center' },
  xp: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50', marginTop: 8 },
  botao: {
    backgroundColor: '#FF6B35', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 10,
  },
  botaoTexto: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});