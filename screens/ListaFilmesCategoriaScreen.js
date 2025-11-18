import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity, 
  StatusBar,
  Animated
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { TMDB_API_KEY } from '@env';
import { useTheme } from '../context/ThemeContext';
import FilmeCard from '../components/FilmeCard';

const API_KEY = TMDB_API_KEY;

const getGenreIcon = (id) => {
  const icons = {
    28: "flame",
    12: "compass",
    35: "happy",
    27: "skull",
    878: "planet",
    10749: "heart",
    16: "color-palette",
    18: "film",
  };
  return icons[id] || "grid";
};

const ListaFilmesCategoriaScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors: COLORS, theme } = useTheme();
  
  const { genreId, genreName } = route.params;

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const scrollY = new Animated.Value(0);

  const styles = getStyles(COLORS);

  const fetchMoviesByGenre = useCallback(async (pageNumber = 1) => {
    if (!API_KEY) {
      setError("Chave de API ausente");
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/discover/movie', {
        params: {
          api_key: API_KEY,
          language: 'pt-BR',
          with_genres: genreId,
          page: pageNumber,
          sort_by: 'popularity.desc',
          include_adult: false,
        }
      });

      const newMovies = response.data.results;

      if (pageNumber === 1) {
        setMovies(newMovies);
      } else {
        setMovies(prevMovies => {
            const existingIds = new Set(prevMovies.map(m => m.id));
            const filteredNewMovies = newMovies.filter(m => !existingIds.has(m.id));
            return [...prevMovies, ...filteredNewMovies];
        });
      }

    } catch (err) {
      setError(err.message || 'Erro ao buscar filmes');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [genreId]);

  useEffect(() => {
    fetchMoviesByGenre(1);
  }, [fetchMoviesByGenre]);

  const handleLoadMore = () => {
    if (!loadingMore && !loading) {
      setLoadingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMoviesByGenre(nextPage);
    }
  };

  const handleMediaPress = (media) => {
    navigation.navigate('DetalhesFilme', { mediaItem: media });
  };

  const renderFooter = () => {
    if (!loadingMore) return <View style={styles.footerSpacer} />;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={COLORS.accent1} />
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.listHeaderContainer}>
      <View style={styles.genreIconBadge}>
        <Ionicons name={getGenreIcon(genreId)} size={32} color={COLORS.accent1} />
      </View>
      <Text style={styles.listHeaderTitle}>
        Explorando <Text style={styles.highlightText}>{genreName}</Text>
      </Text>
      <Text style={styles.listHeaderSubtitle}>
        Os filmes mais populares desta categoria
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.accent1} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Ionicons name="cloud-offline-outline" size={64} color={COLORS.accent2} style={{ marginBottom: 20 }} />
        <Text style={styles.errorText}>Não foi possível carregar os filmes.</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            setLoading(true);
            fetchMoviesByGenre(1);
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
        data={movies}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <FilmeCard
            media={item}
            onPress={() => handleMediaPress(item)}
            isCarousel={false}
          />
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const getStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.headerBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
    elevation: 2,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  placeholderBox: {
    width: 40,
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
    borderRadius: 35,
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
  },
  highlightText: {
    color: COLORS.accent1,
  },
  listHeaderSubtitle: {
    fontSize: 14,
    color: COLORS.textPrimary,
    opacity: 0.6,
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
    backgroundColor: COLORS.accent1,
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