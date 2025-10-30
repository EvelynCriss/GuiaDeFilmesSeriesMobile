// components/PontoTuristicoCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../context/FavoritesContext';

// <--- MUDANÇA: URL base para imagens da TMDb (tamanho menor para lista)
const POSTER_BASE_URL_W200 = 'https://image.tmdb.org/t/p/w200';

const PontoTuristicoCard = ({ ponto: filme, onPress }) => {
  const { isFavorite, toggleFavorite } = useFavorites();

  const handleToggleFavorite = () => {
    toggleFavorite(filme.id); // <--- MUDANÇA: 'imdbID' virou 'id'
  };

  const favoriteIconName = isFavorite(filme.id) ? 'heart' : 'heart-outline'; // <--- MUDANÇA: 'imdbID' virou 'id'
  const favoriteIconColor = isFavorite(filme.id) ? 'red' : 'gray';

  // <--- MUDANÇA: Extrai o ano do 'release_date' (ex: "2023-10-30" vira "2023")
  const year = filme.release_date ? filme.release_date.split('-')[0] : 'N/A';

  return (
    <TouchableOpacity onPress={onPress} style={styles.touchable}>
      <View style={styles.card}>
        {/* <--- MUDANÇA: 'Poster' virou 'poster_path' e precisa da URL base */}
        <Image
          source={{ uri: filme.poster_path ? `${POSTER_BASE_URL_W200}${filme.poster_path}` : 'https://via.placeholder.com/100x150.png?text=No+Image' }}
          style={styles.poster}
        />
        <View style={styles.infoContainer}>
          {/* <--- MUDANÇA: 'Title' virou 'title' */}
          <Text style={styles.titulo}>{filme.title}</Text>
          {/* <--- MUDANÇA: 'Year' virou 'release_date' (formatado) */}
          <Text style={styles.descricao}>{year}</Text>
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
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5,
  },
  poster: {
    width: 60,
    height: 90,
    borderRadius: 4,
    marginRight: 15,
  },
  infoContainer: { flex: 1, marginRight: 10 },
  titulo: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  descricao: { fontSize: 14, color: '#666', marginTop: 4 },
  favoriteButton: { padding: 5 },
});

export default PontoTuristicoCard;