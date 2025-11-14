// components/CollectionCardItem.js
import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const POSTER_BASE_URL_W500 = 'https://image.tmdb.org/t/p/w500';

const CollectionCardItem = ({ item, onPress }) => {
  const { colors: COLORS } = useTheme(); 
  const styles = getStyles(COLORS); 

  const imageUri = item?.poster_path 
    ? `${POSTER_BASE_URL_W500}${item.poster_path}` 
    : 'https://via.placeholder.com/140x210.png?text=No+Image';

  return (
    <TouchableOpacity onPress={onPress} style={styles.collectionCard}>
      <Image
        source={{ uri: imageUri }}
        style={styles.collectionPoster}
        resizeMode="cover"
      />
      <Text style={styles.collectionTitle} numberOfLines={2}>
        {item.title}
      </Text>
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
    
    // --- A CORREÇÃO ESTÁ AQUI ---
    // Impede o TouchableOpacity de esticar verticalmente
    // para preencher o padding do container da FlatList.
    alignSelf: 'flex-start', 
  },
  collectionPoster: {
    width: 140,
    height: 210,
    borderRadius: 10,
    backgroundColor: COLORS.infoBoxBg,
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