import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import FilmeCard from '../components/FilmeCard'; 
import api from '../services/api';
import { TMDB_API_KEY } from '@env';
import { useTheme } from '../context/ThemeContext';
import { movie_genres, show_genres } from '../components/GenreCollection';

const API_KEY = TMDB_API_KEY;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = 165; 

const ListaFilmesScreen = () => { 
  const navigation = useNavigation();
  const { colors: COLORS } = useTheme();
  const insets = useSafeAreaInsets();

  const [popularMovies, setPopularMovies] = useState([]);
  const [popularTV, setPopularTV] = useState([]); 
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMovies = useCallback(async () => {
    if (!API_KEY) {
      setError("Chave de API não encontrada");
      setLoading(false);
      return;
    }

    try {
      const [popularResponse, tvResponse] = await Promise.all([
        api.get('/movie/popular', { params: { api_key: API_KEY, language: 'pt-BR' } }),
        api.get('/tv/popular', { params: { api_key: API_KEY, language: 'pt-BR' } })
      ]);

      if (popularResponse.data.results) {
        const movies = popularResponse.data.results.map(m => ({...m, media_type: 'movie'}));
        setPopularMovies(movies);
        if (movies.length > 0) setFeaturedMovie(movies[0]);
      }

      if (tvResponse.data.results) {
        const shows = tvResponse.data.results.map(s => ({
            ...s, 
            media_type: 'tv',
            title: s.name,
            release_date: s.first_air_date
        }));
        setPopularTV(shows);
      }

    } catch (err) {
      let errorMessage = err.response ? `Erro ${err.response.status}` : `Erro: ${err.message}`;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const handleMediaPress = (media) => {
    navigation.navigate('DetalhesFilme', { mediaItem: media }); 
  };

  // AGORA ACEITA TYPE (movie ou tv)
  const handleCategoryPress = (genre, type) => {
    navigation.navigate('ListaFilmesCategoria', { 
      genreId: genre.id, 
      genreName: genre.name,
      mediaType: type,
      iconName: genre.icon
    });
  };

  const styles = getStyles(COLORS);

  const renderMediaItem = useCallback(({ item }) => (
    <FilmeCard
      media={item}
      onPress={() => handleMediaPress(item)}
      isCarousel={true}
    />
  ), [handleMediaPress]);

  // --- RENDERIZAÇÃO CATEGORIA FILME (Círculo) ---
  const renderMovieCategoryItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(item, 'movie')}
      activeOpacity={0.7}
    >
      <View style={styles.categoryIconContainerMovie}>
        <Ionicons name={item.icon} size={28} color={COLORS.accent1} />
      </View>
      <Text style={styles.categoryText} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  ), [COLORS, handleCategoryPress]);

  // --- RENDERIZAÇÃO CATEGORIA SÉRIE (Quadrado Arredondado + Cor Diferente) ---
  const renderSeriesCategoryItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(item, 'tv')}
      activeOpacity={0.7}
    >
      {/* Estilo diferente: Quadrado arredondado e cor accent3 */}
      <View style={styles.categoryIconContainerSeries}>
        <Ionicons name={item.icon} size={26} color={COLORS.accent3} />
      </View>
      <Text style={styles.categoryText} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  ), [COLORS, handleCategoryPress]);

  const getItemLayoutMedia = useCallback((data, index) => ({
    length: CARD_WIDTH,
    offset: CARD_WIDTH * index,
    index,
  }), []);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.accent1} /> 
        <Text style={styles.loadingText}>Carregando...</Text> 
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Ionicons name="alert-circle-outline" size={64} color={COLORS.accent1} style={{ marginBottom: 20 }} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => { setError(null); setLoading(true); fetchMovies(); }}
        >
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: 60 + insets.top,
        paddingBottom: 80 + insets.bottom 
      }}
    >
      {featuredMovie && (
        <TouchableOpacity 
          onPress={() => handleMediaPress(featuredMovie)}
          activeOpacity={0.9}
        >
          <View style={styles.heroContainer}>
            <Image
              source={{
                uri: featuredMovie.backdrop_path
                  ? `https://image.tmdb.org/t/p/w1280${featuredMovie.backdrop_path}`
                  : 'https://via.placeholder.com/800x450.png?text=No+Image'
              }}
              style={styles.heroImage}
            />
            <View style={styles.heroOverlay}>
              <View style={styles.heroContent}>
                <Text style={styles.heroBadge}>EM DESTAQUE</Text>
                <Text style={styles.heroTitle} numberOfLines={2}>
                  {featuredMovie.title}
                </Text>
                <Text style={styles.heroDescription} numberOfLines={3}>
                  {featuredMovie.overview || 'Descrição não disponível'}
                </Text>
                <View style={styles.heroButton}>
                  <Text style={styles.heroButtonText}>Ver Detalhes</Text>
                  <Ionicons name="arrow-forward" size={20} color={COLORS.background} />
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      )}

      <Text style={styles.title}>Filmes em Alta</Text>
      <FlatList
        data={popularMovies}
        renderItem={renderMediaItem}
        keyExtractor={(item) => `movie-${item.id}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContainer}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={3}
        removeClippedSubviews={true}
        snapToInterval={CARD_WIDTH}
        decelerationRate="fast"
        snapToAlignment="start"
        getItemLayout={getItemLayoutMedia}
      />

      <Text style={styles.title}>Categorias de Filmes</Text>
      <FlatList
        data={movie_genres}
        renderItem={renderMovieCategoryItem} // Renderizador Específico
        keyExtractor={(item) => `genre-movie-${item.id}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
        initialNumToRender={6}
      />

      <Text style={styles.title}>Séries Populares</Text>
      <FlatList
        data={popularTV}
        renderItem={renderMediaItem}
        keyExtractor={(item) => `tv-${item.id}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContainer}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={3}
        removeClippedSubviews={true}
        snapToInterval={CARD_WIDTH}
        decelerationRate="fast"
        snapToAlignment="start"
        getItemLayout={getItemLayoutMedia}
      />

      <Text style={styles.title}>Categorias de Séries</Text>
      <FlatList
        data={show_genres}
        renderItem={renderSeriesCategoryItem} // Renderizador Diferente para Séries
        keyExtractor={(item) => `genre-tv-${item.id}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
        initialNumToRender={6}
      />

      <View style={{ height: 40 }} />
    </ScrollView>
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
    flex: 1,
  },
  title: {
    fontSize: 22,
    marginBottom: 15,
    marginTop: 25,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.accent1,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: COLORS.accent1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  carouselContainer: {
    paddingHorizontal: 20,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  // ESTILO FILME (Círculo Original)
  categoryIconContainerMovie: {
    width: 60,
    height: 60,
    borderRadius: 30, // Totalmente circular
    backgroundColor: COLORS.infoBoxBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  // NOVO ESTILO SÉRIE (Quadrado Arredondado)
  categoryIconContainerSeries: {
    width: 60,
    height: 60,
    borderRadius: 14, // Quadrado com cantos suaves
    backgroundColor: COLORS.infoBoxBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    // Opcional: rotação leve ou sombra diferente
  },
  categoryText: {
    color: COLORS.textPrimary,
    fontSize: 11, // Leve redução para caber nomes maiores
    fontWeight: '500',
    textAlign: 'center',
  },
  // ... Resto dos estilos (hero, etc) permanecem iguais ...
  heroContainer: {
    width: SCREEN_WIDTH,
    height: 400,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)', 
    justifyContent: 'flex-end',
  },
  heroContent: {
    padding: 24,
    paddingBottom: 32,
    backgroundColor: 'transparent', 
  },
  heroBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.accent1,
    marginBottom: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF', 
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroDescription: {
    fontSize: 14,
    color: '#E0E0E0', 
    opacity: 0.9,
    marginBottom: 16,
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 8,
  },
  heroButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF', 
  },
});

export default ListaFilmesScreen;