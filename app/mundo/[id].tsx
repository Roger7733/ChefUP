import { Phase } from '@/models/Phase';
import { Progress } from '@/models/Progress';
import { buscarFasesDoMundo } from '@/services/phaseService';
import { listarProgressoDoUsuario } from '@/services/progressService';
import { useUserStore } from '@/viewmodels/userStore';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function MundoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [fases, setFases] = useState<Phase[]>([]);
  const [progressos, setProgressos] = useState<Progress[]>([]);
  const [carregando, setCarregando] = useState(true);

  const xp = useUserStore((state) => state.xp);
  const level = useUserStore((state) => state.level);
  const coins = useUserStore((state) => state.coins);
  const meuId = useUserStore((state) => state.id);

  // recarrega toda vez que a tela ganha foco (ao voltar de avaliar)
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

  // retorna o progresso de uma fase (ou null se não fez)
  function progressoDaFase(faseId: string): Progress | null {
    return progressos.find((p) => p.phaseId === faseId) || null;
  }

  // uma fase está liberada se é a primeira OU se a anterior foi concluída
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

  return (
    <View style={styles.screen}>
      <View style={styles.painel}>
        <Text style={styles.painelTexto}>Nível {level}</Text>
        <Text style={styles.painelTexto}>{xp} XP</Text>
        <Text style={styles.painelTexto}>{coins} 🪙</Text>
      </View>

      <ScrollView contentContainerStyle={styles.trilha}>
        {fases.map((fase, indice) => {
          const progresso = progressoDaFase(fase.id);
          const concluida = progresso !== null;
          const liberada = faseLiberada(indice);
          const alinhamento = indice % 2 === 0 ? 'flex-start' : 'flex-end';

          return (
            <View key={fase.id} style={[styles.faseWrapper, { alignItems: alinhamento }]}>
              <Pressable
                style={[
                  styles.fase,
                  concluida && styles.faseConcluida,
                  !liberada && styles.faseBloqueada,
                ]}
                disabled={!liberada}
                onPress={() =>
                  router.push({
                    pathname: '/avaliar',
                    params: { faseId: fase.id, rewardXp: fase.rewardXp, faseNome: fase.name },
                  })
                }
              >
                {!liberada ? (
                  <Text style={styles.cadeado}>🔒</Text>
                ) : (
                  <Text style={styles.faseNumero}>{indice + 1}</Text>
                )}
              </Pressable>

              {/* estrelas conquistadas (só se concluída) */}
              {concluida && (
                <Text style={styles.estrelas}>
                  {'⭐'.repeat(progresso!.bestStars)}
                  <Text style={styles.estrelasVazias}>{'☆'.repeat(5 - progresso!.bestStars)}</Text>
                </Text>
              )}

              <Text style={[styles.faseNome, !liberada && styles.faseNomeBloqueada]}>
                {fase.name}
              </Text>
              <Text style={styles.tipoFase}>
                {fase.type === 'technique' ? 'Técnica' : 'Receita'} · +{fase.rewardXp} XP
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FBF6EC' },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FBF6EC' },
  painel: {
    flexDirection: 'row', justifyContent: 'space-around',
    backgroundColor: '#D63E2A', paddingVertical: 16, paddingHorizontal: 16,
    paddingTop: 50,
  },
  painelTexto: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  trilha: { padding: 24, gap: 32 },
  faseWrapper: { width: '100%' },
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
  cadeado: { fontSize: 26 },
  estrelas: { fontSize: 16, marginTop: 6 },
  estrelasVazias: { color: '#D6CFC4' },
  faseNome: { fontSize: 15, fontWeight: 'bold', color: '#2A1A12', marginTop: 4, maxWidth: 180 },
  faseNomeBloqueada: { color: '#9B8674' },
  tipoFase: { fontSize: 12, color: '#9B8674', marginTop: 2 },
});