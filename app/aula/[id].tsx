import { CONTEUDO_FASES } from '@/data/faseConteudo';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function Aula() {
  const { id, rewardXp, faseNome } = useLocalSearchParams<{
    id: string;
    rewardXp: string;
    faseNome: string;
  }>();

  const conteudo = CONTEUDO_FASES[id];
  const passos = conteudo?.passos ?? [];

  const [passoAtual, setPassoAtual] = useState(0);
  const [marcados, setMarcados] = useState<number[]>([]);
  const [segundos, setSegundos] = useState(0);
  const [rodando, setRodando] = useState(false);

  const passo = passos[passoAtual];
  const ehUltimo = passoAtual >= passos.length - 1;

  // reinicia o estado ao trocar de passo
  useEffect(() => {
    setMarcados([]);
    setSegundos(passos[passoAtual]?.tempoSegundos ?? 0);
    setRodando(false);
  }, [passoAtual]);

  // timer (conta regressiva quando "rodando")
  useEffect(() => {
    if (!rodando) return;
    const t = setInterval(() => {
      setSegundos((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [rodando]);

  // para o timer quando zera
  useEffect(() => {
    if (segundos === 0) setRodando(false);
  }, [segundos]);

  function toggleItem(i: number) {
    setMarcados((atual) => (atual.includes(i) ? atual.filter((x) => x !== i) : [...atual, i]));
  }

  function proximo() {
    if (ehUltimo) {
      router.replace({ pathname: '/avaliar', params: { faseId: id, rewardXp, faseNome } });
    } else {
      setPassoAtual(passoAtual + 1);
    }
  }

  function formatar(s: number) {
    const m = Math.floor(s / 60);
    const seg = s % 60;
    return `${String(m).padStart(2, '0')}:${String(seg).padStart(2, '0')}`;
  }

  // fase sem aula → vai direto pra foto
  if (!conteudo || passos.length === 0) {
    return (
      <View style={styles.centro}>
        <Text style={styles.semConteudo}>Esta fase ainda não tem aula.</Text>
        <Pressable
          style={styles.botao}
          onPress={() => router.replace({ pathname: '/avaliar', params: { faseId: id, rewardXp, faseNome } })}
        >
          <Text style={styles.botaoTexto}>Ir para a foto</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* topo: fechar + barra de progresso + contador */}
      <View style={styles.topo}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.fechar}>✕</Text>
        </Pressable>
        <View style={styles.barra}>
          {passos.map((_, i) => (
            <View
              key={i}
              style={[
                styles.barraSeg,
                i < passoAtual && styles.barraFeita,
                i === passoAtual && styles.barraAtual,
              ]}
            />
          ))}
        </View>
        <Text style={styles.contador}>{passoAtual + 1}/{passos.length}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.conteudo}>
        <Text style={styles.categoria}>PASSO {passoAtual + 1} · {passo.categoria}</Text>
        <Text style={styles.titulo}>{passo.titulo}</Text>

        <View style={styles.demo}>
          <Text style={styles.demoEmoji}>🍳</Text>
        </View>

        <Text style={styles.instrucao}>{passo.instrucao}</Text>

        {/* timer (só se o passo tiver tempo) */}
        {passo.tempoSegundos ? (
          <View style={styles.timerBox}>
            <View>
              <Text style={styles.timerLabel}>TEMPO ESTIMADO</Text>
              <Text style={styles.timerValor}>{formatar(segundos)}</Text>
            </View>
            <Pressable style={styles.timerBotao} onPress={() => setRodando((r) => !r)}>
              <Text style={styles.timerBotaoTexto}>{rodando ? 'Pausar' : 'Iniciar'}</Text>
            </Pressable>
          </View>
        ) : null}

        {/* checklist */}
        {passo.checklist.length > 0 && (
          <>
            <Text style={styles.secaoTitulo}>CHECKLIST</Text>
            <View style={styles.card}>
              {passo.checklist.map((item, i) => {
                const marcado = marcados.includes(i);
                return (
                  <Pressable
                    key={i}
                    style={[styles.checkLinha, i > 0 && styles.checkBorda]}
                    onPress={() => toggleItem(i)}
                  >
                    <View style={[styles.checkbox, marcado && styles.checkboxMarcado]}>
                      {marcado && <Text style={styles.check}>✓</Text>}
                    </View>
                    <Text style={[styles.checkTexto, marcado && styles.checkTextoMarcado]}>{item}</Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.rodape}>
        <Pressable style={styles.botao} onPress={proximo}>
          <Text style={styles.botaoTexto}>
            {ehUltimo ? 'Finalizar e enviar foto →' : 'Próximo passo →'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FBF6EC' },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FBF6EC', gap: 16, padding: 24 },
  semConteudo: { color: '#9B8674', fontSize: 15 },

  topo: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  fechar: { fontSize: 22, color: '#2A1A12', fontWeight: 'bold' },
  barra: { flex: 1, flexDirection: 'row', gap: 4, marginHorizontal: 4 },
  barraSeg: { flex: 1, height: 8, borderRadius: 4, backgroundColor: '#E6DFD3' },
  barraFeita: { backgroundColor: '#4F7239' },
  barraAtual: { backgroundColor: '#D63E2A' },
  contador: { fontSize: 13, color: '#9B8674', fontWeight: 'bold' },

  conteudo: { padding: 24, paddingTop: 12, paddingBottom: 120 },
  categoria: { fontSize: 12, fontWeight: 'bold', color: '#D63E2A', letterSpacing: 1 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#2A1A12', marginTop: 4 },
  demo: {
    width: '100%', height: 160, borderRadius: 16, backgroundColor: '#F4ECD8',
    justifyContent: 'center', alignItems: 'center', marginTop: 16, overflow: 'hidden',
  },
  demoEmoji: { fontSize: 54 },
  instrucao: { fontSize: 16, color: '#2A1A12', lineHeight: 24, marginTop: 16 },

  timerBox: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#FBEDD0', borderRadius: 14, padding: 16, marginTop: 20,
  },
  timerLabel: { fontSize: 11, fontWeight: 'bold', color: '#C68514', letterSpacing: 1 },
  timerValor: { fontSize: 26, fontWeight: 'bold', color: '#2A1A12', marginTop: 2 },
  timerBotao: { backgroundColor: '#FFF', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  timerBotaoTexto: { color: '#D63E2A', fontWeight: 'bold' },

  secaoTitulo: { fontSize: 12, fontWeight: 'bold', color: '#9B8674', letterSpacing: 1, marginTop: 24, marginBottom: 10 },
  card: { backgroundColor: '#FFF', borderRadius: 14, paddingHorizontal: 16 },
  checkLinha: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  checkBorda: { borderTopWidth: 1, borderTopColor: '#F0EEE9' },
  checkbox: {
    width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: '#D63E2A',
    justifyContent: 'center', alignItems: 'center',
  },
  checkboxMarcado: { backgroundColor: '#D63E2A' },
  check: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  checkTexto: { fontSize: 15, color: '#2A1A12', flex: 1 },
  checkTextoMarcado: { color: '#9B8674', textDecorationLine: 'line-through' },

  rodape: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 20, paddingBottom: 32, backgroundColor: '#FBF6EC', borderTopWidth: 1, borderTopColor: '#F0EEE9',
  },
  botao: { backgroundColor: '#D63E2A', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  botaoTexto: { color: '#FFF', fontSize: 17, fontWeight: 'bold' },
});