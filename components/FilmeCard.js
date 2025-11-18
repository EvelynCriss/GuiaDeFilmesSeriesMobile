import React from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../context/FavoritesContext';
import { useTheme } from '../context/ThemeContext';

const POSTER_BASE_URL_W300 = 'https://image.tmdb.org/t/p/w300';
const POSTER_BASE_URL_W500 = 'https://image.tmdb.org/t/p/w500';

const FilmeCard = ({ media, onPress, isCarousel = false }) => { 
  const { isFavorite, toggleFavorite } = useFavorites();
  const { colors: COLORS } = useTheme();

  const handleToggleFavorite = () => {
    toggleFavorite(media.id);
  };

  const isFav = isFavorite(media.id);
  const favoriteIconName = isFav ? 'heart' : 'heart-outline';
  // No carrossel, o ícone fica sobre a imagem, então precisa de contraste (branco ou cor de destaque)
  // Na lista, usa a cor do tema.
  const favoriteIconColor = isCarousel 
    ? (isFav ? COLORS.accent1 : '#FFFFFF') 
    : (isFav ? COLORS.accent1 : COLORS.textPrimary);

  const rating = media.vote_average ? media.vote_average.toFixed(1) : '-';
  const year = media.release_date ? media.release_date.split('-')[0] : 'N/A';
  
  // Tratamento para não quebrar se não tiver idioma
  const language = media.original_language ? media.original_language.toUpperCase() : '';

  const styles = getStyles(COLORS, isCarousel);

  // --- MODO CARROSSEL (Vertical) ---
  if (isCarousel) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.touchableCarousel}>
        <View style={styles.cardCarousel}>
          {/* Imagem / Pôster */}
          <View style={styles.posterContainerCarousel}>
             <Image
              source={{ uri: media.poster_path ? `${POSTER_BASE_URL_W500}${media.poster_path}` : 'https://via.placeholder.com/300x450.png?text=No+Image' }}
              style={styles.posterCarousel}
            />
            {/* Botão de Favorito flutuante sobre a imagem */}
            <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteButtonCarousel}>
              <Ionicons name={isFav ? "heart" : "heart-outline"} size={20} color={favoriteIconColor} />
            </TouchableOpacity>
             {/* Badge de Nota flutuante */}
            <View style={styles.ratingBadgeCarousel}>
                <Ionicons name="star" size={10} color={COLORS.background} />
                <Text style={styles.ratingTextCarousel}>{rating}</Text>
            </View>
          </View>

          {/* Informações abaixo da imagem */}
          <View style={styles.infoContainerCarousel}>
            <Text style={styles.tituloCarousel} numberOfLines={1}>{media.title}</Text>
            <Text style={styles.subTituloCarousel}>{year}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // --- MODO LISTA (Horizontal) ---
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [
        styles.touchable,
        { transform: [{ scale: pressed ? 0.98 : 1 }] }
      ]}>
      <View style={styles.card}>
        <Image
          source={{ uri: media.poster_path ? `${POSTER_BASE_URL_W300}${media.poster_path}` : 'https://via.placeholder.com/200x300.png?text=No+Image' }}
          style={styles.poster}
        />
        
        <View style={styles.infoContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.titulo} numberOfLines={2}>{media.title}</Text>
            <Pressable onPress={handleToggleFavorite} style={styles.favoriteButton}>
              <Ionicons name={favoriteIconName} size={22} color={favoriteIconColor} />
            </Pressable>
          </View>

          <View style={styles.metaContainer}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color={COLORS.accent3} />
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.yearText}>{year}</Text>
            {language ? (
              <>
                <Text style={styles.separator}>•</Text>
                <View style={styles.langBadge}>
                  <Text style={styles.langText}>{language}</Text>
                </View>
              </>
            ) : null}
          </View>

          <Text style={styles.overview} numberOfLines={3}>
            {media.overview || 'Sinopse indisponível.'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const getStyles = (COLORS, isCarousel) => StyleSheet.create({
  // --- ESTILOS GERAIS (Lista) ---
  touchable: { 
    width: '100%',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface || COLORS.infoBoxBg,
    borderRadius: 12,
    overflow: 'hidden',
    // Sombra suave
    elevation: 3,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  poster: {
    width: 100,
    height: 150,
    backgroundColor: COLORS.background,
  },
  infoContainer: { 
    flex: 1, 
    padding: 12,
    justifyContent: 'flex-start',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  titulo: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 8,
    lineHeight: 22,
  },
  favoriteButton: { 
    padding: 4,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: 4,
  },
  separator: {
    marginHorizontal: 6,
    color: COLORS.textPrimary,
    opacity: 0.4,
    fontSize: 10,
  },
  yearText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    opacity: 0.8,
  },
  langBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle || 'rgba(128,128,128,0.2)',
  },
  langText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    opacity: 0.8,
  },
  overview: {
    fontSize: 13,
    color: COLORS.textPrimary,
    opacity: 0.6,
    lineHeight: 18,
  },

  // --- ESTILOS CARROSSEL (Vertical) ---
  touchableCarousel: {
    width: 150, // Largura fixa mais compacta
    marginRight: 15,
  },
  cardCarousel: {
    borderRadius: 12,
    backgroundColor: 'transparent', // Fundo transparente para focar na imagem
  },
  posterContainerCarousel: {
    width: 150,
    height: 225, // Proporção padrão de pôster (2:3)
    borderRadius: 12,
    elevation: 5,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    marginBottom: 8,
    position: 'relative',
  },
  posterCarousel: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: COLORS.infoBoxBg,
  },
  infoContainerCarousel: {
    paddingHorizontal: 4,
  },
  tituloCarousel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  subTituloCarousel: {
    fontSize: 12,
    color: COLORS.textPrimary,
    opacity: 0.6,
  },
  favoriteButtonCarousel: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)', // Fundo escuro translúcido para contraste
    borderRadius: 20,
    padding: 6,
  },
  ratingBadgeCarousel: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingTextCarousel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.background, // Contraste com a cor de destaque
    marginLeft: 4,
  },
});

export default FilmeCard;