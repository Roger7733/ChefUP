import { useUserStore } from '@/viewmodels/userStore';
import { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

const AVATARES = {
  'mulher-normal': require('../../assets/avatar/chef-mulher-normal.png'),
  'mulher-premium': require('../../assets/avatar/chef-mulher-premium.png'),
  'homem-normal': require('../../assets/avatar/chef-homem-normal.png'),
  'homem-premium': require('../../assets/avatar/chef-homem-premium.png'),
};

export default function Personalizar() {
  const [aberto, setAberto] = useState(false);

  const character = useUserStore((state) => state.character);
  const outfit = useUserStore((state) => state.outfit);
  const mudarAparencia = useUserStore((state) => state.mudarAparencia);

  const chave = `${character || 'mulher'}-${outfit || 'normal'}` as keyof typeof AVATARES;
  const imagem = AVATARES[chave] || AVATARES['mulher-normal'];

  return (
    <>
      {/* botão que abre o modal */}
      <Pressable style={styles.botaoAbrir} onPress={() => setAberto(true)}>
        <Text style={styles.botaoAbrirTexto}>Personalizar chef</Text>
      </Pressable>

      <Modal
        visible={aberto}
        transparent
        animationType="slide"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={() => setAberto(false)}
      >
        <View style={styles.fundo}>
          <View style={styles.caixa}>
            <Text style={styles.titulo}>Personalizar chef</Text>

            <View style={styles.preview}>
              <Image source={imagem} style={styles.avatar} resizeMode="contain" />
            </View>

            <Text style={styles.label}>Personagem</Text>
            <View style={styles.linha}>
              <Pressable
                style={[styles.opcao, character === 'mulher' && styles.opcaoAtiva]}
                onPress={() => mudarAparencia('mulher', outfit)}
              >
                <Text style={[styles.opcaoTexto, character === 'mulher' && styles.opcaoTextoAtivo]}>Mulher</Text>
              </Pressable>
              <Pressable
                style={[styles.opcao, character === 'homem' && styles.opcaoAtiva]}
                onPress={() => mudarAparencia('homem', outfit)}
              >
                <Text style={[styles.opcaoTexto, character === 'homem' && styles.opcaoTextoAtivo]}>Homem</Text>
              </Pressable>
            </View>

            <Text style={styles.label}>Traje</Text>
            <View style={styles.linha}>
              <Pressable
                style={[styles.opcao, outfit === 'normal' && styles.opcaoAtiva]}
                onPress={() => mudarAparencia(character, 'normal')}
              >
                <Text style={[styles.opcaoTexto, outfit === 'normal' && styles.opcaoTextoAtivo]}>Iniciante</Text>
              </Pressable>
              <Pressable
                style={[styles.opcao, outfit === 'premium' && styles.opcaoAtiva]}
                onPress={() => mudarAparencia(character, 'premium')}
              >
                <Text style={[styles.opcaoTexto, outfit === 'premium' && styles.opcaoTextoAtivo]}>Experiente</Text>
              </Pressable>
            </View>

            <Pressable style={styles.botaoFechar} onPress={() => setAberto(false)}>
              <Text style={styles.botaoFecharTexto}>Pronto</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  botaoAbrir: {
    backgroundColor: '#D63E2A', paddingVertical: 12, paddingHorizontal: 28,
    borderRadius: 10, marginTop: 8,
  },
  botaoAbrirTexto: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },

  fundo: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  caixa: {
    backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, gap: 10, alignItems: 'center',
  },
  titulo: { fontSize: 18, fontWeight: 'bold', color: '#2A1A12' },
  preview: {
    width: 160, height: 220, backgroundColor: '#FBF6EC', borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  avatar: { width: '100%', height: '100%' },
  label: {
    fontSize: 13, fontWeight: 'bold', color: '#9B8674',
    textTransform: 'uppercase', alignSelf: 'flex-start', marginTop: 4,
  },
  linha: { flexDirection: 'row', gap: 10, width: '100%' },
  opcao: {
    flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#F4ECD8',
    alignItems: 'center', borderWidth: 2, borderColor: 'transparent',
  },
  opcaoAtiva: { backgroundColor: '#FFF', borderColor: '#D63E2A' },
  opcaoTexto: { fontSize: 15, fontWeight: 'bold', color: '#9B8674' },
  opcaoTextoAtivo: { color: '#D63E2A' },
  botaoFechar: {
    backgroundColor: '#D63E2A', paddingVertical: 14, borderRadius: 10,
    alignItems: 'center', width: '100%', marginTop: 12,
  },
  botaoFecharTexto: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});