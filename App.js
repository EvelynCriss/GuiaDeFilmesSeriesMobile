import 'react-native-gesture-handler';
import React from 'react';
import { View, TouchableOpacity, StatusBar } from 'react-native'; 
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native'; 
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack'; 

import { FavoritesProvider } from './context/FavoritesContext';
import { ThemeProvider, useTheme } from './context/ThemeContext'; 
import ThemeToggleButton from './components/ThemeToggleButton'; 

import ListaFilmesScreen from './screens/ListaFilmesScreen'; 
import DetalhesFilmeScreen from './screens/DetalhesFilmeScreen';
import ListaFilmesCategoriaScreen from './screens/ListaFilmesCategoriaScreen'; 

const Stack = createStackNavigator();

function AppContent() {
  const { colors: COLORS, theme } = useTheme(); 

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
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.background,
          },
          headerTintColor: COLORS.textPrimary, 
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
        }}
      >
        <Stack.Screen
          name="ListaFilmes" 
          component={ListaFilmesScreen} 
          options={{ 
            title: '',
            headerLeft: () => (
              <TouchableOpacity 
                onPress={() => alert('Abrir Perfil/Menu!')} 
                style={{ padding: 5, marginLeft: 15 }}
              >
                 <Ionicons name="person-circle-outline" size={30} color={COLORS.textPrimary} />
               </TouchableOpacity>
            ),
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

        <Stack.Screen
          name="ListaFilmesCategoriaScreen"
          component={ListaFilmesCategoriaScreen}
          options={{ headerShown: false }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <FavoritesProvider>
        <AppContent />
      </FavoritesProvider>
    </ThemeProvider>
  );
}