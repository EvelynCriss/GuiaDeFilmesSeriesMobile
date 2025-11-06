// components/FilmeCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../context/FavoritesContext';

const POSTER_BASE_URL_W200 = 'https://image.tmdb.org/t/p/w200';

// <--- MUDANÇA: Nome do componente e prop de 'ponto: filme' para 'media'
const FilmeCard = ({ media, onPress }) => { 
  const { isFavorite, toggleFavorite } = useFavorites();

  const handleToggleFavorite = () => {
    toggleFavorite(media.id); // <--- MUDANÇA: usa media.id
  };

  const favoriteIconName = isFavorite(media.id) ? 'heart' : 'heart-outline'; // <--- MUDANÇA: usa media.id
  const favoriteIconColor = isFavorite(media.id) ? 'red' : 'gray';

  // <--- MUDANÇA: usa media.release_date
  const year = media.release_date ? media.release_date.split('-')[0] : 'N/A';

  return (
    <TouchableOpacity onPress={onPress} style={styles.touchable}>
      <View style={styles.card}>
        {/* <--- MUDANÇA: usa media.poster_path */}
        <Image
          source={{ uri: media.poster_path ? `${POSTER_BASE_URL_W200}${media.poster_path}` : 'https://via.placeholder.com/100x150.png?text=No+Image' }}
          style={styles.poster}
        />
        <View style={styles.infoContainer}>
          {/* <--- MUDANÇA: usa media.title */}
          <Text style={styles.titulo}>{media.title}</Text>
          <Text style={styles.descricao}>{year}</Text>
        </View>
        <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteButton}>
          <Ionicons name={favoriteIconName} size={24} color={favoriteIconColor} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

// ... (estilos permanecem os mesmos)
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

// <--- MUDANÇA: Exporta o novo nome
export default FilmeCard;