import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack'; // Ou seu MainNavigator
 
// <--- Importe o FavoritesProvider
import { FavoritesProvider } from './context/FavoritesContext';
 
// Importe suas telas
import ListaPontosTuristicos from './screens/ListaPontosTuristicos';
import DetalhesPontoTuristico from './screens/DetalhesPontoTuristico';
// ... (outras telas se já estiverem no MainNavigator)
 
const Stack = createStackNavigator(); // Ou use seu MainNavigator se já estiver complexo
 
export default function App() {
  return (
    // <--- Envolva o NavigationContainer com o FavoritesProvider
    <FavoritesProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="ListaPontos">
          <Stack.Screen
            name="ListaPontos"
            component={ListaPontosTuristicos}
            options={{ title: 'Pontos Turísticos' }}
          />
          <Stack.Screen
            name="DetalhesPonto"
            component={DetalhesPontoTuristico}
            options={{ title: 'Detalhes do Ponto' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </FavoritesProvider>
  );
}