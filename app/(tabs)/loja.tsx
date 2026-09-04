import { Item } from '@/models/Item';
import { buscarInventario, buscarItens } from '@/services/shopService';
import { useUserStore } from '@/viewmodels/userStore';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function Loja() {
  const [itens, setItens] = useState<Item[]>([]);
  const [comprados, setComprados] = useState<string[]>([]);

  const coins = useUserStore((state) => state.coins);
  const userId = useUserStore((state) => state.id);
  const comprarItem = useUserStore((state) => state.comprarItem);

  useEffect(() => {
    async function carregar() {
      const listaItens = await buscarItens();
      setItens(listaItens);

      const inventario = await buscarInventario(userId);
      setComprados(inventario.map((ui) => ui.itemId));
    }
    carregar();
  }, [userId]);

  async function handleComprar(item: Item) {
    const sucesso = await comprarItem(item.id, item.price);
    if (sucesso) {
      setComprados((atual) => [...atual, item.id]);
    }
  }

  return (
    <View style={styles.screen}>
      <View style={styles.painel}>
        <Text style={styles.painelTexto}>💰 {coins} moedas</Text>
      </View>

      <ScrollView contentContainerStyle={styles.lista}>
        {itens.map((item) => {
          const jaComprado = comprados.includes(item.id);
          const podeComprar = coins >= item.price;

          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardInfo}>
                <Text style={styles.cardNome}>{item.name}</Text>
                <Text style={styles.cardPreco}>{item.price} moedas</Text>
              </View>

              <Pressable
                style={[
                  styles.botao,
                  jaComprado && styles.botaoComprado,
                  !jaComprado && !podeComprar && styles.botaoDesabilitado,
                ]}
                disabled={jaComprado || !podeComprar}
                onPress={() => handleComprar(item)}
              >
                <Text style={styles.botaoTexto}>
                  {jaComprado ? 'Comprado' : podeComprar ? 'Comprar' : 'Sem moedas'}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFF9F6' },
  painel: {
    backgroundColor: '#FF6B35',
    paddingVertical: 14,
    alignItems: 'center',
  },
  painelTexto: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  lista: { padding: 16, gap: 12 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD9C9',
  },
  cardInfo: { flex: 1 },
  cardNome: { fontSize: 16, fontWeight: 'bold', color: '#333333' },
  cardPreco: { fontSize: 14, color: '#FF6B35', marginTop: 4 },
  botao: {
    backgroundColor: '#FF6B35',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  botaoComprado: { backgroundColor: '#4CAF50' },
  botaoDesabilitado: { backgroundColor: '#CCCCCC' },
  botaoTexto: { color: '#FFFFFF', fontWeight: 'bold' },
});