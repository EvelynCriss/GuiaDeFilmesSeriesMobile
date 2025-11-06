// components/CollectionCardItem.js
import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import { COLORS } from './ColorPalete';

// A constante da URL base do pôster é necessária aqui
const POSTER_BASE_URL_W500 = 'https://image.tmdb.org/t/p/w500';

const CollectionCardItem = ({ item, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.collectionCard}>
    <Image
      source={{
        uri: item.poster_path
          ? `${POSTER_BASE_URL_W500}${item.poster_path}`
          : 'https://via.placeholder.com/200x300.png?text=No+Image',
      }}
      style={styles.collectionPoster}
    />
    <Text style={styles.collectionTitle} numberOfLines={2}>
      {item.title}
    </Text>
    {item.release_date ? (
      <Text style={styles.collectionYear}>
        {new Date(item.release_date).getFullYear()}
      </Text>
    ) : null}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
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