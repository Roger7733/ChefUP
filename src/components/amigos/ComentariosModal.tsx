import Avatar from '@/components/Avatar';
import { Comment } from '@/models/Comment';
import { adicionarComentario, listarComentarios } from '@/services/commentService';
import { useUserStore } from '@/viewmodels/userStore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

type Props = {
  evaluationId: string | null;
  onFechar: () => void;
  onComentou?: (evaluationId: string) => void;
};

export default function ComentariosModal({ evaluationId, onFechar, onComentou }: Props) {
  const meuId = useUserStore((s) => s.id);
  const meuNome = useUserStore((s) => s.name);
  const minhaCor = useUserStore((s) => s.avatarColor);
  const meuChapeu = useUserStore((s) => s.equippedHat);
  const meuAvental = useUserStore((s) => s.equippedApron);

  const [comentarios, setComentarios] = useState<Comment[]>([]);
  const [texto, setTexto] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    async function carregar() {
      if (!evaluationId) return;
      setCarregando(true);
      try {
        const lista = await listarComentarios(evaluationId);
        setComentarios(lista);
      } finally {
        setCarregando(false);
      }
    }
    setComentarios([]);
    carregar();
  }, [evaluationId]);

  async function enviar() {
    const limpo = texto.trim();
    if (!limpo || !evaluationId) return;
    setEnviando(true);
    try {
      const novo = await adicionarComentario({
        evaluationId,
        userId: meuId,
        userName: meuNome,
        text: limpo,
        date: new Date().toISOString(),
        avatarColor: minhaCor,
        avatarHat: meuChapeu,
        avatarApron: meuAvental,
      });
      setComentarios((atual) => [...atual, novo]);
      setTexto('');
      onComentou?.(evaluationId);
    } catch (erro: any) {
      console.log('ERRO AO COMENTAR:', erro?.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal visible={evaluationId !== null} transparent animationType="slide" onRequestClose={onFechar}>
      <View style={styles.fundo}>
        <Pressable style={styles.toque} onPress={onFechar} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.painel}
        >
          <View style={styles.puxador} />
          <Text style={styles.titulo}>Comentários</Text>

          {carregando ? (
            <ActivityIndicator color="#D63E2A" style={{ marginVertical: 30 }} />
          ) : (
            <ScrollView style={styles.lista} contentContainerStyle={{ gap: 14, paddingVertical: 8 }}>
              {comentarios.length === 0 ? (
                <Text style={styles.vazio}>Nenhum comentário ainda. Seja o primeiro!</Text>
              ) : (
                comentarios.map((c) => (
                  <View key={c.id} style={styles.comentario}>
                    <Avatar size={34} hat={(c.avatarHat as any) ?? 'toque'} apron={(c.avatarApron as any) ?? 'nenhum'} outfit="normal" circleColor={c.avatarColor ?? '#C0392B'} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.comentarioNome}>{c.userId === meuId ? 'Você' : c.userName}</Text>
                      <Text style={styles.comentarioTexto}>{c.text}</Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          )}

          <View style={styles.inputLinha}>
            <TextInput
              style={styles.input}
              placeholder="Escreva um comentário..."
              value={texto}
              onChangeText={setTexto}
              multiline
              maxLength={300}
            />
            <Pressable
              style={[styles.enviar, (!texto.trim() || enviando) && styles.enviarDesativado]}
              onPress={enviar}
              disabled={!texto.trim() || enviando}
            >
              <Text style={styles.enviarTexto}>Enviar</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  toque: { flex: 1 },
  painel: {
    backgroundColor: '#FBF6EC', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, maxHeight: '80%', gap: 10,
  },
  puxador: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: '#E0D6C6' },
  titulo: { fontSize: 18, fontWeight: 'bold', color: '#2A1A12', textAlign: 'center' },
  lista: { maxHeight: 360 },
  vazio: { fontSize: 14, color: '#9B8674', textAlign: 'center', paddingVertical: 20 },
  comentario: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  comentarioNome: { fontSize: 13, fontWeight: 'bold', color: '#2A1A12' },
  comentarioTexto: { fontSize: 14, color: '#4A3B30', marginTop: 1 },
  inputLinha: { flexDirection: 'row', gap: 8, alignItems: 'flex-end', marginTop: 4 },
  input: {
    flex: 1, borderWidth: 1, borderColor: '#E0D6C6', borderRadius: 12, padding: 12,
    fontSize: 14, maxHeight: 100, backgroundColor: '#FFFFFF',
  },
  enviar: { backgroundColor: '#D63E2A', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12 },
  enviarDesativado: { opacity: 0.5 },
  enviarTexto: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
});