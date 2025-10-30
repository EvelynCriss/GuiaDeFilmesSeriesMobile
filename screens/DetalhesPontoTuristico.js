// screens/DetalhesPontoTuristico.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Button, Alert, ActivityIndicator } from 'react-native'; // <--- Importe Button, Alert, ActivityIndicator
import { useRoute, useNavigation } from '@react-navigation/native';
import { deletePost } from '../services/api'; // <--- Importe deletePost

const DetalhesPontoTuristico = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { pontoDetalhes } = route.params;
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: pontoDetalhes.nome });
  }, [pontoDetalhes.nome, navigation]);

  const handleDelete = async () => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir "${pontoDetalhes.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          onPress: async () => {
            setIsLoading(true);
            try {
              await deletePost(pontoDetalhes.id); // <--- Chama a função de exclusão
              Alert.alert('Sucesso', 'Ponto turístico excluído com sucesso!');
              navigation.goBack(); // Volta para a lista
            } catch (error) {
              console.error("Erro ao excluir ponto turístico:", error);
              Alert.alert('Erro', 'Não foi possível excluir o ponto turístico. Tente novamente.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: pontoDetalhes.imagem }} style={styles.imagem} />
      <View style={styles.content}>
        <Text style={styles.titulo}>{pontoDetalhes.nome}</Text>
        <Text style={styles.descricao}>{pontoDetalhes.detalhesCompletos}</Text>

        {/* <--- Botões de Ação */}
        <View style={styles.buttonContainer}>
          <Button
            title="Editar Ponto"
            onPress={() => navigation.navigate('GerenciarPonto', { pontoDetalhes })} // Navega para a tela de gerenciamento com o ponto para edição
            color="#007bff"
            disabled={isLoading}
          />
          <View style={{ width: 10 }} /> {/* Espaçamento */}
          <Button
            title="Excluir Ponto"
            onPress={handleDelete}
            color="#dc3545" // Cor vermelha para exclusão
            disabled={isLoading}
          />
        </View>

        {isLoading && (
          <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  imagem: { width: '100%', height: 250, resizeMode: 'cover' },
  content: { padding: 20 },
  titulo: { fontSize: 26, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  descricao: { fontSize: 16, lineHeight: 24, color: '#555' },
  buttonContainer: { // <--- Estilo para o container dos botões
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
    marginBottom: 20,
  },
  loadingIndicator: { marginTop: 20 },
});

export default DetalhesPontoTuristico;