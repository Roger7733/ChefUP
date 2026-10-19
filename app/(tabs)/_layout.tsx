import { Ionicons } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { Navigator } = createMaterialTopTabNavigator();
const MaterialTopTabs = withLayoutContext(Navigator);

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <MaterialTopTabs
      tabBarPosition="bottom"
      screenOptions={{
        swipeEnabled: true,
        tabBarActiveTintColor: '#D63E2A',
        tabBarInactiveTintColor: '#9B8674',
        tabBarShowIcon: true,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 11, fontWeight: 'bold', textTransform: 'none', marginTop: 2 },
        tabBarIndicatorStyle: { backgroundColor: '#D63E2A', height: 3, top: 0 },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          height: 58 + insets.bottom,
          paddingBottom: insets.bottom,
          borderTopWidth: 1,
          borderTopColor: '#F0E6D2',
        },
      }}
    >
      <MaterialTopTabs.Screen
        name="index"
        options={{ title: 'Aprender', tabBarIcon: ({ color }: { color: string }) => <Ionicons name="map" color={color} size={22} /> }}
      />
      <MaterialTopTabs.Screen
        name="amigos"
        options={{ title: 'Amigos', tabBarIcon: ({ color }: { color: string }) => <Ionicons name="people" color={color} size={22} /> }}
      />
      <MaterialTopTabs.Screen
        name="loja"
        options={{ title: 'Loja', tabBarIcon: ({ color }: { color: string }) => <Ionicons name="cart" color={color} size={22} /> }}
      />
      <MaterialTopTabs.Screen
        name="perfil"
        options={{ title: 'Perfil', tabBarIcon: ({ color }: { color: string }) => <Ionicons name="person" color={color} size={22} /> }}
      />
    </MaterialTopTabs>
  );
}