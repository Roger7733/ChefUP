import Avatar from '@/components/Avatar';
import { Item } from '@/models/Item';
import { buscarInventario, buscarItens } from '@/services/shopService';
import { useUserStore } from '@/viewmodels/userStore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type Aba = 'chapeu' | 'avental' | 'utensilio';

const ABAS: { key: Aba; label: string }[] = [
  { key: 'chapeu', label: 'Chapéus' },
  { key: 'avental', label: 'Aventais' },
  { key: 'utensilio', label: 'Utensílios' },
];

export default function Loja() {
  const [itens, setItens] = useState<Item[]>([]);
  const [comprados, setComprados] = useState<string[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [aba, setAba] = useState<Aba>('chapeu');
  const [selecionado, setSelecionado] = useState<Item | null>(null);

  const coins = useUserStore((s) => s.coins);
  const level = useUserStore((s) => s.level);
  const userId = useUserStore((s) => s.id);
  const equippedHat = useUserStore((s) => s.equippedHat);
  const comprarItem = useUserStore((s) => s.comprarItem);
  const equiparChapeu = useUserStore((s) => s.equiparChapeu);

  useEffect(() => {
    async function carregar() {
      try {
        const listaItens = await buscarItens();
        setItens(listaItens);

        const inventario = await buscarInventario(userId);
        setComprados(inventario.map((ui) => ui.itemId));

        // começa mostrando o chapéu equipado na prévia
        const equipadoItem = listaItens.find((i) => i.category === 'chapeu' && i.avatarHat === equippedHat);
        setSelecionado(equipadoItem ?? listaItens.find((i) => i.category === 'chapeu') ?? null);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [userId]);

  async function handleComprar(item: Item) {
    const sucesso = await comprarItem(item.id, item.price);
    if (sucesso) {
      setComprados((a) => [...a, item.id]);
      await equiparChapeu(item.avatarHat);
    }
  }

  function renderBotaoPreview() {
    if (!selecionado) return null;
    const item = selecionado;
    const possui = comprados.includes(item.id) || item.price === 0;
    const equipado = item.avatarHat === equippedHat;
    const bloqueado = level < item.minLevel;
    const podePagar = coins >= item.price;

    if (equipado) {
      return (
        <View style={[styles.botao, styles.botaoEquipado]}>
          <Text style={styles.botaoTextoClaro}>Equipado</Text>
        </View>
      );
    }
    if (bloqueado) {
      return (
        <View style={[styles.botao, styles.botaoBloqueado]}>
          <Text style={styles.botaoTextoEscuro}>🔒 Nível {item.minLevel}</Text>
        </View>
      );
    }
    if (possui) {
      return (
        <Pressable style={[styles.botao, styles.botaoEquipar]} onPress={() => equiparChapeu(item.avatarHat)}>
          <Text style={styles.botaoTextoClaro}>Equipar</Text>
        </Pressable>
      );
    }
    if (podePagar) {
      return (
        <Pressable style={[styles.botao, styles.botaoComprar]} onPress={() => handleComprar(item)}>
          <Text style={styles.botaoTextoClaro}>Comprar</Text>
        </Pressable>
      );
    }
    return (
      <View style={[styles.botao, styles.botaoBloqueado]}>
        <Text style={styles.botaoTextoEscuro}>Faltam moedas</Text>
      </View>
    );
  }

  const itensAba = itens.filter((i) => i.category === aba);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Loja</Text>
        <View style={styles.moedasPill}>
          <Text style={styles.moedasTexto}>🪙 {coins}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.conteudo}>
        {/* prévia */}
        <View style={styles.preview}>
          <Text style={styles.previewLabel}>PRÉVIA</Text>
          <View style={styles.previewRow}>
            <View style={styles.previewInfo}>
              <Text style={styles.previewNome}>{selecionado?.name ?? 'Seu chef'}</Text>
              {selecionado && (
                <Text style={styles.previewPreco}>
                  {selecionado.price === 0 ? 'Grátis' : `🪙 ${selecionado.price}`}
                </Text>
              )}
              {renderBotaoPreview()}
            </View>
            <Avatar size={110} hat={selecionado?.avatarHat} />
          </View>
        </View>

        {/* abas */}
        <View style={styles.tabs}>
          {ABAS.map((t) => (
            <Pressable
              key={t.key}
              style={[styles.tab, aba === t.key && styles.tabAtiva]}
              onPress={() => setAba(t.key)}
            >
              <Text style={[styles.tabTexto, aba === t.key && styles.tabTextoAtiva]}>{t.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* itens da aba */}
        {carregando ? (
          <ActivityIndicator size="large" color="#D63E2A" style={{ marginTop: 20 }} />
        ) : itensAba.length === 0 ? (
          <View style={styles.vazio}>
            <Text style={styles.vazioTexto}>Em breve 🔧</Text>
          </View>
        ) : (
          <View style={styles.grade}>
            {itensAba.map((item) => {
              const equipado = item.avatarHat === equippedHat;
              const sel = selecionado?.id === item.id;
              return (
                <Pressable
                  key={item.id}
                  style={[styles.card, sel && styles.cardSelecionado]}
                  onPress={() => setSelecionado(item)}
                >
                  <Avatar size={56} hat={item.avatarHat} />
                  <Text style={styles.cardNome}>{item.name}</Text>
                  <Text style={styles.cardPreco}>
                    {item.price === 0 ? 'Grátis' : `🪙 ${item.price}`}
                  </Text>
                  {equipado && <Text style={styles.badge}>✓ Equipado</Text>}
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FBF6EC' },
  header: {
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#2A1A12' },
  moedasPill: { backgroundColor: '#FFF3D6', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20 },
  moedasTexto: { fontSize: 15, fontWeight: 'bold', color: '#A9761A' },
  conteudo: { padding: 20, gap: 16, paddingBottom: 40 },

  preview: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#F0E6D2' },
  previewLabel: { fontSize: 11, fontWeight: 'bold', color: '#C9A24A', letterSpacing: 1, marginBottom: 8 },
  previewRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  previewInfo: { flex: 1, gap: 8, paddingRight: 12 },
  previewNome: { fontSize: 18, fontWeight: 'bold', color: '#2A1A12' },
  previewPreco: { fontSize: 14, fontWeight: '600', color: '#A9761A' },

  tabs: { flexDirection: 'row', gap: 8 },
  tab: {
    flex: 1, paddingVertical: 10, borderRadius: 20, backgroundColor: '#FFFFFF',
    alignItems: 'center', borderWidth: 1, borderColor: '#F0E6D2',
  },
  tabAtiva: { backgroundColor: '#2A1A12', borderColor: '#2A1A12' },
  tabTexto: { fontSize: 13, fontWeight: 'bold', color: '#9B8674' },
  tabTextoAtiva: { color: '#FFFFFF' },

  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '47%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12,
    alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#F0E6D2',
  },
  cardSelecionado: { borderColor: '#D63E2A', borderWidth: 2 },
  cardNome: { fontSize: 13, fontWeight: 'bold', color: '#2A1A12', textAlign: 'center' },
  cardPreco: { fontSize: 12, fontWeight: '600', color: '#A9761A' },
  badge: { fontSize: 11, fontWeight: 'bold', color: '#4F7239' },

  vazio: { padding: 40, alignItems: 'center' },
  vazioTexto: { fontSize: 15, color: '#9B8674', fontWeight: '600' },

  botao: { paddingVertical: 10, borderRadius: 10, alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 20, marginTop: 4 },
  botaoComprar: { backgroundColor: '#D63E2A' },
  botaoEquipar: { backgroundColor: '#2A1A12' },
  botaoEquipado: { backgroundColor: '#4F7239' },
  botaoBloqueado: { backgroundColor: '#EDE6D8' },
  botaoTextoClaro: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  botaoTextoEscuro: { color: '#9B8674', fontWeight: 'bold', fontSize: 13 },
});