import { User } from '@/models/User';
import { registrar } from '@/services/authService';
import { salvarUsuario } from '@/services/userService';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function Cadastro() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');

  async function handleCadastro() {
  try {
    const usuario = await registrar(email, senha);

    const novoUsuario: User = {
      id: usuario.uid,
      name: '',
      email: email,
      level: 1,
      xp: 0,
      coins: 0,
      streak: 0,
      lastAccess: new Date().toISOString(),
        };

        await salvarUsuario(novoUsuario);
        setMensagem('Conta criada e salva no banco!');
    } catch (erro: any) {
        setMensagem('Erro: ' + (erro.message || JSON.stringify(erro)));
        console.log('ERRO COMPLETO:', erro);
    }
    }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Criar conta</Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />

      <Pressable style={styles.button} onPress={handleCadastro}>
        <Text style={styles.buttonText}>Cadastrar</Text>
      </Pressable>

      <Text style={styles.mensagem}>{mensagem}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#FF6B35',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mensagem: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});