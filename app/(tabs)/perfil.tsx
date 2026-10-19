import Avatar from '@/components/Avatar';
import { CONQUISTAS, Conquista } from '@/data/conquistas';
import { sair } from '@/services/authService';
import { listarProgressoDoUsuario } from '@/services/progressService';
import { calcularNivel } from '@/utils/levelSystem';
import { useUserStore } from '@/viewmodels/userStore';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function faixaNivel(xp: number, nivel: number) {
  let inicio = xp;
  while (inicio > 0 && calcularNivel(inicio - 1) === nivel) inicio--;
  let proximo = xp + 1;
  let guard = 0;
  while (calcularNivel(proximo) === nivel && guard < 50000) {
    proximo++;
    guard++;
  }
  return { inicio, proximo };
}

export default function Perfil() {
  const insets = useSafeAreaInsets();

  const name = useUserStore((s) => s.name);
  const email = useUserStore((s) => s.email);
  const coins = useUserStore((s) => s.coins);
  const xp = useUserStore((s) => s.xp);
  const level = useUserStore((s) => s.level);
  const streak = useUserStore((s) => s.streak);
  const userId = useUserStore((s) => s.id);

  const [fases, setFases] = useState(0);
  const [fases5, setFases5] = useState(0);
  const [selecionada, setSelecionada] = useState<Conquista | null>(null);

  useEffect(() => {
    async function carregar() {
      const progresso = await listarProgressoDoUsuario(userId);
      setFases(progresso.filter((p) => p.bestStars > 0).length);
      setFases5(progresso.filter((p) => p.bestStars === 5).length);
    }
    if (userId) carregar();
  }, [userId]);

  const { inicio, proximo } = faixaNivel(xp, level);
  const xpNoNivel = xp - inicio;
  const xpTotalNivel = Math.max(proximo - inicio, 1);
  const pct = Math.min(Math.max(xpNoNivel / xpTotalNivel, 0), 1);

  const usuario = email ? '@' + email.split('@')[0] : '';
  const dados = { level, fasesConcluidas: fases, fasesCincoEstrelas: fases5 };

  async function handleSair() {
    try {
      await sair();
    } catch (erro: any) {
      Alert.alert('Erro', 'Não foi possível sair. Tente novamente.');
    }
  }

  return (
    <>
      <ScrollView style={styles.screen} contentContainerStyle={[styles.conteudo, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.titulo}>Perfil</Text>

        {/* card principal */}
        <View style={styles.card}>
          <Avatar size={84} ring />
          <View style={styles.cardInfo}>
            <Text style={styles.nome}>{name || 'Chef'}</Text>
            {usuario ? <Text style={styles.usuario}>{usuario}</Text> : null}
            <View style={styles.nivelLinha}>
              <View style={styles.nivelBadge}>
                <Text style={styles.nivelBadgeTexto}>Nv {level}</Text>
              </View>
              <View style={styles.barraFundo}>
                <View style={[styles.barraPreenchida, { width: `${pct * 100}%` }]} />
              </View>
            </View>
            <Text style={styles.xpLabel}>
              {xpNoNivel} / {xpTotalNivel} XP para o nível {level + 1}
            </Text>
          </View>
        </View>

        {/* estatísticas */}
        <View style={styles.tiles}>
          <View style={styles.tile}>
            <Text style={styles.tileNumero}>🔥 {streak}</Text>
            <Text style={styles.tileLabel}>dias seguidos</Text>
          </View>
          <View style={styles.tile}>
            <Text style={styles.tileNumero}>⭐ {fases}</Text>
            <Text style={styles.tileLabel}>fases</Text>
          </View>
          <View style={styles.tile}>
            <Text style={styles.tileNumero}>🪙 {coins}</Text>
            <Text style={styles.tileLabel}>moedas</Text>
          </View>
        </View>

        {/* conquistas */}
        <Text style={styles.secao}>Conquistas</Text>
        <View style={styles.conquistas}>
          {CONQUISTAS.map((c) => {
            const atual = c.atual(dados);
            const desbloqueada = atual >= c.meta;
            return (
              <Pressable
                key={c.id}
                onPress={() => setSelecionada(c)}
                style={[styles.conquista, desbloqueada && styles.conquistaDesbloqueada]}
              >
                <View style={[styles.iconeBox, desbloqueada && styles.iconeBoxOuro]}>
                  <Text style={styles.conquistaIcone}>{c.icone}</Text>
                </View>
                <View style={styles.conquistaInfo}>
                  <Text style={styles.conquistaTitulo}>{c.titulo}</Text>
                  {!desbloqueada && (
                    <Text style={styles.conquistaStatus}>
                      {Math.min(atual, c.meta)} / {c.meta}
                    </Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* ações */}
        <Pressable style={styles.botaoPrimario} onPress={() => router.push('/loja')}>
          <Text style={styles.botaoPrimarioTexto}>Personalizar chef</Text>
        </Pressable>

        <Pressable style={styles.botaoSair} onPress={handleSair}>
          <Text style={styles.botaoSairTexto}>Sair da conta</Text>
        </Pressable>
      </ScrollView>

      {/* detalhe da conquista */}
      <Modal
        visible={selecionada !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelecionada(null)}
      >
        <Pressable style={styles.modalFundo} onPress={() => setSelecionada(null)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            {selecionada && (
              <>
                {(() => {
                  const atual = selecionada.atual(dados);
                  const desbloqueada = atual >= selecionada.meta;
                  return (
                    <>
                      <View style={[styles.modalIcone, desbloqueada && styles.iconeBoxOuro]}>
                        <Text style={{ fontSize: 34 }}>{selecionada.icone}</Text>
                      </View>
                      <Text style={styles.modalTitulo}>{selecionada.titulo}</Text>
                      <Text style={styles.modalDesc}>{selecionada.descricao}</Text>
                      <Text style={desbloqueada ? styles.modalFeito : styles.modalProgresso}>
                        {desbloqueada
                          ? '✓ Conquista desbloqueada!'
                          : `Progresso: ${Math.min(atual, selecionada.meta)} / ${selecionada.meta}`}
                      </Text>
                      <Pressable style={styles.modalBotao} onPress={() => setSelecionada(null)}>
                        <Text style={styles.modalBotaoTexto}>Fechar</Text>
                      </Pressable>
                    </>
                  );
                })()}
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FBF6EC' },
  conteudo: { padding: 20, gap: 16, paddingBottom: 40 },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#2A1A12' },

  card: {
    backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 1, borderColor: '#F0E6D2',
  },
  cardInfo: { flex: 1, gap: 4 },
  nome: { fontSize: 18, fontWeight: 'bold', color: '#2A1A12' },
  usuario: { fontSize: 13, color: '#9B8674' },
  nivelLinha: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  nivelBadge: { backgroundColor: '#E8A736', borderRadius: 10, paddingVertical: 2, paddingHorizontal: 8 },
  nivelBadgeTexto: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
  barraFundo: { flex: 1, height: 8, borderRadius: 4, backgroundColor: '#F0EEE9', overflow: 'hidden' },
  barraPreenchida: { height: 8, borderRadius: 4, backgroundColor: '#D63E2A' },
  xpLabel: { fontSize: 12, color: '#9B8674', marginTop: 2 },

  tiles: { flexDirection: 'row', gap: 12 },
  tile: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, paddingVertical: 16,
    alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#F0E6D2',
  },
  tileNumero: { fontSize: 18, fontWeight: 'bold', color: '#2A1A12' },
  tileLabel: { fontSize: 12, color: '#9B8674' },

  secao: { fontSize: 18, fontWeight: 'bold', color: '#2A1A12', marginTop: 4 },
  conquistas: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  conquista: {
    width: '47%', flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: '#F0E6D2',
  },
  conquistaDesbloqueada: { backgroundColor: '#FBEFD9', borderColor: '#EAD29A' },
  iconeBox: {
    width: 38, height: 38, borderRadius: 10, backgroundColor: '#F0EEE9',
    alignItems: 'center', justifyContent: 'center',
  },
  iconeBoxOuro: { backgroundColor: '#F3DFA2' },
  conquistaIcone: { fontSize: 20 },
  conquistaInfo: { flex: 1 },
  conquistaTitulo: { fontSize: 12, fontWeight: 'bold', color: '#2A1A12' },
  conquistaStatus: { fontSize: 11, color: '#9B8674', marginTop: 1 },

  modalFundo: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center', alignItems: 'center', padding: 30,
  },
  modalCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, alignItems: 'center', gap: 10, width: '100%' },
  modalIcone: {
    width: 64, height: 64, borderRadius: 16, backgroundColor: '#F0EEE9',
    alignItems: 'center', justifyContent: 'center',
  },
  modalTitulo: { fontSize: 18, fontWeight: 'bold', color: '#2A1A12', textAlign: 'center' },
  modalDesc: { fontSize: 14, color: '#6B5D50', textAlign: 'center' },
  modalFeito: { fontSize: 14, fontWeight: 'bold', color: '#4F7239', marginTop: 2 },
  modalProgresso: { fontSize: 14, fontWeight: 'bold', color: '#C9A24A', marginTop: 2 },
  modalBotao: { backgroundColor: '#D63E2A', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 10, marginTop: 8 },
  modalBotaoTexto: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },

  botaoPrimario: { backgroundColor: '#D63E2A', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 4 },
  botaoPrimarioTexto: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  botaoSair: { borderWidth: 1, borderColor: '#D63E2A', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  botaoSairTexto: { color: '#D63E2A', fontSize: 16, fontWeight: 'bold' },
});