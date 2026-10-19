import { World } from '@/models/World';
import { buscarFasesDoMundo } from '@/services/phaseService';
import { listarProgressoDoUsuario } from '@/services/progressService';
import { buscarMundos } from '@/services/worldService';
import { calcularNivel } from '@/utils/levelSystem';
import { useUserStore } from '@/viewmodels/userStore';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CODIGOS: Record<string, string> = {
  italiana: 'IT', japonesa: 'JP', francesa: 'FR', brasileira: 'BR', mexicana: 'MX',
};
const EMOJIS: Record<string, string> = {
  italiana: '🍝', japonesa: '🍣', francesa: '🥐', brasileira: '🍲', mexicana: '🌮',
};
function codigoPais(id: string): string {
  return CODIGOS[id] || id.slice(0, 2).toUpperCase();
}

function faixaNivel(xp: number, nivel: number) {
  let inicio = xp;
  while (inicio > 0 && calcularNivel(inicio - 1) === nivel) inicio--;
  let proximo = xp + 1;
  let guard = 0;
  while (calcularNivel(proximo) === nivel && guard < 50000) { proximo++; guard++; }
  return { inicio, proximo };
}

type InfoMundo = { total: number; concluidas: number };

export default function Index() {
  const insets = useSafeAreaInsets();

  const name = useUserStore((s) => s.name);
  const level = useUserStore((s) => s.level);
  const xp = useUserStore((s) => s.xp);
  const coins = useUserStore((s) => s.coins);
  const streak = useUserStore((s) => s.streak);
  const meuId = useUserStore((s) => s.id);

  const [mundos, setMundos] = useState<World[]>([]);
  const [infos, setInfos] = useState<Record<string, InfoMundo>>({});
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      async function carregar() {
        try {
          setCarregando(true);
          const lista = await buscarMundos();
          setMundos(lista);

          const progresso = await listarProgressoDoUsuario(meuId);
          const mapa: Record<string, InfoMundo> = {};
          await Promise.all(
            lista.map(async (m) => {
              const fases = await buscarFasesDoMundo(m.id);
              const concluidas = fases.filter((f) =>
                progresso.some((p) => p.phaseId === f.id && p.bestStars > 0)
              ).length;
              mapa[m.id] = { total: fases.length, concluidas };
            })
          );
          setInfos(mapa);
        } catch (erro: any) {
          console.log('ERRO AO CARREGAR MUNDOS:', erro?.message);
        } finally {
          setCarregando(false);
        }
      }
      carregar();
    }, [meuId])
  );

  const { inicio, proximo } = faixaNivel(xp, level);
  const pctNivel = Math.min(Math.max((xp - inicio) / Math.max(proximo - inicio, 1), 0), 1);

  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';

  const mundoAtual =
    mundos.find((m) => level >= m.minLevel && (infos[m.id]?.concluidas ?? 0) < (infos[m.id]?.total ?? 0)) ||
    mundos.find((m) => level >= m.minLevel);

  return (
    <View style={styles.screen}>
      {/* barra de stats */}
      <View style={[styles.topo, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.streak}>🔥 {streak}</Text>
        <View style={styles.nivelBadge}>
          <Text style={styles.nivelBadgeTexto}>{level}</Text>
        </View>
        <View style={styles.xpFundo}>
          <View style={[styles.xpFill, { width: `${pctNivel * 100}%` }]} />
        </View>
        <Text style={styles.moedas}>🪙 {coins}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.conteudo}>
        {/* saudação */}
        <Text style={styles.saudacao}>{saudacao}, {(name || 'chef').toUpperCase()}</Text>
        <Text style={styles.titulo}>O que vamos cozinhar?</Text>

        {/* continue de onde parou */}
        {mundoAtual && (
          <Pressable style={styles.continueCard} onPress={() => router.push(`/mundo/${mundoAtual.id}`)}>
            <View style={styles.continueIcone}>
              <Text style={{ fontSize: 24 }}>🔥</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.continueLabel}>STREAK · {streak} {streak === 1 ? 'DIA' : 'DIAS'}</Text>
              <Text style={styles.continueTitulo}>Continue de onde parou</Text>
            </View>
            <Text style={styles.continueSeta}>›</Text>
          </Pressable>
        )}

        <Text style={styles.secao}>MUNDOS</Text>

        {carregando ? (
          <ActivityIndicator size="large" color="#D63E2A" style={{ marginTop: 20 }} />
        ) : (
          mundos.map((mundo) => {
            const bloqueado = level < mundo.minLevel;
            const info = infos[mundo.id] ?? { total: 0, concluidas: 0 };
            const pct = info.total > 0 ? info.concluidas / info.total : 0;

            return (
              <Pressable
                key={mundo.id}
                style={[styles.card, bloqueado && styles.cardBloqueado]}
                disabled={bloqueado}
                onPress={() => router.push(`/mundo/${mundo.id}`)}
              >
                <View style={[styles.tile, bloqueado && styles.tileBloqueado]}>
                  <Text style={{ fontSize: 26 }}>{bloqueado ? '🔒' : EMOJIS[mundo.id] ?? '🍽️'}</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <View style={styles.cardTituloLinha}>
                    <Text style={[styles.cardBadge, bloqueado && styles.textoBloqueado]}>{codigoPais(mundo.id)}</Text>
                    <Text style={[styles.cardNome, bloqueado && styles.textoBloqueado]}>{mundo.name}</Text>
                  </View>

                  {bloqueado ? (
                    <Text style={styles.cardLock}>🔒 Desbloqueia no nível {mundo.minLevel}</Text>
                  ) : (
                    <View style={styles.progressoLinha}>
                      <View style={styles.progFundo}>
                        <View style={[styles.progFill, { width: `${pct * 100}%` }]} />
                      </View>
                      <Text style={styles.progTexto}>{info.concluidas}/{info.total}</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FBF6EC' },

  topo: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingBottom: 8 },
  streak: { fontSize: 15, fontWeight: 'bold', color: '#D63E2A' },
    nivelBadge: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#2A1A12', alignItems: 'center', justifyContent: 'center' },
  nivelBadgeTexto: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  xpFundo: { flex: 1, height: 8, borderRadius: 4, backgroundColor: '#EDE4D2', overflow: 'hidden' },
  xpFill: { height: 8, borderRadius: 4, backgroundColor: '#E8A736' },
  moedas: { fontSize: 15, fontWeight: 'bold', color: '#A9761A' },

  conteudo: { padding: 20, paddingBottom: 40, gap: 6 },
  saudacao: { fontSize: 12, fontWeight: 'bold', color: '#9B8674', letterSpacing: 1 },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#2A1A12', marginBottom: 10 },

  continueCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#C0392B', borderRadius: 16, padding: 16, marginBottom: 20,
  },
  continueIcone: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  continueLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  continueTitulo: { color: '#FFF', fontSize: 17, fontWeight: 'bold', marginTop: 2 },
  continueSeta: { color: '#FFF', fontSize: 26, fontWeight: '300' },

  secao: { fontSize: 12, fontWeight: 'bold', color: '#9B8674', letterSpacing: 1, marginBottom: 6 },

  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: '#F0E6D2',
  },
  cardBloqueado: { backgroundColor: '#F3EEE3', borderColor: '#EAE2D2' },
  tile: {
    width: 56, height: 56, borderRadius: 14, backgroundColor: '#FBEEDD',
    alignItems: 'center', justifyContent: 'center',
  },
  tileBloqueado: { backgroundColor: '#E7E0D2' },
  cardTituloLinha: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardBadge: { fontSize: 11, fontWeight: 'bold', color: '#9B8674', letterSpacing: 1 },
  cardNome: { fontSize: 18, fontWeight: 'bold', color: '#2A1A12' },
  textoBloqueado: { color: '#B3A796' },
  cardLock: { fontSize: 13, color: '#B3A796', marginTop: 4 },
  progressoLinha: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  progFundo: { flex: 1, height: 8, borderRadius: 4, backgroundColor: '#F0EEE9', overflow: 'hidden' },
  progFill: { height: 8, borderRadius: 4, backgroundColor: '#4F7239' },
  progTexto: { fontSize: 12, fontWeight: 'bold', color: '#9B8674' },
});