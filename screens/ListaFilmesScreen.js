// screens/ListaPontosTuristicos.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import FilmeCard from '../components/FilmeCard'; 
import RenderStars from '../components/RenderStars';
import api from '../services/api';
import { TMDB_API_KEY } from '@env';
import { useTheme } from '../context/ThemeContext';

const API_KEY = TMDB_API_KEY;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ListaFilmesScreen = () => { 
  const navigation = useNavigation();
  const { colors: COLORS } = useTheme();

  const [popularMovies, setPopularMovies] = useState([]);
  const [actionMovies, setActionMovies] = useState([]);
  const [horrorMovies, setHorrorMovies] = useState([]);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMovies = useCallback(async () => {
    if (!API_KEY) {
      setError("Chave de API (TMDB_API_KEY) não encontrada no .env");
      setLoading(false);
      return;
    }

    try {
      // busca filmes popularoes
      const popularResponse = await api.get('/movie/popular', {
        params: {
          api_key: API_KEY,
          language: 'pt-BR',
        }
      });

      // busca filmes de ação
      const actionResponse = await api.get('/discover/movie', {
        params: {
          api_key: API_KEY,
          language: 'pt-BR',
          with_genres: 28, 
          sort_by: 'popularity.desc'
        }
      });

      // busca filmes dee terror
      const horrorResponse = await api.get('/discover/movie', {
        params: {
          api_key: API_KEY,
          language: 'pt-BR',
          with_genres: 27, 
          sort_by: 'popularity.desc'
        }
      });

      // remove duplicados
      if (popularResponse.data.results) {
        const uniquePopular = Array.from(
          new Map(popularResponse.data.results.map(movie => [movie.id, movie])).values()
        );
        setPopularMovies(uniquePopular);
        // define o primeiro filme popular como destaque
        if (uniquePopular.length > 0) {
          setFeaturedMovie(uniquePopular[0]);
        }
      }

      if (actionResponse.data.results) {
        const uniqueAction = Array.from(
          new Map(actionResponse.data.results.map(movie => [movie.id, movie])).values()
        );
        setActionMovies(uniqueAction);
      }

      if (horrorResponse.data.results) {
        const uniqueHorror = Array.from(
          new Map(horrorResponse.data.results.map(movie => [movie.id, movie])).values()
        );
        setHorrorMovies(uniqueHorror);
      }

      // busca avaliações do filme que está como popular
      if (popularResponse.data.results && popularResponse.data.results.length > 0) {
        const topMovies = popularResponse.data.results.slice(0, 5); 
        const reviewPromises = topMovies.map(movie => 
          api.get(`/movie/${movie.id}/reviews`, {
            params: {
              api_key: API_KEY,
              language: 'pt-BR',
            }
          }).catch(() => null) 
        );

        const reviewResponses = await Promise.all(reviewPromises);
        const allReviews = [];
        
        reviewResponses.forEach((response, index) => {
          if (response && response.data && response.data.results && response.data.results.length > 0) {
            
            const review = response.data.results[0];
            review.movieTitle = topMovies[index].title;
            review.movieId = topMovies[index].id;
            allReviews.push(review);
          }
        });

        setReviews(allReviews.slice(0, 10)); 
      }

    } catch (err) {
      let errorMessage = 'Erro ao buscar filmes. Verifique sua conexão ou API Key.';
      
      if (err.response) {
        // erro de resposta da api
        console.error('Erro de resposta:', err.response.status, err.response.data);
        if (err.response.status === 401) {
          errorMessage = 'API Key inválida. Verifique sua chave de API.';
        } else if (err.response.status === 404) {
          errorMessage = 'Endpoint não encontrado. Verifique a URL da API.';
        } else {
          errorMessage = `Erro ${err.response.status}: ${err.response.data?.status_message || 'Erro desconhecido'}`;
        }
      } else if (err.request) {
        // erro de requisição
        console.error('Erro de requisição:', err.request);
        errorMessage = 'Erro de conexão. Verifique sua internet.';
      } else {
        // outro erro
        console.error('Erro:', err.message);
        errorMessage = `Erro: ${err.message}`;
      }
      
      setError(errorMessage);
      console.error('Erro completo:', err);
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

  const styles = getStyles(COLORS);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.accent1} /> 
        <Text style={styles.loadingText}>Carregando filmes...</Text> 
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
      {/* filme em destaque */}
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
                <View style={styles.heroInfo}>
                  <View style={styles.heroInfoItem}>
                    <Ionicons name="calendar-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.heroInfoText}>
                      {featuredMovie.release_date ? featuredMovie.release_date.split('-')[0] : 'N/A'}
                    </Text>
                  </View>
                  {featuredMovie.vote_average && (
                    <View style={styles.heroInfoItem}>
                      <Ionicons name="star" size={16} color={COLORS.accent1} />
                      <Text style={styles.heroInfoText}>
                        {featuredMovie.vote_average.toFixed(1)}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.heroButton}>
                  <Text style={styles.heroButtonText}>Ver Detalhes</Text>
                  <Ionicons name="arrow-forward" size={20} color={COLORS.background} />
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* filmes em alta */}
      <Text style={styles.title}>Filmes em Alta</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContainer}
        snapToInterval={215}
        decelerationRate="fast"
        snapToAlignment="start"
      >
        {popularMovies.map((item) => (
          <FilmeCard
            key={`popular-${item.id.toString()}`}
            media={item}
            onPress={() => handleMediaPress(item)}
            isCarousel={true}
          />
        ))}
      </ScrollView>

      {/* filmes de açãoo */}
      <Text style={styles.title}>Filmes de Ação</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContainer}
        snapToInterval={215}
        decelerationRate="fast"
        snapToAlignment="start"
      >
        {actionMovies.map((item) => (
          <FilmeCard
            key={`action-${item.id.toString()}`}
            media={item}
            onPress={() => handleMediaPress(item)}
            isCarousel={true}
          />
        ))}
      </ScrollView>

      {/* filmes de terror */}
      <Text style={styles.title}>Filmes de Terror</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContainer}
        snapToInterval={215}
        decelerationRate="fast"
        snapToAlignment="start"
      >
        {horrorMovies.map((item) => (
          <FilmeCard
            key={`horror-${item.id.toString()}`}
            media={item}
            onPress={() => handleMediaPress(item)}
            isCarousel={true}
          />
        ))}
      </ScrollView>

      {/* seção de avaliações */}
      {reviews.length > 0 && (
        <>
          <Text style={styles.title}>Avaliações Recentes</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.reviewsContainer}
          >
            {reviews.map((review) => (
              <TouchableOpacity
                key={review.id}
                style={styles.reviewCard}
                onPress={() => {
                  
                  const movie = popularMovies.find(m => m.id === review.movieId);
                  if (movie) {
                    handleMediaPress(movie);
                  }
                }}
                activeOpacity={0.8}
              >
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewAuthorContainer}>
                    <Ionicons name="person-circle-outline" size={20} color={COLORS.accent1} />
                    <Text style={styles.reviewAuthor} numberOfLines={1}>
                      {review.author_details?.name || review.author || 'Anônimo'}
                    </Text>
                  </View>
                  {review.author_details?.rating && (
                    <View style={styles.reviewRating}>
                      <RenderStars rating={review.author_details.rating} />
                    </View>
                  )}
                </View>
                <Text style={styles.reviewMovieTitle} numberOfLines={1}>
                  {review.movieTitle}
                </Text>
                <Text style={styles.reviewContent} numberOfLines={4}>
                  {review.content}
                </Text>
                <View style={styles.reviewFooter}>
                  <Ionicons name="arrow-forward-circle" size={16} color={COLORS.accent1} />
                  <Text style={styles.reviewFooterText}>Ver filme</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}
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
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    marginTop: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    width: '100%',
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
    paddingVertical: 20,
  },
 
  heroContainer: {
    width: SCREEN_WIDTH,
    height: 400,
    position: 'relative',
    marginBottom: 10,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  heroContent: {
    padding: 24,
    paddingBottom: 32,
  },
  heroBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.accent1,
    marginBottom: 8,
    letterSpacing: 1,
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
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 16,
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  heroInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 20,
  },
  heroInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroInfoText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
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
    color: COLORS.background,
  },

  reviewsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  reviewCard: {
    width: 280,
    backgroundColor: COLORS.infoBoxBg,
    borderRadius: 12,
    padding: 16,
    marginRight: 15,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewHeader: {
    marginBottom: 10,
  },
  reviewAuthorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    flex: 1,
  },
  reviewRating: {
    marginTop: 4,
  },
  reviewMovieTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.accent1,
    marginBottom: 10,
    opacity: 0.8,
  },
  reviewContent: {
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 18,
    opacity: 0.8,
    marginBottom: 12,
    flex: 1,
  },
  reviewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 'auto',
  },
  reviewFooterText: {
    fontSize: 12,
    color: COLORS.accent1,
    fontWeight: '600',
  },
});

export default ListaFilmesScreen;