import DicasFotoModal from '@/components/DicasFotoModal';
import { salvarAvaliacao } from '@/services/evaluationService';
import { avaliarPrato, ResultadoIA } from '@/services/iaService';
import { buscarProgresso, salvarProgresso } from '@/services/progressService';
import { uploadFoto } from '@/services/uploadService';
import { calcularXpDaMelhoria } from '@/utils/levelSystem';
import { useUserStore } from '@/viewmodels/userStore';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function Avaliar() {
  const { faseId, rewardXp, faseNome } = useLocalSearchParams<{
    faseId: string;
    rewardXp: string;
    faseNome: string;
  }>();

  const xpBase = Number(rewardXp) || 20;

  const meuId = useUserStore((state) => state.id);
  const meuNome = useUserStore((state) => state.name);
  const completarFase = useUserStore((state) => state.completarFase);

  const [foto, setFoto] = useState<string | null>(null);
  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoIA | null>(null);
  const [xpGanho, setXpGanho] = useState<number | null>(null);
  const [jaDominava, setJaDominava] = useState(false);

  const [legenda, setLegenda] = useState('');
  const [publicando, setPublicando] = useState(false);
  const [publicado, setPublicado] = useState(false);

  const invalido = resultado !== null && resultado.nota <= 1;

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
    setJaDominava(false);
    setPublicado(false);
    setLegenda('');

    try {
      setProcessando(true);
      const avaliacao = await avaliarPrato(base64!, faseNome || 'prato');
      setResultado(avaliacao);

      // só processa recompensa se o prato foi aceito (nota > 1)
      if (avaliacao.nota > 1) {
        // busca a melhor nota anterior nesta fase
        const progressoAnterior = await buscarProgresso(meuId, faseId || '');
        const melhorNotaAnterior = progressoAnterior ? progressoAnterior.bestStars : 0;

        // calcula o XP só pela melhoria
        const xp = calcularXpDaMelhoria(xpBase, avaliacao.nota, melhorNotaAnterior);

        if (xp > 0) {
          await completarFase(xp);
          setXpGanho(xp);
        } else {
          // não melhorou — já dominava a fase
          setJaDominava(true);
        }

        // atualiza o score se a nota nova for a melhor até agora
        if (avaliacao.nota > melhorNotaAnterior) {
          await salvarProgresso(meuId, faseId || '', avaliacao.nota);
        }
      }
    } catch (erro: any) {
      Alert.alert('Erro', erro.message);
    } finally {
      setProcessando(false);
    }
  }

  async function publicarNoFeed() {
    if (!foto || !resultado) return;
    try {
      setPublicando(true);
      const photoUrl = await uploadFoto(foto);
      await salvarAvaliacao({
        userId: meuId,
        userName: meuNome,
        phaseId: faseId || '',
        phaseName: faseNome || 'prato',
        stars: resultado.nota,
        feedback: resultado.feedback,
        caption: legenda.trim(),
        photoUrl: photoUrl,
        date: new Date().toISOString(),
      });
      setPublicado(true);
    } catch (erro: any) {
      console.log('ERRO AO PUBLICAR:', JSON.stringify(erro), erro?.message);
      Alert.alert('Erro', erro?.message || 'Não foi possível publicar. Tente novamente.');
    } finally {
      setPublicando(false);
    }
  }

  function corBarra(pontos: number): string {
    if (pontos >= 80) return '#4F7239';
    if (pontos >= 50) return '#E8A736';
    return '#D63E2A';
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.conteudo}>
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
          <ActivityIndicator size="large" color="#D63E2A" />
          <Text style={styles.processandoTexto}>Avaliando seu prato...</Text>
        </View>
      )}

      {invalido && (
        <View style={styles.invalidoBox}>
          <Text style={styles.invalidoIcone}>🤔</Text>
          <Text style={styles.invalidoTitulo}>Prato não reconhecido</Text>
          <Text style={styles.invalidoTexto}>{resultado.feedback}</Text>
        </View>
      )}

      {resultado && !invalido && (
        <View style={styles.resultado}>
          <Text style={styles.estrelas}>{'⭐'.repeat(resultado.nota)}</Text>
          <Text style={styles.notaTexto}>Nota: {resultado.nota}/5</Text>
          <Text style={styles.feedback}>{resultado.feedback}</Text>
          {xpGanho !== null && (
            <Text style={styles.xp}>+{xpGanho} XP · +10 moedas 🎉</Text>
          )}
          {jaDominava && (
            <Text style={styles.dominava}>Você já domina esta fase! Sem XP extra desta vez. 👏</Text>
          )}

          {resultado.criterios && resultado.criterios.length > 0 && (
            <View style={styles.criterios}>
              {resultado.criterios.map((c, i) => (
                <View key={i} style={styles.criterioItem}>
                  <View style={styles.criterioTopo}>
                    <Text style={styles.criterioNome}>{c.nome}</Text>
                    <Text style={styles.criterioPontos}>{c.pontos}</Text>
                  </View>
                  <View style={styles.barraFundo}>
                    <View
                      style={[
                        styles.barraPreenchida,
                        { width: `${c.pontos}%`, backgroundColor: corBarra(c.pontos) },
                      ]}
                    />
                  </View>
                  {c.comentario ? <Text style={styles.criterioComentario}>{c.comentario}</Text> : null}
                </View>
              ))}
            </View>
          )}

          {resultado.dica ? (
            <View style={styles.dicaBox}>
              <Text style={styles.dicaTitulo}>💡 Para melhorar</Text>
              <Text style={styles.dicaTexto}>{resultado.dica}</Text>
            </View>
          ) : null}
        </View>
      )}

      {resultado && !invalido && !publicado && (
        <View style={styles.publicarBox}>
          <Text style={styles.publicarTitulo}>Compartilhar no feed?</Text>
          <TextInput
            style={styles.inputLegenda}
            placeholder="Escreva uma legenda (opcional)"
            value={legenda}
            onChangeText={setLegenda}
            multiline
            maxLength={200}
          />
          <Pressable
            style={[styles.botao, publicando && styles.botaoDesativado]}
            onPress={publicarNoFeed}
            disabled={publicando}
          >
            {publicando ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.botaoTexto}>Publicar no feed</Text>
            )}
          </Pressable>
        </View>
      )}

      {publicado && <Text style={styles.publicadoMsg}>✓ Publicado no feed!</Text>}

      {invalido ? (
        <>
          <Pressable style={styles.botao} onPress={escolherFoto} disabled={processando}>
            <Text style={styles.botaoTexto}>Enviar outra foto</Text>
          </Pressable>
          <Pressable style={styles.botaoSecundario} onPress={() => router.back()}>
            <Text style={styles.botaoSecundarioTexto}>Voltar à trilha</Text>
          </Pressable>
        </>
      ) : resultado && !invalido ? (
        <Pressable style={styles.botaoSecundario} onPress={() => router.back()}>
          <Text style={styles.botaoSecundarioTexto}>Voltar à trilha</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.botao} onPress={escolherFoto} disabled={processando}>
          <Text style={styles.botaoTexto}>Escolher foto do prato</Text>
        </Pressable>
      )}
      <DicasFotoModal />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFF9F6' },
  conteudo: { padding: 24, gap: 16, alignItems: 'center', paddingBottom: 60 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#D63E2A' },
  subtitulo: { fontSize: 16, color: '#666666', textAlign: 'center' },
  foto: { width: 240, height: 240, borderRadius: 16 },
  placeholder: {
    width: 240, height: 240, borderRadius: 16,
    backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center',
  },
  placeholderTexto: { color: '#999999' },
  processando: { alignItems: 'center', gap: 8 },
  processandoTexto: { color: '#D63E2A', fontWeight: 'bold' },

  invalidoBox: {
    width: '100%', backgroundColor: '#FBE3DD', padding: 24, borderRadius: 16,
    alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#F5C6BA',
  },
  invalidoIcone: { fontSize: 40 },
  invalidoTitulo: { fontSize: 18, fontWeight: 'bold', color: '#8B3A1F' },
  invalidoTexto: { fontSize: 15, color: '#5c2b2e', textAlign: 'center', lineHeight: 21 },

  resultado: {
    alignItems: 'center', gap: 6, backgroundColor: '#FFFFFF',
    padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#FFD9C9',
    width: '100%',
  },
  estrelas: { fontSize: 28 },
  notaTexto: { fontSize: 18, fontWeight: 'bold', color: '#333333' },
  feedback: { fontSize: 15, color: '#666666', textAlign: 'center' },
  xp: { fontSize: 16, fontWeight: 'bold', color: '#4F7239', marginTop: 8 },
  dominava: { fontSize: 14, fontWeight: 'bold', color: '#9B8674', textAlign: 'center', marginTop: 8 },

  criterios: { width: '100%', gap: 14, marginTop: 12 },
  criterioItem: { width: '100%', gap: 4 },
  criterioTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  criterioNome: { fontSize: 14, fontWeight: 'bold', color: '#2A1A12' },
  criterioPontos: { fontSize: 14, fontWeight: 'bold', color: '#9B8674' },
  barraFundo: {
    width: '100%', height: 8, borderRadius: 4, backgroundColor: '#F0EEE9', overflow: 'hidden',
  },
  barraPreenchida: { height: 8, borderRadius: 4 },
  criterioComentario: { fontSize: 12, color: '#9B8674', fontStyle: 'italic' },

  dicaBox: {
    width: '100%', backgroundColor: '#FBE3DD', padding: 14, borderRadius: 12, gap: 4, marginTop: 8,
  },
  dicaTitulo: { fontSize: 14, fontWeight: 'bold', color: '#8B3A1F' },
  dicaTexto: { fontSize: 14, color: '#5c2b2e' },

  publicarBox: {
    width: '100%', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, gap: 12,
    borderWidth: 1, borderColor: '#F4ECD8',
  },
  publicarTitulo: { fontSize: 16, fontWeight: 'bold', color: '#2A1A12' },
  inputLegenda: {
    borderWidth: 1, borderColor: '#DDD', borderRadius: 10, padding: 12,
    fontSize: 15, minHeight: 60, textAlignVertical: 'top',
  },
  publicadoMsg: { fontSize: 16, fontWeight: 'bold', color: '#4F7239' },
  botao: {
    backgroundColor: '#D63E2A', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 10,
    alignItems: 'center', width: '100%',
  },
  botaoDesativado: { opacity: 0.6 },
  botaoTexto: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  botaoSecundario: {
    borderWidth: 1, borderColor: '#D63E2A', paddingVertical: 14, paddingHorizontal: 24,
    borderRadius: 10, alignItems: 'center', width: '100%',
  },
  botaoSecundarioTexto: { color: '#D63E2A', fontSize: 16, fontWeight: 'bold' },
});