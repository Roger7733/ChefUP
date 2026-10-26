import { useUserStore } from '@/viewmodels/userStore';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

type Props = { visivel: boolean; onFechar: () => void };

export default function MeuQrModal({ visivel, onFechar }: Props) {
  const meuId = useUserStore((s) => s.id);
  const meuNome = useUserStore((s) => s.name);

  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onFechar}>
      <Pressable style={styles.fundo} onPress={onFechar}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.titulo}>Meu QR Code</Text>
          <Text style={styles.sub}>Mostre pro seu amigo escanear</Text>

          <View style={styles.qrBox}>
            {meuId ? <QRCode value={meuId} size={200} color="#2A1A12" backgroundColor="#FFFFFF" /> : null}
          </View>

          <Text style={styles.nome}>{meuNome}</Text>

          <Pressable style={styles.botao} onPress={onFechar}>
            <Text style={styles.botaoTexto}>Fechar</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: 30 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, alignItems: 'center', gap: 10, width: '100%' },
  titulo: { fontSize: 18, fontWeight: 'bold', color: '#2A1A12' },
  sub: { fontSize: 13, color: '#9B8674', textAlign: 'center' },
  qrBox: { padding: 16, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#F0E6D2', marginVertical: 6 },
  nome: { fontSize: 16, fontWeight: 'bold', color: '#2A1A12' },
  botao: { backgroundColor: '#D63E2A', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 10, marginTop: 6 },
  botaoTexto: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
});