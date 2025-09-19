import 'react-native-gesture-handler'; // Importante para React Navigation

import React from 'react';

import { NavigationContainer } from '@react-navigation/native';

import { createStackNavigator } from '@react-navigation/stack';

 

// Importe suas telas

import ListaPontosTuristicos from './screens/ListaPontosTuristicos';

import DetalhesPontoTuristico from './screens/DetalhesPontoTuristico';

 

const Stack = createStackNavigator();

 

export default function App() {

  return (

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

  );

}

