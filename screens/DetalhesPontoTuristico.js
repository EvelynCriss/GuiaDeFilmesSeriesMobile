import React from 'react';

import { View, Text, StyleSheet, Button } from 'react-native';

import { useRoute, useNavigation } from '@react-navigation/native'; // <--- Importe useRoute

 

const DetalhesPontoTuristico = () => {

  const route = useRoute(); // <--- Hook para acessar a rota atual

  const navigation = useNavigation(); // Para o botão de voltar

 

  // <--- Acessando os parâmetros passados

  const { pontoId, nomePonto, descricaoPonto } = route.params;

 

  return (

    <View style={styles.container}>

      <Text style={styles.title}>Detalhes do Ponto</Text>

      <Text style={styles.detailText}>ID: {pontoId}</Text>

      <Text style={styles.detailText}>Nome: {nomePonto}</Text>

      <Text style={styles.detailText}>Descrição: {descricaoPonto}</Text>

      <Button title="Voltar" onPress={() => navigation.goBack()} />

    </View>

  );

};

 

const styles = StyleSheet.create({

  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },

  title: { fontSize: 24, marginBottom: 20 },

  detailText: { fontSize: 18, marginBottom: 10, textAlign: 'center' },

});

 

export default DetalhesPontoTuristico;