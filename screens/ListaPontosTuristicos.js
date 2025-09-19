import React from 'react';

import { View, Text, StyleSheet, Button } from 'react-native';

import { useNavigation } from '@react-navigation/native'; // <--- Importe useNavigation

 

const ListaPontosTuristicos = () => {

  const navigation = useNavigation(); // <--- Hook para acessar a navegação

 

  const handleGoToDetails = () => {

    // <--- Navega para a tela 'DetalhesPonto' e passa parâmetros

    navigation.navigate('DetalhesPonto', {

      pontoId: '123',

      nomePonto: 'Parque Barigui',

      descricaoPonto: 'Um lindo parque em Curitiba com capivaras.',

    });

  };

 

  return (

    <View style={styles.container}>

      <Text style={styles.title}>Lista de Pontos Turísticos</Text>

      <Button title="Ver Detalhes do Parque Barigui" onPress={handleGoToDetails} />

      {/* Aqui virá a lista real de pontos turísticos */}

    </View>

  );

};

 

const styles = StyleSheet.create({

  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  title: { fontSize: 24, marginBottom: 20 },

});

 

export default ListaPontosTuristicos;