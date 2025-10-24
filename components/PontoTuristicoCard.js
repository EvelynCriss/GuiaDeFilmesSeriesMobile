// components/PontoTuristicoCard.js
import React from 'react';
// <--- MUDANÇA: Importado Image
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'; 
import { Ionicons } from '@expo/vector-icons'; 
import { useFavorites } from '../context/FavoritesContext'; 
 
// <--- MUDANÇA: Renomeada a prop 'ponto' para 'filme' para clareza
const PontoTuristicoCard = ({ ponto: filme, onPress }) => { 
  const { isFavorite, toggleFavorite } = useFavorites(); 
 
  const handleToggleFavorite = () => {
    // <--- MUDANÇA: Usando filme.imdbID
    toggleFavorite(filme.imdbID); 
  };
 
  // <--- MUDANÇA: Usando filme.imdbID
  const favoriteIconName = isFavorite(filme.imdbID) ? 'heart' : 'heart-outline';
  const favoriteIconColor = isFavorite(filme.imdbID) ? 'red' : 'gray';
 
  return (
    <TouchableOpacity onPress={onPress} style={styles.touchable}>
      <View style={styles.card}>
        {/* <--- MUDANÇA: Adicionado Pôster do filme */}
        <Image 
          source={{ uri: filme.Poster !== 'N/A' ? filme.Poster : 'https://via.placeholder.com/100x150.png?text=No+Image' }} 
          style={styles.poster} 
        />
        <View style={styles.infoContainer}>
          {/* <--- MUDANÇA: Exibindo Título e Ano */}
          <Text style={styles.titulo}>{filme.Title}</Text>
          <Text style={styles.descricao}>{filme.Year}</Text>
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
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10, // <--- MUDANÇA: Ajuste no padding
    marginVertical: 8, // <--- MUDANÇA: Ajuste na margem
    marginHorizontal: 16, // <--- MUDANÇA: Ajuste na margem
    borderRadius: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5,
  },
  // <--- MUDANÇA: Estilo para o Pôster
  poster: {
    width: 60,
    height: 90,
    borderRadius: 4,
    marginRight: 15,
  },
  infoContainer: { flex: 1, marginRight: 10 }, 
  titulo: { fontSize: 18, fontWeight: 'bold', color: '#333' }, // <--- MUDANÇA: Ajuste fonte
  descricao: { fontSize: 14, color: '#666', marginTop: 4 }, // <--- MUDANÇA: Ajuste fonte
  favoriteButton: { padding: 5 }, 
});
 
export default PontoTuristicoCard;