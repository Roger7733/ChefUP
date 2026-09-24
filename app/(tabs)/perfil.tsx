import Avatar from '@/components/Avatar';
import Personalizar from '@/components/Personalizar';
import { sair } from '@/services/authService';
import { useUserStore } from '@/viewmodels/userStore';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

export default function Perfil() {
  const coins = useUserStore((state) => state.coins);
  const xp = useUserStore((state) => state.xp);
  const level = useUserStore((state) => state.level);
  const streak = useUserStore((state) => state.streak);
  const name = useUserStore((state) => state.name);

  async function handleSair() {
    try {
      await sair();
      // O porteiro no _layout cuida de redirecionar para o login
    } catch (erro: any) {
      Alert.alert('Erro', 'Não foi possível sair. Tente novamente.');
    }
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Meu Perfil</Text>

      <Avatar />

      {name ? <Text style={styles.nome}>{name}</Text> : null}
      <Text style={styles.streak}>🔥 {streak} {streak === 1 ? 'dia' : 'dias'}</Text>
      <Text style={styles.info}>Nível: {level}</Text>
      <Text style={styles.info}>XP: {xp}</Text>
      <Text style={styles.info}>Moedas: {coins}</Text>

      <Personalizar />

      <Pressable style={styles.botaoSair} onPress={handleSair}>
        <Text style={styles.botaoSairTexto}>Sair da conta</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  nome: {
    fontSize: 18,
    color: '#666666',
  },
  streak: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  info: {
    fontSize: 18,
  },
  botaoSair: {
    marginTop: 30,
    borderWidth: 1,
    borderColor: '#D63E2A',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  botaoSairTexto: {
    color: '#D63E2A',
    fontSize: 16,
    fontWeight: 'bold',
  },
});