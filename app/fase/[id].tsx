import { CONTEUDO_FASES } from '@/data/faseConteudo';
import { router, useLocalSearchParams } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

// fotos dos pratos — adicione aqui conforme for colocando as imagens em assets/pratos/
const IMAGENS_PRATOS: Record<string, any> = {
  'italiana-1': require('../../assets/pratos/massa-al-dente.png'),
};

export default function FaseIntro() {
  const { id, rewardXp, faseNome, faseTipo } = useLocalSearchParams<{
    id: string;
    rewardXp: string;
    faseNome: string;
    faseTipo: string;
  }>();

  const conteudo = CONTEUDO_FASES[id];
  const xp = Number(rewardXp) || 20;
  const numero = id?.split('-')[1] || '';
  const cuisine = (id?.split('-')[0] || '').toUpperCase();
  const ehTecnica = faseTipo === 'technique';

  function comecar() {
    router.replace({
      pathname: '/aula/[id]',
      params: { id, rewardXp, faseNome },
    });
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.voltar}>‹</Text>
        </Pressable>
        <Text style={styles.headerLabel}>FASE {numero} · {cuisine}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.conteudo}>
        {/* foto do prato (ou emoji, se não houver foto) */}
        <View style={styles.hero}>
          {IMAGENS_PRATOS[id] ? (
            <Image source={IMAGENS_PRATOS[id]} style={styles.heroImagem} resizeMode="cover" />
          ) : (
            <Text style={styles.heroEmoji}>{ehTecnica ? '🔪' : '🍝'}</Text>
          )}
        </View>

        <Text style={styles.titulo}>{faseNome}</Text>

        {conteudo ? (
          <>
            <Text style={styles.descricao}>{conteudo.descricao}</Text>

            <View style={styles.chips}>
              <View style={styles.chip}><Text style={styles.chipTexto}>⏱ {conteudo.tempoMin} min</Text></View>
              <View style={[styles.chip, styles.chipTipo]}>
                <Text style={[styles.chipTexto, styles.chipTipoTexto]}>{ehTecnica ? 'Técnica' : 'Receita'}</Text>
              </View>
              <View style={[styles.chip, styles.chipDif]}>
                <Text style={[styles.chipTexto, styles.chipDifTexto]}>{conteudo.dificuldade}</Text>
              </View>
            </View>

            <Text style={styles.secaoTitulo}>VOCÊ VAI PRECISAR</Text>
            <View style={styles.card}>
              {conteudo.ingredientes.map((ing, i) => (
                <View key={i} style={[styles.ingLinha, i > 0 && styles.ingBorda]}>
                  <Text style={styles.ingNome}>{ing.nome}</Text>
                  <Text style={styles.ingQtd}>{ing.quantidade}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.secaoTitulo}>RECOMPENSAS</Text>
            <View style={styles.recompensas}>
              <View style={styles.recompensaCard}>
                <Text style={styles.recompensaValor}>+{xp}</Text>
                <Text style={styles.recompensaLabel}>XP</Text>
              </View>
              <View style={styles.recompensaCard}>
                <Text style={styles.recompensaValor}>+10</Text>
                <Text style={styles.recompensaLabel}>moedas</Text>
              </View>
            </View>
          </>
        ) : (
          <Text style={styles.semConteudo}>Conteúdo desta fase em breve.</Text>
        )}
      </ScrollView>

      <View style={styles.rodape}>
        <Pressable style={styles.botao} onPress={comecar}>
          <Text style={styles.botaoTexto}>Começar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FBF6EC' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 50, paddingHorizontal: 20, paddingBottom: 10,
  },
  voltar: { fontSize: 32, color: '#2A1A12', fontWeight: '300', lineHeight: 34 },
  headerLabel: { fontSize: 12, fontWeight: 'bold', color: '#9B8674', letterSpacing: 1 },

  conteudo: { padding: 24, paddingTop: 10, paddingBottom: 120 },
  hero: {
    width: '100%', height: 180, borderRadius: 18, backgroundColor: '#F4ECD8',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16, overflow: 'hidden',
  },
  heroEmoji: { fontSize: 64 },
  heroImagem: { width: '100%', height: '100%', borderRadius: 18 },

  titulo: { fontSize: 26, fontWeight: 'bold', color: '#2A1A12' },
  descricao: { fontSize: 15, color: '#6B5544', lineHeight: 22, marginTop: 8 },

  chips: { flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap' },
  chip: { backgroundColor: '#FBEDD0', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12 },
  chipTexto: { fontSize: 13, fontWeight: 'bold', color: '#C68514' },
  chipTipo: { backgroundColor: '#FBE3DD' },
  chipTipoTexto: { color: '#C0392B' },
  chipDif: { backgroundColor: '#DDE7CE' },
  chipDifTexto: { color: '#4F7239' },

  secaoTitulo: { fontSize: 12, fontWeight: 'bold', color: '#9B8674', letterSpacing: 1, marginTop: 24, marginBottom: 10 },
  card: { backgroundColor: '#FFF', borderRadius: 14, paddingHorizontal: 16 },
  ingLinha: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14 },
  ingBorda: { borderTopWidth: 1, borderTopColor: '#F0EEE9' },
  ingNome: { fontSize: 15, color: '#2A1A12', fontWeight: '600' },
  ingQtd: { fontSize: 15, color: '#9B8674' },

  recompensas: { flexDirection: 'row', gap: 12 },
  recompensaCard: {
    flex: 1, backgroundColor: '#FFF', borderRadius: 14, paddingVertical: 16, alignItems: 'center',
    borderWidth: 1, borderColor: '#FBEDD0',
  },
  recompensaValor: { fontSize: 24, fontWeight: 'bold', color: '#E8A736' },
  recompensaLabel: { fontSize: 12, color: '#9B8674', marginTop: 2 },

  semConteudo: { fontSize: 15, color: '#9B8674', marginTop: 16, fontStyle: 'italic' },

  rodape: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 20, paddingBottom: 32, backgroundColor: '#FBF6EC',
    borderTopWidth: 1, borderTopColor: '#F0EEE9',
  },
  botao: {
    backgroundColor: '#D63E2A', paddingVertical: 16, borderRadius: 12, alignItems: 'center',
  },
  botaoTexto: { color: '#FFF', fontSize: 17, fontWeight: 'bold' },
});