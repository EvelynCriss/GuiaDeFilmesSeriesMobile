import 'react-native-gesture-handler';
import React from 'react';
// --- NOVOS IMPORTS ---
import { View, TouchableOpacity } from 'react-native'; 
import { Ionicons } from '@expo/vector-icons';
// --- FIM NOVOS IMPORTS ---

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack'; 

import { FavoritesProvider } from './context/FavoritesContext';
import ListaFilmesScreen from './screens/ListaFilmesScreen'; 
import DetalhesFilmeScreen from './screens/DetalhesFilmeScreen'; 

import { COLORS } from './components/ColorPalete'; // <--- IMPORTAR CORES

const Stack = createStackNavigator();

export default function App() {
  return (
    <FavoritesProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="ListaFilmes"
          // screenOptions aplica o estilo a TODAS as telas do stack
          screenOptions={{
            headerStyle: {
              backgroundColor: COLORS.background, // Cor de fundo do header
            },
            headerTintColor: COLORS.textPrimary, // Cor do título e do botão "voltar"
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen
            name="ListaFilmes" 
            component={ListaFilmesScreen} 
            options={{ 
              title: 'Filmes em Alta',
              
              // --- Botões de Perfil/Configuração (Esquerda) ---
              // (Substitui o "voltar", ideal para a primeira tela)
              headerLeft: () => (
                <TouchableOpacity 
                  onPress={() => alert('Abrir Perfil/Menu!')} 
                  style={{ padding: 5, marginLeft: 15 }}
                >
                   <Ionicons name="person-circle-outline" size={30} color={COLORS.textPrimary} />
                 </TouchableOpacity>
              ),
              
              // --- Botões de Pesquisa/Notificação (Direita) ---
              headerRight: () => (
                <View style={{ flexDirection: 'row', marginRight: 15 }}>
                  <TouchableOpacity 
                    onPress={() => alert('Pesquisar!')} 
                    style={{ padding: 5, marginRight: 10 }}
                  >
                    <Ionicons name="search" size={24} color={COLORS.textPrimary} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => alert('Notificações!')} 
                    style={{ padding: 5 }}
                  >
                    <Ionicons name="notifications-outline" size={24} color={COLORS.textPrimary} />
                  </TouchableOpacity>
                </View>
              ),
            }}
          />
          <Stack.Screen
            name="DetalhesFilme" 
            component={DetalhesFilmeScreen} 
            options={{ 
              title: 'Detalhes do Filme',
              // <--- O HEADER AGORA ESTÁ HABILITADO E ESTILIZADO
              // (O botão "voltar" aparece aqui automaticamente)
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </FavoritesProvider>
  );
}