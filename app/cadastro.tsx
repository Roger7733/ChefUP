import Avatar from '@/components/Avatar';
import { User } from '@/models/User';
import { registrar } from '@/services/authService';
import { salvarUsuario } from '@/services/userService';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');

  async function handleCadastro() {
    if (nome.trim() === '') {
      setMensagem('Por favor, informe seu nome.');
      return;
    }

    try {
      const usuario = await registrar(email, senha);

      const novoUsuario: User = {
        id: usuario.uid,
        name: nome.trim(),
        email: email,
        level: 1,
        xp: 0,
        coins: 0,
        streak: 0,
        lastAccess: new Date().toISOString(),
        character: 'mulher',
        outfit: 'normal',
      };

      await salvarUsuario(novoUsuario);
      router.replace('/(tabs)');
    } catch (erro: any) {
      setMensagem('Erro: ' + (erro.message || JSON.stringify(erro)));
      console.log('ERRO COMPLETO:', erro);
    }
  }

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.screen}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
        <View style={styles.topo}>
          <Avatar size={96} hat="toque" circleColor="#C0392B" outfit="normal" />
          <Text style={styles.marca}>Criar conta</Text>
          <Text style={styles.subtitulo}>Bora cozinhar de verdade!</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Seu nome"
          placeholderTextColor="#B3A796"
          value={nome}
          onChangeText={setNome}
        />

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="#B3A796"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#B3A796"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        {mensagem ? <Text style={styles.erro}>{mensagem}</Text> : null}

        <Pressable style={styles.botao} onPress={handleCadastro}>
          <Text style={styles.botaoTexto}>Cadastrar</Text>
        </Pressable>

        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>Já tenho conta — entrar</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FBF6EC' },
  conteudo: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 14 },
  topo: { alignItems: 'center', gap: 6, marginBottom: 14 },
  marca: { fontSize: 28, fontWeight: 'bold', color: '#2A1A12', marginTop: 8 },
  subtitulo: { fontSize: 15, color: '#9B8674' },
  input: {
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0D6C6', borderRadius: 12,
    padding: 14, fontSize: 16, color: '#2A1A12',
  },
  erro: { fontSize: 14, color: '#C0392B', textAlign: 'center' },
  botao: { backgroundColor: '#D63E2A', paddingVertical: 15, borderRadius: 12, alignItems: 'center', marginTop: 4 },
  botaoTexto: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  link: { fontSize: 15, color: '#D63E2A', textAlign: 'center', fontWeight: '600', marginTop: 6 },
});