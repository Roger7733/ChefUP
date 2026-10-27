import {
  enviarPedido,
  listarAmigos,
  listarPedidosEnviados,
  listarPedidosRecebidos,
} from '@/services/friendshipService';
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

  useEffect(() => {
    if (visivel) setJaLeu(false);
  }, [visivel]);

  // mostra um aviso e libera a câmera pra tentar de novo
  function avisar(titulo: string, msg: string) {
    Alert.alert(titulo, msg, [{ text: 'OK', onPress: () => setJaLeu(false) }]);
  }

  async function aoLer({ data }: { data: string }) {
    if (jaLeu || processando) return;
    setJaLeu(true);

    const outroId = (data || '').trim();

    // ID do Firebase é só letras/números (~28 chars). Qualquer outra coisa não é um usuário.
    const formatoValido = /^[A-Za-z0-9]{16,40}$/.test(outroId);
    if (!formatoValido) {
      avisar('QR Code inválido', 'Esse código não é de um usuário do ChefUP.');
      return;
    }
    if (outroId === meuId) {
      avisar('Opa', 'Esse é o seu próprio QR Code 😅');
      return;
    }

    try {
      setProcessando(true);
      const usuario = await buscarUsuario(outroId);
      if (!usuario) {
        avisar('Não encontrado', 'Esse QR Code não corresponde a um usuário do ChefUP.');
        return;
      }

      // já são amigos? já existe pedido?
      const [amizades, enviados, recebidos] = await Promise.all([
        listarAmigos(meuId),
        listarPedidosEnviados(meuId),
        listarPedidosRecebidos(meuId),
      ]);
      const jaAmigo = amizades.some((a) => a.userId1 === outroId || a.userId2 === outroId);
      const jaEnviado = enviados.some((f) => f.userId2 === outroId);
      const jaRecebido = recebidos.some((f) => f.userId1 === outroId);

      if (jaAmigo) {
        Alert.alert('Já são amigos', `Você e ${usuario.name} já são amigos. 🎉`);
        onFechar();
        return;
      }
      if (jaEnviado) {
        Alert.alert('Pedido já enviado', `Você já tinha enviado um pedido para ${usuario.name}.`);
        onFechar();
        return;
      }
      if (jaRecebido) {
        Alert.alert('Ele já te adicionou', `${usuario.name} já te enviou um pedido — é só aceitar na lista!`);
        onFechar();
        return;
      }

      await enviarPedido(meuId, outroId);
      Alert.alert('Pronto!', `Pedido de amizade enviado para ${usuario.name}.`);
      onAdicionou?.();
      onFechar();
    } catch (erro: any) {
      avisar('Ops', 'Não consegui processar esse QR Code. Tente outro.');
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