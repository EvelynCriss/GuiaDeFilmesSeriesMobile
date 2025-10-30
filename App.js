// App.js
import 'react-native-gesture-handler';
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { FavoritesProvider } from './context/FavoritesContext';

import ListaPontosTuristicos from './screens/ListaPontosTuristicos';
import DetalhesPontoTuristico from './screens/DetalhesPontoTuristico';
import FavoritosScreen from './screens/FavoritosScreen';
import PerfilScreen from './screens/PerfilScreen';
import GerenciarPontoTuristico from './screens/GerenciarPontoTuristico'; // <--- Importe a nova tela

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function ExplorarStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ListaPontos"
        component={ListaPontosTuristicos}
        options={{ title: 'Explorar Pontos' }}
      />
      <Stack.Screen
        name="DetalhesPonto"
        component={DetalhesPontoTuristico}
        options={{ title: 'Detalhes do Ponto' }}
      />
      <Stack.Screen // <--- Adicione a tela de gerenciamento
        name="GerenciarPonto"
        component={GerenciarPontoTuristico}
        options={{ title: 'Gerenciar Ponto' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <FavoritesProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === 'Explorar') {
                iconName = focused ? 'compass' : 'compass-outline';
              } else if (route.name === 'Favoritos') {
                iconName = focused ? 'heart' : 'heart-outline';
              } else if (route.name === 'Mapa') {
                iconName = focused ? 'map' : 'map-outline';
              } else if (route.name === 'Perfil') {
                iconName = focused ? 'person' : 'person-outline';
              }
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: 'blue',
            tabBarInactiveTintColor: 'gray',
            headerShown: false,
          })}
        >
          <Tab.Screen
            name="Explorar"
            component={ExplorarStack}
            options={{ tabBarLabel: 'Explorar' }}
          />
          <Tab.Screen
            name="Favoritos"
            component={FavoritosScreen}
            options={{ tabBarLabel: 'Favoritos' }}
          />
          <Tab.Screen
            name="Mapa"
            component={MapaScreen}
            options={{ tabBarLabel: 'Mapa' }}
          />
          <Tab.Screen
            name="Perfil"
            component={PerfilScreen}
            options={{ tabBarLabel: 'Perfil' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </FavoritesProvider>
  );
}