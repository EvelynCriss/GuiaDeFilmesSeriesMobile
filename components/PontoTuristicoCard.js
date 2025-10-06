// components/PontoTuristicoCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // <--- Importe Ionicons
import { useFavorites } from '../context/FavoritesContext'; // <--- Importe useFavorites
 
const PontoTuristicoCard = ({ ponto, onPress }) => { // <--- Recebe o objeto 'ponto' completo
  const { isFavorite, toggleFavorite } = useFavorites(); // <--- Use o hook do contexto
 
  const handleToggleFavorite = () => {
    toggleFavorite(ponto.id); // <--- Usa a função do contexto com o ID do ponto
  };
 
  const favoriteIconName = isFavorite(ponto.id) ? 'heart' : 'heart-outline'; // <--- Lógica do ícone
  const favoriteIconColor = isFavorite(ponto.id) ? 'red' : 'gray';
 
  return (
    <TouchableOpacity onPress={onPress} style={styles.touchable}>
      <View style={styles.card}>
        <View style={styles.infoContainer}> {/* <--- Novo container para info e favorito */}
          <Text style={styles.titulo}>{ponto.nome}</Text>
          <Text style={styles.descricao}>{ponto.descricao}</Text>
        </View>
        <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteButton}>
          <Ionicons name={favoriteIconName} size={24} color={favoriteIconColor} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};
 
const styles = StyleSheet.create({
  touchable: { width: '100%' },
  card: {
    flexDirection: 'row', // <--- Para alinhar info e botão lado a lado
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 20,
    borderRadius: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5,
  },
  infoContainer: { flex: 1, marginRight: 10 }, // <--- Para info ocupar o espaço restante
  titulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 5, color: '#333' },
  descricao: { fontSize: 14, color: '#666' },
  favoriteButton: { padding: 5 }, // <--- Estilo do botão de favorito
});
 
export default PontoTuristicoCard;