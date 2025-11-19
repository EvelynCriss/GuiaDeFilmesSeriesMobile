import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity, 
  StatusBar
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { TMDB_API_KEY } from '@env';
import { useTheme } from '../context/ThemeContext';
import FilmeCard from '../components/FilmeCard';

const API_KEY = TMDB_API_KEY;

const ListaFilmesCategoriaScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors: COLORS, theme } = useTheme();
  
  const { genreId, genreName, mediaType = 'movie', iconName } = route.params;

  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);

  const isMovie = mediaType === 'movie';
  
  const accentColor = mediaType === 'tv' ? COLORS.accent3 : COLORS.accent1;
  const iconBorderRadius = mediaType === 'tv' ? 14 : 35;

  const styles = getStyles(COLORS, accentColor, iconBorderRadius);

  const fetchMediaByGenre = useCallback(async (pageNumber = 1) => {
    if (!API_KEY) {
      setError("Chave de API ausente");
      setLoading(false);
      return;
    }

    try {
      const endpoint = `/discover/${mediaType}`;
      
      const response = await api.get(endpoint, {
        params: {
          api_key: API_KEY,
          language: 'pt-BR',
          with_genres: genreId,
          page: pageNumber,
          sort_by: 'popularity.desc',
          include_adult: false,
          include_null_first_air_dates: false,
        }
      });

      const rawResults = response.data.results;
      const normalizedResults = rawResults.map(item => ({
          ...item,
          media_type: mediaType,
          title: item.title || item.name, 
          release_date: item.release_date || item.first_air_date
      }));

      if (pageNumber === 1) {
        setMediaList(normalizedResults);
      } else {
        setMediaList(prevList => {
            const existingIds = new Set(prevList.map(m => m.id));
            const filteredNew = normalizedResults.filter(m => !existingIds.has(m.id));
            return [...prevList, ...filteredNew];
        });
      }

    } catch (err) {
      setError(err.message || 'Erro ao buscar títulos');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [genreId, mediaType]);

  useEffect(() => {
    fetchMediaByGenre(1);
  }, [fetchMediaByGenre]);

  const handleLoadMore = () => {
    if (!loadingMore && !loading) {
      setLoadingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMediaByGenre(nextPage);
    }
  };

  const handleMediaPress = useCallback((media) => {
    navigation.navigate('DetalhesFilme', { mediaItem: media });
  }, [navigation]);

  // OTIMIZAÇÃO: renderItem memoizado para evitar recriação a cada render
  const renderItem = useCallback(({ item }) => (
    <FilmeCard
      media={item}
      onPress={() => handleMediaPress(item)}
      isCarousel={false}
    />
  ), [handleMediaPress]);

  const renderFooter = () => {
    if (!loadingMore) return <View style={styles.footerSpacer} />;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={accentColor} />
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.listHeaderContainer}>
      <View style={styles.genreIconBadge}>
        <Ionicons name={iconName || "grid-outline"} size={32} color={accentColor} />
      </View>
      <Text style={styles.listHeaderTitle}>
        Explorando <Text style={styles.highlightText}>{genreName}</Text>
      </Text>
      <Text style={styles.listHeaderSubtitle}>
        {isMovie ? 'Os filmes' : 'As séries'} mais populares desta categoria
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={accentColor} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Ionicons name="cloud-offline-outline" size={64} color={COLORS.accent2} style={{ marginBottom: 20 }} />
        <Text style={styles.errorText}>Não foi possível carregar o conteúdo.</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            setLoading(true);
            fetchMediaByGenre(1);
          }}
        >
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={theme === 'light' ? 'dark-content' : 'light-content'} backgroundColor={COLORS.headerBackground} />

      <FlatList
        data={mediaList}
        keyExtractor={(item) => `${mediaType}-${item.id}`}
        renderItem={renderItem} // Usa a função memoizada
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        
        // --- PROPS DE OTIMIZAÇÃO ---
        initialNumToRender={8}       // Renderiza apenas o suficiente para a tela inicial
        maxToRenderPerBatch={6}      // Renderiza em lotes menores
        windowSize={5}               // Mantém menos itens na memória (padrão é 21)
        removeClippedSubviews={true} // Desmonta views fora da tela (essencial para Android)
        updateCellsBatchingPeriod={50} // Delay entre renderizações de lote
      />
    </View>
  );
};

const getStyles = (COLORS, accentColor, iconBorderRadius) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listHeaderContainer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: COLORS.background,
    marginBottom: 10,
  },
  genreIconBadge: {
    width: 70,
    height: 70,
    borderRadius: iconBorderRadius,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  listHeaderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  highlightText: {
    color: accentColor,
  },
  listHeaderSubtitle: {
    fontSize: 14,
    color: COLORS.textPrimary,
    opacity: 0.6,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 30,
  },
  loadingFooter: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerSpacer: {
    height: 24,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: accentColor,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    elevation: 3,
  },
  retryButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ListaFilmesCategoriaScreen;