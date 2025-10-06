import React from 'react';
import { View, Text, StyleSheet, Button, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // <--- Importe Ionicons
import { useFavorites } from '../context/FavoritesContext'; // <--- Importe useFavorites
 
const DetalhesPontoTuristico = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { isFavorite, toggleFavorite } = useFavorites(); // <--- Use o hook do contexto
 
  const { pontoDetalhes } = route.params;
 
  if (!pontoDetalhes) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Detalhes do ponto turístico não encontrados.</Text>
        <Button title="Voltar" onPress={() => navigation.goBack()} />
      </View>
    );
  }
 
  const handleToggleFavorite = () => {
    toggleFavorite(pontoDetalhes.id); // <--- Usa a função do contexto com o ID do ponto
  };
 
  const favoriteIconName = isFavorite(pontoDetalhes.id) ? 'heart' : 'heart-outline';
  const favoriteIconColor = isFavorite(pontoDetalhes.id) ? 'red' : 'gray';
 
  return (
    <ScrollView style={styles.scrollViewContainer}>
      <View style={styles.contentContainer}>
        <View style={styles.header}> {/* <--- Novo container para título e favorito */}
          <Text style={styles.title}>{pontoDetalhes.nome}</Text>
          <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteButton}>
            <Ionicons name={favoriteIconName} size={30} color={favoriteIconColor} />
          </TouchableOpacity>
        </View>
        <Text style={styles.detailText}>ID: {pontoDetalhes.id}</Text>
        <Text style={styles.descriptionText}>{pontoDetalhes.descricao}</Text>
        <Text style={styles.extraDetails}>Detalhes Completos: {pontoDetalhes.detalhesCompletos}</Text>
        <Button title="Voltar para a Lista" onPress={() => navigation.goBack()} />
      </View>
    </ScrollView>
  );
};
 
const styles = StyleSheet.create({
  scrollViewContainer: { flex: 1, backgroundColor: '#f5f5f5' },
  contentContainer: { padding: 20, alignItems: 'center' },
  header: { // <--- Estilo para alinhar título e botão de favorito
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%', // Para ocupar toda a largura
    marginBottom: 15,
  },
  title: { fontSize: 28, fontWeight: 'bold', flexShrink: 1, marginRight: 10 }, // flexShrink para quebrar linha se o título for muito longo
  favoriteButton: { padding: 5 },
  detailText: { fontSize: 16, marginBottom: 10, color: '#666' },
  descriptionText: { fontSize: 16, lineHeight: 24, textAlign: 'justify', marginBottom: 20, color: '#444' },
  extraDetails: { fontSize: 14, fontStyle: 'italic', color: '#888', marginBottom: 30 },
  errorText: { fontSize: 18, color: 'red', textAlign: 'center', marginVertical: 50 }
});
 
export default DetalhesPontoTuristico;