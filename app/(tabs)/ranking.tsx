import { StyleSheet, Text, View } from 'react-native';

export default function Ranking() {
  return (
    <View style={styles.screen}>
      <Text style={styles.text}>Tela de Ranking</Text>
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