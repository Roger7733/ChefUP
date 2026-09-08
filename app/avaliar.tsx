import { uploadFoto } from '@/services/uploadService';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function Avaliar() {
  const [foto, setFoto] = useState<string | null>(null);
  const [urlNuvem, setUrlNuvem] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function escolherFoto() {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert('Permissão necessária', 'Precisamos acessar suas fotos para avaliar o prato.');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });

    if (!resultado.canceled) {
      const uriLocal = resultado.assets[0].uri;
      setFoto(uriLocal);
      setUrlNuvem(null);

      try {
        setEnviando(true);
        const url = await uploadFoto(uriLocal);
        setUrlNuvem(url);
      } catch (erro: any) {
        Alert.alert('Erro no upload', erro.message);
      } finally {
        setEnviando(false);
      }
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

      {enviando && <ActivityIndicator size="large" color="#FF6B35" />}

      {urlNuvem && (
        <Text style={styles.sucesso}>✅ Foto enviada para a nuvem!</Text>
      )}

      <Pressable style={styles.botao} onPress={escolherFoto} disabled={enviando}>
        <Text style={styles.botaoTexto}>Escolher foto do prato</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    backgroundColor: '#FFF9F6',
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FF6B35' },
  foto: { width: 280, height: 280, borderRadius: 16 },
  placeholder: {
    width: 280, height: 280, borderRadius: 16,
    backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center',
  },
  placeholderTexto: { color: '#999999' },
  sucesso: { color: '#4CAF50', fontWeight: 'bold', fontSize: 16 },
  botao: {
    backgroundColor: '#FF6B35', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 10,
  },
  botaoTexto: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});