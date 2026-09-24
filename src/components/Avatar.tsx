import { useUserStore } from '@/viewmodels/userStore';
import { Image, StyleSheet, View } from 'react-native';

// mapa de imagens — cada require é fixo, escolhemos pela chave
const AVATARES = {
  'mulher-normal': require('../../assets/avatar/chef-mulher-normal.png'),
  'mulher-premium': require('../../assets/avatar/chef-mulher-premium.png'),
  'homem-normal': require('../../assets/avatar/chef-homem-normal.png'),
  'homem-premium': require('../../assets/avatar/chef-homem-premium.png'),
};

export default function Avatar() {
  const character = useUserStore((state) => state.character);
  const outfit = useUserStore((state) => state.outfit);

  // monta a chave; usa padrão se algo vier vazio (usuários antigos)
  const chave = `${character || 'mulher'}-${outfit || 'normal'}` as keyof typeof AVATARES;
  const imagem = AVATARES[chave] || AVATARES['mulher-normal'];

  return (
    <View style={styles.container}>
      <Image source={imagem} style={styles.personagem} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FBF6EC',
    borderRadius: 16,
  },
  personagem: {
    width: '100%',
    height: '100%',
  },
});