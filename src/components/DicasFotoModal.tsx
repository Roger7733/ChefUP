import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

const CHAVE_NAO_MOSTRAR = '@chefup:naoMostrarDicasFoto';

const DICAS = [
  'Fotografe em um local bem iluminado, de preferência com luz natural.',
  'Posicione a câmera de cima ou levemente inclinada, mostrando o prato inteiro.',
  'Deixe todos os ingredientes visíveis, sem cortar partes do prato.',
  'Evite fundos bagunçados — foque no prato.',
];

export default function DicasFotoModal() {
  const [visivel, setVisivel] = useState(false);
  const [naoMostrar, setNaoMostrar] = useState(false);

  useEffect(() => {
    verificarPreferencia();
  }, []);

  async function verificarPreferencia() {
    try {
      const valor = await AsyncStorage.getItem(CHAVE_NAO_MOSTRAR);
      if (valor !== 'true') {
        setVisivel(true);
      }
    } catch (erro) {
      setVisivel(true);
    }
  }

  async function fechar() {
    if (naoMostrar) {
      try {
        await AsyncStorage.setItem(CHAVE_NAO_MOSTRAR, 'true');
      } catch (erro) {
        // se falhar em salvar, tudo bem — só vai aparecer de novo
      }
    }
    setVisivel(false);
  }

  return (
        <Modal
            visible={visivel}
            transparent
            animationType="fade"
            statusBarTranslucent
            navigationBarTranslucent
            onRequestClose={fechar}
        >
      <View style={styles.fundo}>
        <View style={styles.caixa}>
          <Text style={styles.titulo}>Dicas para a foto</Text>

          <View style={styles.listaDicas}>
            {DICAS.map((dica, i) => (
              <View key={i} style={styles.dicaLinha}>
                <View style={styles.bolinha} />
                <Text style={styles.dicaTexto}>{dica}</Text>
              </View>
            ))}
          </View>

          <Pressable style={styles.checkboxLinha} onPress={() => setNaoMostrar(!naoMostrar)}>
            <View style={[styles.checkbox, naoMostrar && styles.checkboxMarcado]}>
              {naoMostrar && <Text style={styles.check}>✓</Text>}
            </View>
            <Text style={styles.checkboxTexto}>Não mostrar novamente</Text>
          </Pressable>

          <Pressable style={styles.botao} onPress={fechar}>
            <Text style={styles.botaoTexto}>Entendi!</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  caixa: {
    width: '100%', maxWidth: 360, backgroundColor: '#FFF',
    borderRadius: 20, padding: 24, gap: 16,
  },
  titulo: { fontSize: 20, fontWeight: 'bold', color: '#D63E2A', textAlign: 'center' },
  listaDicas: { gap: 14 },
  dicaLinha: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  bolinha: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: '#D63E2A',
    marginTop: 7,
  },
  dicaTexto: { flex: 1, fontSize: 14, color: '#2A1A12', lineHeight: 20 },
  checkboxLinha: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#D63E2A',
    justifyContent: 'center', alignItems: 'center',
  },
  checkboxMarcado: { backgroundColor: '#D63E2A' },
  check: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  checkboxTexto: { fontSize: 14, color: '#5c2b2e' },
  botao: {
    backgroundColor: '#D63E2A', paddingVertical: 14, borderRadius: 10, alignItems: 'center',
  },
  botaoTexto: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});