import { StyleSheet, Text, View } from 'react-native';

export default function Loja() {
  return (
    <View style={styles.screen}>
      <Text style={styles.text}>Tela de Loja</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});