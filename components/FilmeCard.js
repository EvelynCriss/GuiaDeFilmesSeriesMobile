// components/FilmeCard.js
import React from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../context/FavoritesContext';
import { useTheme } from '../context/ThemeContext'; // <--- MUDANÇA: Importa o hook

const POSTER_BASE_URL_W200 = 'https://image.tmdb.org/t/p/w200';

const FilmeCard = ({ media, onPress, isCarousel = false }) => { 
  const { isFavorite, toggleFavorite } = useFavorites();
  const { colors: COLORS } = useTheme(); // <--- MUDANÇA: Pega as cores do tema

  const handleToggleFavorite = () => {
    toggleFavorite(media.id);
  };

  // <--- MUDANÇA: Usa as cores do tema ---
  const favoriteIconName = isFavorite(media.id) ? 'heart' : 'heart-outline';
  // Usa o 'accent1' para favorito e 'starOutline' (cinza) para não favorito
  const favoriteIconColor = isFavorite(media.id) ? COLORS.accent1 : COLORS.starOutline;

  const year = media.release_date ? media.release_date.split('-')[0] : 'N/A';

  // <--- MUDANÇA: Passa COLORS para a função de estilos ---
  const styles = getStyles(COLORS, isCarousel);

  if (isCarousel) {
    return (
      <TouchableOpacity onPress={onPress} style={styles.touchableCarousel}>
        <View style={styles.cardCarousel}>
          <Image
            source={{ uri: media.poster_path ? `https://image.tmdb.org/t/p/w500${media.poster_path}` : 'https://via.placeholder.com/300x450.png?text=No+Image' }}
            style={styles.posterCarousel}
          />
          <View style={styles.infoContainerCarousel}>
            <Text style={styles.tituloCarousel} numberOfLines={2}>{media.title}</Text>
            <Text style={styles.descricaoCarousel}>{year}</Text>
          </View>
          <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteButtonCarousel}>
            <Ionicons name={favoriteIconName} size={28} color={favoriteIconColor} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [
        styles.touchable,
        {
          transform: [{ scale: pressed ? 0.98 : 1 }] 
        }
      ]}>
      <View style={styles.card}>
        <Image
          source={{ uri: media.poster_path ? `${POSTER_BASE_URL_W200}${media.poster_path}` : 'https://via.placeholder.com/100x150.png?text=No+Image' }}
          style={styles.poster}
        />
        <View style={styles.infoContainer}>
          <Text style={styles.titulo}>{media.title}</Text>
          <Text style={styles.descricao}>{year}</Text>
        </View>
        <Pressable onPress={handleToggleFavorite} style={styles.favoriteButton}>
          <Ionicons name={favoriteIconName} size={24} color={favoriteIconColor} />
        </Pressable>
      </View>
    </Pressable>
  );
};

// <--- MUDANÇA: Estilos agora são uma função ---
const getStyles = (COLORS, isCarousel) => StyleSheet.create({
  touchable: { 
    width: '100%' 
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.infoBoxBg, // <--- Dinâmico (era '#fff')
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    shadowColor: COLORS.shadowColor, // <--- Dinâmico (era '#000')
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  poster: {
    width: 60,
    height: 90,
    borderRadius: 4,
    marginRight: 15,
    backgroundColor: COLORS.background, // <--- Placeholder dinâmico
  },
  infoContainer: { 
    flex: 1, 
    marginRight: 10 
  },
  titulo: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: COLORS.textPrimary // <--- Dinâmico (era '#333')
  },
  descricao: { 
    fontSize: 14, 
    color: COLORS.textPrimary, // <--- Dinâmico (era '#666')
    opacity: 0.7,              // <--- Adicionado
    marginTop: 4 
  },
  favoriteButton: { 
    padding: 5 
  },
  // Estilos para carrossel
  touchableCarousel: {
    width: 200,
    marginRight: 15,
  },
  cardCarousel: {
    alignItems: 'center',
    backgroundColor: COLORS.infoBoxBg,
    borderRadius: 12,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    overflow: 'hidden',
  },
  posterCarousel: {
    width: 200,
    height: 300,
    backgroundColor: COLORS.background,
  },
  infoContainerCarousel: {
    width: '100%',
    padding: 12,
    alignItems: 'center',
  },
  tituloCarousel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  descricaoCarousel: {
    fontSize: 14,
    color: COLORS.textPrimary,
    opacity: 0.7,
  },
  favoriteButtonCarousel: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
});

export default FilmeCard;