// App.js
import 'react-native-gesture-handler';
import React from 'react';
import { View, TouchableOpacity, StatusBar } from 'react-native'; // <--- MUDANÇA: Importa StatusBar
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native'; // <--- MUDANÇA: Importa temas
import { createStackNavigator } from '@react-navigation/stack'; 

import { FavoritesProvider } from './context/FavoritesContext';
import { ThemeProvider, useTheme } from './context/ThemeContext'; // <--- MUDANÇA: Importa o Provedor e o Hook
import ThemeToggleButton from './components/ThemeToggleButton'; // <--- MUDANÇA: Importa o botão

import ListaFilmesScreen from './screens/ListaFilmesScreen'; 
import DetalhesFilmeScreen from './screens/DetalhesFilmeScreen'; 

// REMOVIDO: import { COLORS } from './components/ColorPalete';

const Stack = createStackNavigator();

// --- INÍCIO DA MUDANÇA ---
// Criamos um componente interno que contém toda a lógica do navegador.
// Fazemos isso para que ele possa usar o hook useTheme()
function AppContent() {
  const { colors: COLORS, theme } = useTheme(); // Usa o hook para pegar cores e o tema

  // Isso faz com que a navegação do React Navigation se adapte ao tema (claro/escuro)
  const navigationTheme = {
    ...(theme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      background: COLORS.background,
      text: COLORS.textPrimary,
      card: COLORS.background,
      border: COLORS.borderColor,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      <Stack.Navigator 
        initialRouteName="ListaFilmes"
        // As screenOptions agora usam o COLORS dinâmico do useTheme
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.background,
          },
          headerTintColor: COLORS.textPrimary, 
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
            headerLeft: () => (
              <TouchableOpacity 
                onPress={() => alert('Abrir Perfil/Menu!')} 
                style={{ padding: 5, marginLeft: 15 }}
              >
                 <Ionicons name="person-circle-outline" size={30} color={COLORS.textPrimary} />
               </TouchableOpacity>
            ),
            // Adicionamos o botão de trocar o tema aqui!
            headerRight: () => (
              <View style={{ flexDirection: 'row', marginRight: 15 }}>
                <TouchableOpacity 
                  onPress={() => alert('Pesquisar!')} 
                  style={{ padding: 5, marginRight: 10 }}
                >
                  <Ionicons name="search" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <ThemeToggleButton />
              </View>
            ),
          }}
        />
        <Stack.Screen
          name="DetalhesFilme"
          component={DetalhesFilmeScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
// --- FIM DA MUDANÇA ---


// O componente App principal agora só envolve os provedores
export default function App() {
  return (
    <ThemeProvider>
      <FavoritesProvider>
        <AppContent />
      </FavoritesProvider>
    </ThemeProvider>
  );
}