// App.js
import 'react-native-gesture-handler';
import React from 'react';
import { View, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { FavoritesProvider } from './context/FavoritesContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import ThemeToggleButton from './components/ThemeToggleButton';
import CustomHeader from './components/CustomHeader';

import ListaFilmesScreen from './screens/ListaFilmesScreen';
import DetalhesFilmeScreen from './screens/DetalhesFilmeScreen';
import ListaFilmesCategoriaScreen from './screens/ListaFilmesCategoriaScreen';
import SearchResultsScreen from './screens/SearchResultsScreen';
import DetalhesTemporadaScreen from './screens/DetalhesTemporadaScreen';

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
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={COLORS.headerBackground} />
      <Stack.Navigator
        initialRouteName="ListaFilmes"
        screenOptions={{
          // Define o CustomHeader para todas as telas
          header: (props) => <CustomHeader {...props} />,
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
        }}
      >
        <Stack.Screen
          name="ListaFilmes"
          component={ListaFilmesScreen}
        // Removemos options complexas, o header cuida disso agora
        />

        <Stack.Screen
          name="DetalhesFilme"
          component={DetalhesFilmeScreen}
          // REMOVA headerShown: false para que o header apareça
          options={{ headerShown: true }}
        />

        <Stack.Screen
          name="ListaFilmesCategoriaScreen"
          component={ListaFilmesCategoriaScreen}
          // REMOVA headerShown: false
          options={{ headerShown: true }}
        />

        <Stack.Screen
          name="SearchResults"
          component={SearchResultsScreen}
          options={{ headerShown: true }}
        />

        <Stack.Screen
          name="DetalhesTemporada"
          component={DetalhesTemporadaScreen}
          options={{ headerShowcn: true, title: 'Episódios' }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <FavoritesProvider>
          <AppContent />
        </FavoritesProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}