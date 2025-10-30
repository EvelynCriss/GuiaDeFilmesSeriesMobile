// screens/GerenciarPontoTuristico.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Button, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { createPost, updatePost } from '../services/api'; // <--- Importe as funções de API

const GerenciarPontoTuristico = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { pontoDetalhes } = route.params || {}; // Recebe ponto para edição, se houver

  const [title, setTitle] = useState(pontoDetalhes ? pontoDetalhes.nome : '');
  const [body, setBody] = useState(pontoDetalhes ? pontoDetalhes.descricao : '');
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!pontoDetalhes; // Verdadeiro se estamos editando um ponto existente

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Editar Ponto Turístico' : 'Adicionar Ponto Turístico',
    });
  }, [isEditing, navigation]);

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Campos Vazios', 'Por favor, preencha o título e a descrição do ponto turístico.');
      return;
    }

    setIsLoading(true);
    try {
      if (isEditing) {
        // Requisição PUT para atualizar
        await updatePost(pontoDetalhes.id, { title, body });
        Alert.alert('Sucesso', 'Ponto turístico atualizado com sucesso!');
      } else {
        // Requisição POST para criar
        await createPost({ title, body, userId: 1 }); // userId é necessário para jsonplaceholder
        Alert.alert('Sucesso', 'Novo ponto turístico adicionado com sucesso!');
      }
      navigation.goBack(); // Volta para a tela anterior (ListaPontosTuristicos)
    } catch (error) {
      console.error("Erro ao salvar ponto turístico:", error);
      Alert.alert('Erro', 'Não foi possível salvar o ponto turístico. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Título do Ponto</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Jardim Botânico"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Descrição</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Descreva o ponto turístico..."
        value={body}
        onChangeText={setBody}
        multiline
        numberOfLines={4}
      />

      <Button
        title={isEditing ? "Atualizar Ponto" : "Adicionar Ponto"}
        onPress={handleSubmit}
        disabled={isLoading}
      />

      {isLoading && (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  label: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, marginTop: 15, color: '#333' },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top', // Para que o texto comece no topo em Android
  },
  loadingIndicator: { marginTop: 20 },
});

export default GerenciarPontoTuristico;