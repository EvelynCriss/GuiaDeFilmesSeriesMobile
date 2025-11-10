// components/CollectionCardItem.js
import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const POSTER_BASE_URL_W500 = 'https://image.tmdb.org/t/p/w500';

const CollectionCardItem = ({ item, onPress }) => {
  const { colors: COLORS } = useTheme(); 
  const styles = getStyles(COLORS); 

  // --- CORREÇÃO AQUI ---
  // Define a URI da imagem. Usa o poster_path se existir, senão um placeholder.
  const imageUri = item?.poster_path 
    ? `${POSTER_BASE_URL_W500}${item.poster_path}` 
    : 'https://via.placeholder.com/140x210.png?text=No+Image';
  // --- FIM DA CORREÇÃO ---

  return (
    <TouchableOpacity onPress={onPress} style={styles.collectionCard}>
      <Image
        // --- CORREÇÃO AQUI ---
        // Adiciona a propriedade 'source' que estava faltando
        source={{ uri: imageUri }}
        // --- FIM DA CORREÇÃO ---
        style={styles.collectionPoster}
        resizeMode="cover" // Garante que a imagem cubra o espaço
      />
      <Text style={styles.collectionTitle} numberOfLines={2}>
        {item.title}
      </Text>
      {/* Adicionei o ano de volta, pois é útil */}
      {item.release_date && (
         <Text style={styles.collectionYear}>
           {item.release_date.split('-')[0]}
         </Text>
      )}
    </TouchableOpacity>
  );
};

const getStyles = (COLORS) => StyleSheet.create({
  collectionCard: {
    width: 140,
    marginRight: 15,
    alignItems: 'center',
  },
  collectionPoster: {
    width: 140,
    height: 210,
    borderRadius: 10,
    backgroundColor: COLORS.infoBoxBg, // Cor de placeholder
    marginBottom: 10,
  },
  collectionTitle: {
    fontSize: 14,
    color: COLORS.textPrimary,
    textAlign: 'center',
    fontWeight: '600',
  },
  collectionYear: {
    fontSize: 12,
    color: COLORS.textPrimary,
    opacity: 0.7,
    marginTop: 2,
  },
});

export default CollectionCardItem;