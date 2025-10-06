// screens/ListaPontosTuristicos.js
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PontoTuristicoCard from '../components/PontoTuristicoCard'; // <-- 1. IMPORTAÇÃO ADICIONADA

const pontosTuristicos = [
  {
    id: '1',
    nome: 'Parque Barigui',
    descricao: 'Um lindo parque em Curitiba com capivaras.',
    detalhesCompletos: 'É um dos maiores e mais antigos parques da cidade, oferecendo amplas áreas verdes, lagos, e pistas para caminhada e ciclismo.'
  },
  {
    id: '2',
    nome: 'Jardim Botânico',
    descricao: 'A famosa estufa de vidro e jardins franceses.',
    detalhesCompletos: 'Inspirado nos jardins franceses, sua estufa abriga espécies botânicas que são referência nacional, além de uma galeria de arte.'
  },
  {
    id: '3',
    nome: 'Ópera de Arame',
    descricao: 'Um teatro construído com tubos de aço e vidro.',
    detalhesCompletos: 'Com estrutura tubular e teto transparente, a Ópera de Arame é um dos símbolos de Curitiba, integrada à natureza do Parque das Pedreiras.'
  },
];

const ListaPontosTuristicos = () => {
  const navigation = useNavigation();

  // --- 2. FUNÇÃO handlePontoPress CRIADA ---
  // Ela recebe o objeto completo do ponto turístico (item)
  const handlePontoPress = (ponto) => {
    // Navega para 'DetalhesPonto' e passa o objeto como parâmetro
    navigation.navigate('DetalhesPonto', { pontoDetalhes: ponto });
  };

  return (
    <View style={styles.container}>
      {/* O Text foi movido para fora do FlatList para ser um título fixo */}
      <Text style={styles.title}>Lista de Pontos Turísticos</Text>
      <FlatList
        style={{ width: '100%' }} // Garante que a FlatList ocupe a largura
        data={pontosTuristicos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PontoTuristicoCard
            ponto={item}
            onPress={() => handlePontoPress(item)} // Chama a nova função
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center', // Removido para a lista começar do topo
    alignItems: 'center',
    paddingTop: 40, // Adiciona um espaço no topo
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
});

export default ListaPontosTuristicos;