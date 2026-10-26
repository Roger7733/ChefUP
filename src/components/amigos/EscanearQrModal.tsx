import { enviarPedido } from '@/services/friendshipService';
import { buscarUsuario } from '@/services/userService';
import { useUserStore } from '@/viewmodels/userStore';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = { visivel: boolean; onFechar: () => void; onAdicionou?: () => void };

export default function EscanearQrModal({ visivel, onFechar, onAdicionou }: Props) {
  const insets = useSafeAreaInsets();
  const meuId = useUserStore((s) => s.id);
  const [permissao, pedirPermissao] = useCameraPermissions();
  const [processando, setProcessando] = useState(false);
  const [jaLeu, setJaLeu] = useState(false);

  // libera a leitura toda vez que o scanner abre de novo
  useEffect(() => {
    if (visivel) setJaLeu(false);
  }, [visivel]);

  async function aoLer({ data }: { data: string }) {
    if (jaLeu || processando) return;
    setJaLeu(true);
    const outroId = (data || '').trim();

    if (!outroId || outroId === meuId) {
      Alert.alert('Ops', 'QR Code inválido (ou é o seu próprio).');
      return;
    }

    try {
      setProcessando(true);
      const usuario = await buscarUsuario(outroId);
      if (!usuario) {
        Alert.alert('Não encontrado', 'Esse QR Code não corresponde a um usuário.');
        setJaLeu(false);
        return;
      }
      await enviarPedido(meuId, outroId);
      Alert.alert('Pronto!', `Pedido de amizade enviado para ${usuario.name}.`);
      onAdicionou?.();
      onFechar();
    } catch (erro: any) {
      Alert.alert('Erro', erro?.message || 'Não foi possível enviar o pedido.');
      setJaLeu(false);
    } finally {
      setProcessando(false);
    }
  }

  return (
    <Modal visible={visivel} animationType="slide" onRequestClose={onFechar}>
      <View style={[styles.tela, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 10 }]}>
        <Text style={styles.titulo}>Escanear QR Code</Text>
        <Text style={styles.sub}>Aponte a câmera pro QR do seu amigo</Text>

        <View style={styles.cameraBox}>
          {!permissao ? (
            <View style={styles.centro}><ActivityIndicator color="#FFF" /></View>
          ) : !permissao.granted ? (
            <View style={styles.centro}>
              <Text style={styles.permissaoTexto}>Precisamos da câmera pra escanear.</Text>
              <Pressable style={styles.botao} onPress={pedirPermissao}>
                <Text style={styles.botaoTexto}>Permitir câmera</Text>
              </Pressable>
            </View>
          ) : (
            <CameraView
              style={{ flex: 1 }}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={jaLeu ? undefined : aoLer}
            />
          )}
          {processando && (
            <View style={styles.overlay}><ActivityIndicator size="large" color="#FFF" /></View>
          )}
        </View>

        <Pressable style={styles.fechar} onPress={onFechar}>
          <Text style={styles.fecharTexto}>Cancelar</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#2A1A12', paddingHorizontal: 20, gap: 10 },
  titulo: { fontSize: 20, fontWeight: 'bold', color: '#FFF', textAlign: 'center' },
  sub: { fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
  cameraBox: { flex: 1, borderRadius: 20, overflow: 'hidden', backgroundColor: '#000', marginVertical: 10 },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14, padding: 20 },
  permissaoTexto: { color: '#FFF', textAlign: 'center', fontSize: 15 },
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center',
  },
  botao: { backgroundColor: '#D63E2A', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
  botaoTexto: { color: '#FFF', fontWeight: 'bold' },
  fechar: { paddingVertical: 14, alignItems: 'center' },
  fecharTexto: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});