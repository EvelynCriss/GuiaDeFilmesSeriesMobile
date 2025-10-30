import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack'; 
 
import { FavoritesProvider } from './context/FavoritesContext';
 
// <--- MUDANÇA: Nomes dos arquivos importados atualizados
import ListaFilmesScreen from './screens/ListaFilmesScreen'; 
import DetalhesFilmeScreen from './screens/DetalhesFilmeScreen'; 
 
const Stack = createStackNavigator();
 
export default function App() {
  return (
    <FavoritesProvider>
      <NavigationContainer>
        {/* <--- MUDANÇA: Rota inicial e nomes das rotas atualizados */}
        <Stack.Navigator initialRouteName="ListaFilmes">
          <Stack.Screen
            name="ListaFilmes" // <--- MUDANÇA: Nome da rota
            component={ListaFilmesScreen} // <--- MUDANÇA: Componente
            options={{ title: 'Filmes em Alta' }} // <--- MUDANÇA: Título
          />
          <Stack.Screen
            name="DetalhesFilme" // <--- MUDANÇA: Nome da rota
            component={DetalhesFilmeScreen} // <--- MUDANÇA: Componente
            options={{ title: 'Detalhes do Filme' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </FavoritesProvider>
  );
}