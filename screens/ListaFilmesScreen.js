import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import FilmeCard from '../components/FilmeCard'; 
import api from '../services/api';
import { TMDB_API_KEY } from '@env';
import { useTheme } from '../context/ThemeContext';

const API_KEY = TMDB_API_KEY;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const genres = [
  { id: 28, name: "Ação", icon: "flame-outline" },
  { id: 12, name: "Aventura", icon: "compass-outline" },
  { id: 35, name: "Comédia", icon: "happy-outline" },
  { id: 27, name: "Terror", icon: "skull-outline" },
  { id: 878, name: "Ficção", icon: "planet-outline" },
  { id: 10749, name: "Romance", icon: "heart-outline" },
  { id: 16, name: "Animação", icon: "color-palette-outline" },
  { id: 18, name: "Drama", icon: "film-outline" },
];

const ListaFilmesScreen = () => { 
  const navigation = useNavigation();
  const { colors: COLORS } = useTheme();

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
      // 1. Busca Filmes
      const popularResponse = await api.get('/movie/popular', {
        params: { api_key: API_KEY, language: 'pt-BR' }
      });

      // 2. Busca Séries
      const tvResponse = await api.get('/tv/popular', {
        params: { api_key: API_KEY, language: 'pt-BR' }
      });

      if (popularResponse.data.results) {
        const movies = popularResponse.data.results.map(m => ({...m, media_type: 'movie'}));
        setPopularMovies(movies);
        
        if (movies.length > 0) {
          setFeaturedMovie(movies[0]);
        }
      }

      if (tvResponse.data.results) {
        // --- CORREÇÃO DE DATA E TÍTULO ---
        // A API de TV retorna 'name' e 'first_air_date'.
        // Mapeamos para 'title' e 'release_date' para o FilmeCard entender e não mostrar N/A.
        const shows = tvResponse.data.results.map(s => ({
            ...s, 
            media_type: 'tv',
            title: s.name, // Usa o nome como título
            release_date: s.first_air_date // Usa a data de estreia como data de lançamento
        }));
        setPopularTV(shows);
      }

    } catch (err) {
      let errorMessage = 'Erro ao buscar filmes.';
      if (err.response) {
        errorMessage = `Erro ${err.response.status}`;
      } else {
        errorMessage = `Erro: ${err.message}`;
      }
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

  const handleCategoryPress = (genre) => {
    navigation.navigate('ListaFilmesCategoriaScreen', { 
      genreId: genre.id, 
      genreName: genre.name 
    });
  };

  const styles = getStyles(COLORS);

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
          onPress={() => {
            setError(null);
            setLoading(true);
            fetchMovies();
          }}
        >
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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

      <Text style={styles.title}>Categorias</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {genres.map((genre) => (
          <TouchableOpacity
            key={genre.id}
            style={styles.categoryCard}
            onPress={() => handleCategoryPress(genre)}
            activeOpacity={0.7}
          >
            <View style={styles.categoryIconContainer}>
              <Ionicons name={genre.icon} size={28} color={COLORS.accent1} />
            </View>
            <Text style={styles.categoryText}>{genre.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.title}>Filmes em Alta</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContainer}
        snapToInterval={165} 
        decelerationRate="fast"
        snapToAlignment="start"
      >
        {popularMovies.map((item) => (
          <FilmeCard
            key={`movie-${item.id}`}
            media={item}
            onPress={() => handleMediaPress(item)}
            isCarousel={true}
          />
        ))}
      </ScrollView>

      <Text style={styles.title}>Séries Populares</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContainer}
        snapToInterval={165} 
        decelerationRate="fast"
        snapToAlignment="start"
      >
        {popularTV.map((item) => (
          <FilmeCard
            key={`tv-${item.id}`}
            media={item}
            onPress={() => handleMediaPress(item)}
            isCarousel={true}
          />
        ))}
      </ScrollView>

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
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.infoBoxBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  categoryText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
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