import { Phase } from '@/models/Phase';
import { Progress } from '@/models/Progress';
import { buscarFasesDoMundo } from '@/services/phaseService';
import { listarProgressoDoUsuario } from '@/services/progressService';
import { useUserStore } from '@/viewmodels/userStore';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CODIGOS: Record<string, string> = {
  italiana: 'IT', japonesa: 'JP', francesa: 'FR', brasileira: 'BR', mexicana: 'MX',
};
function codigoPais(id: string): string {
  return CODIGOS[id] || id.slice(0, 2).toUpperCase();
}
function nomeMundo(id: string): string {
  return id.charAt(0).toUpperCase() + id.slice(1);
}

const GRAD_PROXIMA = ['#D63E2A', '#F39C12'] as const;

export default function MundoScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [fases, setFases] = useState<Phase[]>([]);
  const [progressos, setProgressos] = useState<Progress[]>([]);
  const [carregando, setCarregando] = useState(true);

  const streak = useUserStore((state) => state.streak);
  const meuId = useUserStore((state) => state.id);

  useFocusEffect(
    useCallback(() => {
      async function carregar() {
        try {
          setCarregando(true);
          const [listaFases, listaProgresso] = await Promise.all([
            buscarFasesDoMundo(id),
            listarProgressoDoUsuario(meuId),
          ]);
          setFases(listaFases);
          setProgressos(listaProgresso);
        } catch (erro: any) {
          console.log('ERRO AO CARREGAR TRILHA:', erro?.message);
        } finally {
          setCarregando(false);
        }
      }
      carregar();
    }, [id, meuId])
  );

  function progressoDaFase(faseId: string): Progress | null {
    return progressos.find((p) => p.phaseId === faseId) || null;
  }

  function faseLiberada(indice: number): boolean {
    if (indice === 0) return true;
    const anterior = fases[indice - 1];
    return progressoDaFase(anterior.id) !== null;
  }

  if (carregando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color="#D63E2A" />
      </View>
    );
  }

  const totalFases = fases.length;
  const concluidas = fases.filter((f) => progressoDaFase(f.id) !== null).length;
  const proximaIndice = fases.findIndex((f, i) => faseLiberada(i) && progressoDaFase(f.id) === null);
  const proximaFase = proximaIndice >= 0 ? fases[proximaIndice] : null;

  function abrirFase(fase: Phase) {
    router.push({
      pathname: '/fase/[id]',
      params: { id: fase.id, rewardXp: fase.rewardXp, faseNome: fase.name, faseTipo: fase.type },
    });
  }

  return (
    <View style={styles.screen}>
      {/* CABEÇALHO */}
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <View style={styles.headerTopo}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Text style={styles.voltar}>‹</Text>
          </Pressable>
          <Text style={styles.streak}>🔥 {streak}</Text>
        </View>

        <View style={styles.tituloLinha}>
          <View style={styles.badge}>
            <Text style={styles.badgeTexto}>{codigoPais(id)}</Text>
          </View>
          <Text style={styles.mundoNome}>{nomeMundo(id)}</Text>
        </View>
        <Text style={styles.subtitulo}>{concluidas} de {totalFases} fases concluídas</Text>
      </View>

      <ScrollView contentContainerStyle={styles.conteudo}>
        {/* CARD PRÓXIMA FASE */}
        {proximaFase ? (
          <Pressable onPress={() => abrirFase(proximaFase)}>
            <LinearGradient
              colors={GRAD_PROXIMA}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.proximaCard}
            >
              <View style={styles.proximaIcone}>
                <Text style={{ fontSize: 26 }}>
                  {proximaFase.type === 'technique' ? '🔪' : '🍝'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.proximaLabel}>PRÓXIMA FASE</Text>
                <Text style={styles.proximaNome}>{proximaFase.name}</Text>
                <Text style={styles.proximaInfo}>
                  {proximaFase.type === 'technique' ? 'Técnica' : 'Receita'} · +{proximaFase.rewardXp} XP
                </Text>
              </View>
              <Text style={styles.proximaSeta}>›</Text>
            </LinearGradient>
          </Pressable>
        ) : (
          <View style={styles.concluidoCard}>
            <Text style={styles.concluidoTexto}>🎉 Mundo concluído! Parabéns, chef!</Text>
          </View>
        )}

        {/* TRILHA */}
        <View style={styles.trilha}>
          {fases.map((fase, indice) => {
            const progresso = progressoDaFase(fase.id);
            const concluida = progresso !== null;
            const liberada = faseLiberada(indice);

            const offset = Math.round(-Math.cos(indice * (Math.PI / 3)) * 85);

            return (
              <View key={`${fase.id}-${indice}`} style={styles.faseRow}>
                <View style={[styles.node, { transform: [{ translateX: offset }] }]}>
                  <Pressable
                    style={[
                      styles.fase,
                      concluida && styles.faseConcluida,
                      !liberada && styles.faseBloqueada,
                    ]}
                    disabled={!liberada}
                    onPress={() => abrirFase(fase)}
                  >
                    {!liberada ? (
                      <Text style={styles.cadeado}>🔒</Text>
                    ) : concluida ? (
                      <Text style={styles.check}>✓</Text>
                    ) : (
                      <Text style={styles.faseNumero}>{indice + 1}</Text>
                    )}
                  </Pressable>

                  {concluida && (
                    <View style={styles.estrelasPill}>
                      <Text style={styles.estrelas}>
                        {'⭐'.repeat(progresso!.bestStars)}
                        <Text style={styles.estrelasVazias}>{'☆'.repeat(5 - progresso!.bestStars)}</Text>
                      </Text>
                    </View>
                  )}

                  <Text style={[styles.faseNome, !liberada && styles.faseNomeBloqueada]}>
                    {fase.name}
                  </Text>
                  <Text style={styles.tipoFase}>
                    {fase.type === 'technique' ? 'TÉCNICA' : 'RECEITA'} · +{fase.rewardXp} XP
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FBF6EC' },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FBF6EC' },

  header: { paddingHorizontal: 20, paddingBottom: 12, backgroundColor: '#FBF6EC' },
  headerTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  voltar: { fontSize: 32, color: '#2A1A12', fontWeight: '300', lineHeight: 34 },
  streak: { fontSize: 16, fontWeight: 'bold', color: '#D63E2A' },
  tituloLinha: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  badge: { backgroundColor: '#F4ECD8', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeTexto: { fontSize: 13, fontWeight: 'bold', color: '#9B8674', letterSpacing: 1 },
  mundoNome: { fontSize: 28, fontWeight: 'bold', color: '#2A1A12' },
  subtitulo: { fontSize: 13, color: '#9B8674', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },

  conteudo: { padding: 24, paddingTop: 12, paddingBottom: 60 },

  proximaCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: 18, padding: 18, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2, shadowRadius: 6, elevation: 5,
  },
  proximaIcone: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
  },
  proximaLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  proximaNome: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginTop: 2 },
  proximaInfo: { color: 'rgba(255,255,255,0.9)', fontSize: 13, marginTop: 2 },
  proximaSeta: { color: '#FFF', fontSize: 28, fontWeight: '300' },

  concluidoCard: {
    backgroundColor: '#FFF', borderRadius: 18, padding: 20, alignItems: 'center', marginBottom: 24,
    borderWidth: 1, borderColor: '#DDE7CE',
  },
  concluidoTexto: { fontSize: 16, fontWeight: 'bold', color: '#4F7239', textAlign: 'center' },

  trilha: { gap: 30 },
  faseRow: { width: '100%', alignItems: 'center' },
  node: { alignItems: 'center' },

  fase: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#D63E2A',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 4, borderColor: '#B0301F',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
  },
  faseConcluida: { backgroundColor: '#4F7239', borderColor: '#3A5429' },
  faseBloqueada: { backgroundColor: '#D6CFC4', borderColor: '#BDB5A8' },
  faseNumero: { color: '#FFFFFF', fontSize: 26, fontWeight: 'bold' },
  check: { color: '#FFFFFF', fontSize: 34, fontWeight: 'bold' },
  cadeado: { fontSize: 26 },

  estrelasPill: {
    backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2, marginTop: -10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15, shadowRadius: 2, elevation: 3,
  },
  estrelas: { fontSize: 13 },
  estrelasVazias: { color: '#D6CFC4' },

  faseNome: { fontSize: 15, fontWeight: 'bold', color: '#2A1A12', marginTop: 6, textAlign: 'center', maxWidth: 150 },
  faseNomeBloqueada: { color: '#9B8674' },
  tipoFase: { fontSize: 11, color: '#9B8674', marginTop: 2, letterSpacing: 0.5, textAlign: 'center' },
});