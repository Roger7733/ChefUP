import { avaliarPrato, ResultadoIA } from '@/services/iaService';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function Avaliar() {
  const [foto, setFoto] = useState<string | null>(null);
  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoIA | null>(null);

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

    try {
      setProcessando(true);
      const avaliacao = await avaliarPrato(base64!);
      setResultado(avaliacao);
    } catch (erro: any) {
      Alert.alert('Erro', erro.message);
    } finally {
      setProcessando(false);
    }
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Avaliar prato</Text>

      {foto ? (
        <Image source={{ uri: foto }} style={styles.foto} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderTexto}>Nenhuma foto ainda</Text>
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
          <Text style={styles.estrelas}>
            {'⭐'.repeat(resultado.nota)}
          </Text>
          <Text style={styles.notaTexto}>Nota: {resultado.nota}/5</Text>
          <Text style={styles.feedback}>{resultado.feedback}</Text>
        </View>
      )}

      <Pressable style={styles.botao} onPress={escolherFoto} disabled={processando}>
        <Text style={styles.botaoTexto}>Escolher foto do prato</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center',
    gap: 20, backgroundColor: '#FFF9F6',
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FF6B35' },
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
  botao: {
    backgroundColor: '#FF6B35', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 10,
  },
  botaoTexto: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});