import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack'; 
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Importação das Telas
import ListaFilmesScreen from '../screens/ListaFilmesScreen'; 
import FavoritesScreen from '../screens/FavoriteScreen';     
import ProfileScreen from '../screens/ProfileScreen';
import DetalhesFilmeScreen from '../screens/DetalhesFilmeScreen';
import ListaFilmesCategoriaScreen from '../screens/ListaFilmesCategoriaScreen';
import DetalhesTemporadaScreen from '../screens/DetalhesTemporadaScreen';
import SearchResultsScreen from '../screens/SearchResultsScreen';
import CinemaMapScreen from '../screens/CinemaMapScreen';

// Contexto e Componentes
import { useTheme } from '../context/ThemeContext';
import CustomHeader from '../components/CustomHeader'; 

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// --- Configuração do Header ---
const getHeaderOptions = (transparent = true, floating = true) => ({
  headerShown: true,
  headerTransparent: floating, 
  header: (props) => <CustomHeader {...props} transparent={transparent} />,
  title: '',
  headerBackTitleVisible: false,
});

// --- Stacks de Navegação ---

const HomeStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ListaFilmesIndex" component={ListaFilmesScreen} options={getHeaderOptions(true, true)} />
      <Stack.Screen name="DetalhesFilme" component={DetalhesFilmeScreen} options={getHeaderOptions(true, true)} />
      <Stack.Screen name="ListaFilmesCategoria" component={ListaFilmesCategoriaScreen} options={getHeaderOptions(true, true)} />
      <Stack.Screen name="DetalhesTemporada" component={DetalhesTemporadaScreen} options={getHeaderOptions(true, true)} />
      <Stack.Screen name="SearchResults" component={SearchResultsScreen} options={getHeaderOptions(true, true)} />
      <Stack.Screen name="CinemaMap" component={CinemaMapScreen} options={getHeaderOptions(true, true)} />
    </Stack.Navigator>
  );
};

const FavoritesStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FavoritesIndex" component={FavoritesScreen} options={getHeaderOptions(true, true)} />
      <Stack.Screen name="DetalhesFilme" component={DetalhesFilmeScreen} options={getHeaderOptions(true, true)} />
    </Stack.Navigator>
  );
};

// --- Tab Navigator Principal ---

const TabNavigator = () => {
  const { colors: COLORS } = useTheme();
  const insets = useSafeAreaInsets(); 

  // Altura base da TabBar
  const TAB_BAR_HEIGHT = 60;
  // Altura total considerando a área segura do iPhone (bottom inset)
  const totalHeight = TAB_BAR_HEIGHT + insets.bottom;

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false, // Removemos o texto para focar no ícone
        
        // Estilo da Barra
        tabBarStyle: {
          backgroundColor: COLORS.headerBackground,
          borderTopColor: COLORS.borderSubtle,
          borderTopWidth: 1,
          height: totalHeight,
          paddingTop: 10, // Empurra os ícones um pouco para baixo para centralizar verticalmente
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10, // Espaço seguro inferior
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0, // Remove sombra padrão do Android
          zIndex: 100,
        },
        
        // Cores automáticas fornecidas para a prop 'color' do ícone
        tabBarActiveTintColor: COLORS.accent1,
        tabBarInactiveTintColor: COLORS.textPrimary,
        
        // Renderização do Ícone
        tabBarIcon: ({ focused, color }) => {
          let iconName;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'videocam' : 'videocam-outline';
          } else if (route.name === 'FavoritesTab') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return (
            <View style={[
              styles.iconContainer, 
              { backgroundColor: focused ? COLORS.accent1 + '20' : 'transparent' }
            ]}>
              <Ionicons 
                name={iconName} 
                size={22} // Tamanho ideal para caber no container sem tocar nas bordas
                color={color} 
              />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="FavoritesTab" component={FavoritesStackNavigator} />
      <Tab.Screen name="HomeTab" component={HomeStackNavigator} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// --- Estilos Fixos para Alinhamento Perfeito ---
const styles = StyleSheet.create({
  iconContainer: {
    // Dimensões fixas garantem que a "pílula" tenha sempre o mesmo tamanho
    width: 60,  
    height: 36, 
    borderRadius: 18, // Metade da altura para ficar totalmente arredondado
    
    // Centralização absoluta do ícone dentro da pílula
    alignItems: 'center',
    justifyContent: 'center',
    
    // Garante que não haja distorção
    overflow: 'hidden',
  }
});

export default TabNavigator;