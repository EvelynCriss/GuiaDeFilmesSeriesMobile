import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack'; 
 
import { FavoritesProvider } from './context/FavoritesContext';
 
// Importe suas telas
import ListaPontosTuristicos from './screens/ListaPontosTuristicos'; // O nome do arquivo foi mantido, mas agora é uma lista de filmes
import DetalhesPontoTuristico from './screens/DetalhesPontoTuristico'; // O nome do arquivo foi mantido, mas agora são detalhes do filme
 
const Stack = createStackNavigator();
 
export default function App() {
  return (
    <FavoritesProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="ListaPontos">
          <Stack.Screen
            name="ListaPontos"
            component={ListaPontosTuristicos}
            // <--- MUDANÇA: Título da tela atualizado
            options={{ title: 'Lista de Filmes' }}
          />
          <Stack.Screen
            name="DetalhesPonto"
            component={DetalhesPontoTuristico}
            // <--- MUDANÇA: Título da tela atualizado
            options={{ title: 'Detalhes do Filme' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </FavoritesProvider>
  );
}