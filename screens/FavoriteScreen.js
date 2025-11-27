import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useFavorites } from '../context/FavoritesContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import FilmeCard from '../components/FilmeCard';
import { TMDB_API_KEY } from '@env';

const FavoritesScreen = () => {
  const navigation = useNavigation();
  const { colors: COLORS } = useTheme();
  const insets = useSafeAreaInsets();
  
  const { favoriteIds } = useFavorites();
  const [favoriteMedia, setFavoriteMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMediaDetails = async (id) => {
    try {
      const params = { api_key: TMDB_API_KEY, language: 'pt-BR' };
      try {
        const response = await api.get(`/movie/${id}`, { params });
        return { ...response.data, media_type: 'movie' };
      } catch (error) {
        const responseTv = await api.get(`/tv/${id}`, { params });
        return { 
            ...responseTv.data, 
            media_type: 'tv',
            title: responseTv.data.name, 
            release_date: responseTv.data.first_air_date 
        };
      }
    } catch (error) {
      console.warn(`Item ${id} não encontrado.`);
      return null;
    }
  };

  const loadFavorites = useCallback(async () => {
    if (favoriteIds.length === 0) {
      setFavoriteMedia([]);
      return;
    }
    setLoading(true);
    try {
      const promises = favoriteIds.map(id => fetchMediaDetails(id));
      const results = await Promise.all(promises);
      const validResults = results.filter(item => item !== null).reverse();
      setFavoriteMedia(validResults);
    } catch (error) {
      console.error("Erro ao carregar favoritos:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [favoriteIds]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const onRefresh = () => {
    setRefreshing(true);
    loadFavorites();
  };

  const handleMediaPress = (media) => {
    navigation.navigate('DetalhesFilme', { mediaItem: media });
  };

  if (loading && !refreshing && favoriteMedia.length === 0) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: COLORS.background }]}>
        <ActivityIndicator size="large" color={COLORS.accent1} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: COLORS.background }]}>
      
      {favoriteMedia.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-dislike-outline" size={80} color={COLORS.textPrimary} style={{ opacity: 0.3 }} />
          <Text style={[styles.emptyText, { color: COLORS.textPrimary }]}>
            Sua lista está vazia
          </Text>
          <Text style={[styles.emptySubText, { color: COLORS.textPrimary }]}>
            Adicione filmes e séries aos favoritos para vê-los aqui.
          </Text>
        </View>
      ) : (
        <FlatList
          data={favoriteMedia}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          key={2}
          
          columnWrapperStyle={{ 
            justifyContent: 'center', 
            marginBottom: 20,
          }}
          
          renderItem={({ item }) => (
            <FilmeCard 
              media={item} 
              onPress={() => handleMediaPress(item)}
              isCarousel={true} 
            />
          )}

          contentContainerStyle={{
            paddingTop: 60 + insets.top, 
            paddingBottom: 80 + insets.bottom,
            paddingLeft: 15, 
            paddingRight: 0 
          }}
          
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent1} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
    opacity: 0.6,
  },
});

export default FavoritesScreen;