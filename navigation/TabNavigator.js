import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack'; 
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ListaFilmesScreen from '../screens/ListaFilmesScreen'; 
import FavoritesScreen from '../screens/FavoriteScreen';     
import ProfileScreen from '../screens/ProfileScreen';
import DetalhesFilmeScreen from '../screens/DetalhesFilmeScreen';
import ListaFilmesCategoriaScreen from '../screens/ListaFilmesCategoriaScreen';
import DetalhesTemporadaScreen from '../screens/DetalhesTemporadaScreen';
import SearchResultsScreen from '../screens/SearchResultsScreen';

import { useTheme } from '../context/ThemeContext';
import CustomHeader from '../components/CustomHeader'; 

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Opções para Header Transparente e Flutuante
const getHeaderOptions = (transparent = true, floating = true) => ({
  headerShown: true,
  headerTransparent: floating, 
  header: (props) => <CustomHeader {...props} transparent={transparent} />,
  title: '',
  headerBackTitleVisible: false,
});

const HomeStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ListaFilmesIndex" 
        component={ListaFilmesScreen} 
        options={getHeaderOptions(true, true)} 
      />
      
      {/* AQUI ESTÁ O SEGREDO:
        Como estas telas estão dentro desta Stack, e esta Stack está dentro da Tab,
        a TabBar continuará visível.
      */}

      <Stack.Screen 
        name="DetalhesFilme" 
        component={DetalhesFilmeScreen} 
        options={getHeaderOptions(true, true)} 
      />

      <Stack.Screen 
        name="ListaFilmesCategoria" 
        component={ListaFilmesCategoriaScreen} 
        options={getHeaderOptions(true, true)} 
      />

      <Stack.Screen 
        name="DetalhesTemporada" 
        component={DetalhesTemporadaScreen} 
        options={getHeaderOptions(true, true)} 
      />

      <Stack.Screen 
        name="SearchResults" 
        component={SearchResultsScreen} 
        options={getHeaderOptions(true, true)} 
      />
    </Stack.Navigator>
  );
};

const FavoritesStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="FavoritesIndex" 
        component={FavoritesScreen} 
        options={getHeaderOptions(true, true)} 
      />
      {/* Necessário repetir aqui caso navegue para detalhes vindo dos favoritos */}
      <Stack.Screen 
        name="DetalhesFilme" 
        component={DetalhesFilmeScreen} 
        options={getHeaderOptions(true, true)} 
      />
    </Stack.Navigator>
  );
};

const TabNavigator = () => {
  const { colors: COLORS } = useTheme();
  const insets = useSafeAreaInsets(); 

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: COLORS.headerBackground,
          borderTopColor: COLORS.borderSubtle,
          borderTopWidth: 1,
          height: 60 + insets.bottom, 
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 10,
          elevation: 0,
          // Garante que a TabBar não fique transparente/invisível por acidente
          position: 'absolute', 
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarActiveTintColor: COLORS.accent1,
        tabBarInactiveTintColor: COLORS.textPrimary,
        tabBarIcon: ({ focused, color }) => {
          let iconName;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'FavoritesTab') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          if (route.name === 'HomeTab') {
             return (
               <View style={{
                 backgroundColor: focused ? COLORS.accent1 + '20' : 'transparent',
                 padding: 8,
                 borderRadius: 20,
               }}>
                 <Ionicons name={iconName} size={30} color={color} />
               </View>
             );
          }

          return <Ionicons name={iconName} size={24} color={color} style={{ opacity: focused ? 1 : 0.6 }} />;
        },
      })}
    >
      <Tab.Screen name="FavoritesTab" component={FavoritesStackNavigator} />
      <Tab.Screen name="HomeTab" component={HomeStackNavigator} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;