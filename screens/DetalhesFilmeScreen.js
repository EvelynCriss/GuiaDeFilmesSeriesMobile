// screens/DetalhesFilmeScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ImageBackground,
  Dimensions,
  Animated,
  FlatList, // <--- FlatList normal está importada
  Share,
  Alert,
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../context/FavoritesContext';
import api from '../services/api';
import { TMDB_API_KEY } from '@env';
import { useTheme } from '../context/ThemeContext';

// --- NOVOS IMPORTS DOS COMPONENTES ---
import CollectionCardItem from '../components/CollectionCardItem';
import ReviewModal from '../components/ReviewModal';
import ReviewCardItem from '../components/ReviewCardItem';

// --- Constantes Globais ---
const API_KEY = TMDB_API_KEY;
const POSTER_BASE_URL_W500 = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE_URL_W780 = 'https://image.tmdb.org/t/p/w780';

// --- Constantes do Carrossel de Reviews ---
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.7;
const CARD_MARGIN = 0.5;
const ITEM_SIZE = CARD_WIDTH + CARD_MARGIN * 2;
const SPACER_WIDTH = (SCREEN_WIDTH - ITEM_SIZE) / 2;

// --- Início do Componente ---
const DetalhesFilmeScreen = () => {
  const { colors: COLORS } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { mediaItem: filmeBase } = route.params;

  const [movieDetails, setMovieDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedReviews, setExpandedReviews] = useState({});
  const [reviews, setReviews] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [collectionMovies, setCollectionMovies] = useState([]);
  const [trailerKey, setTrailerKey] = useState(null);
  const [showVideo, setShowVideo] = useState(false);

  const pageAnimation = React.useRef(new Animated.Value(0)).current;
  const scrollX = React.useRef(new Animated.Value(0)).current;

  // --- useEffect ---
  useEffect(() => {
    const fetchDetailsAndReviews = async () => {
      setLoading(true);
      setMovieDetails(null);
      setReviews([]);
      setCollectionMovies([]);
      setError(null);

      if (!API_KEY || !filmeBase?.id) {
        setError('Chave de API ou ID do filme não encontrado.');
        setLoading(false);
        return;
      }

      try {
        const [detailsResponse, englishReviewsResponse] = await Promise.all([
          api.get(`/movie/${filmeBase.id}`, {
            params: {
              api_key: API_KEY,
              language: 'pt-BR',
              append_to_response: 'credits,reviews,videos',
            },
          }),
          api.get(`/movie/${filmeBase.id}/reviews`, {
            params: {
              api_key: API_KEY,
              language: 'en-US',
            },
          }),
        ]);

        if (detailsResponse.data) {
          const details = detailsResponse.data;
          setMovieDetails(details);

          if (details.videos && details.videos.results) {
            const videos = details.videos.results;

            const officialTrailer = videos.find(
              (v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official === true
            );

            if (officialTrailer) {
              setTrailerKey(officialTrailer.key);
            } else {
              const anyTrailer = videos.find(
                (v) => v.site === 'YouTube' && v.type === 'Trailer'
              );
              if (anyTrailer) {
                setTrailerKey(anyTrailer.key);
              } else {
                const anyVideo = videos.find((v) => v.site === 'YouTube');
                if (anyVideo) {
                  setTrailerKey(anyVideo.key);
                }
              }
            }
          }

          if (details.belongs_to_collection) {
            try {
              const collectionResponse = await api.get(`/collection/${details.belongs_to_collection.id}`, {
                params: {
                  api_key: API_KEY,
                  language: 'pt-BR',
                },
              });
              if (collectionResponse.data && collectionResponse.data.parts) {
                const otherMovies = collectionResponse.data.parts.filter(part => part && part.id !== details.id);
                setCollectionMovies(otherMovies);
              }
            } catch (collectionErr) {
              console.error("Erro ao buscar coleção:", collectionErr);
            }
          }
        } else {
          throw new Error(detailsResponse.data.status_message || 'Filme não encontrado');
        }

        const ptReviews = detailsResponse.data.reviews?.results || [];
        const enReviews = englishReviewsResponse.data?.results || [];

        const uniqueReviewsMap = new Map();
        ptReviews.forEach(review => uniqueReviewsMap.set(review.id, review));
        enReviews.forEach(review => {
          if (!uniqueReviewsMap.has(review.id)) {
            uniqueReviewsMap.set(review.id, review);
          }
        });

        const combinedReviews = Array.from(uniqueReviewsMap.values()).filter(Boolean);
        setReviews(combinedReviews);

      } catch (err) {
        setError('Erro ao buscar detalhes do filme.');
        console.error(err);
      } finally {
        setLoading(false);

        Animated.timing(pageAnimation, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }
    };

    fetchDetailsAndReviews();
  }, [filmeBase?.id, pageAnimation]);

  useEffect(() => {
    if (!loading && trailerKey) {
      const timer = setTimeout(() => {
        setShowVideo(true);
      }, 500); 

      return () => clearTimeout(timer);
    }
  }, [loading, trailerKey]);

  // --- Funções ---
  // ... (todas as suas funções como openReviewModal, onShare, etc. permanecem iguais)
  const toggleReviewExpansion = (reviewId) => {
    setExpandedReviews((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  const openReviewModal = (review) => {
    setSelectedReview(review);
    setModalVisible(true);
  };

  const closeReviewModal = () => {
    setModalVisible(false);
    setSelectedReview(null);
  };

  const onShare = async () => {
    if (!movieDetails) return;
    const movieUrl = `https://www.themoviedb.org/movie/${movieDetails.id}`;
    try {
      await Share.share({
        message: `Confira este filme: ${movieDetails.title}\n\n${movieUrl}`,
        title: `Recomendar: ${movieDetails.title}`,
        url: movieUrl,
      });
    } catch (error) {
      Alert.alert(error.message);
    }
  };

  const formatReleaseDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) { return dateString; }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'Released': 'Lançado', 'In Production': 'Em Produção', 'Post Production': 'Em Pós-Produção',
      'Planned': 'Planejado', 'Rumored': 'Rumor', 'Canceled': 'Cancelado',
    };
    return statusMap[status] || status || 'N/A';
  };
  // --- Fim das Funções ---


  // --- Telas de Loading e Erro ---
  const styles = getStyles(COLORS);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.accent1} />
        <Text style={styles.loadingText}>Carregando detalhes do filme...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Tentar Novamente" onPress={() => navigation.goBack()} color={COLORS.accent1} />
      </View>
    );
  }

  if (!movieDetails) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Filme não encontrado.</Text>
        <Button title="Voltar" onPress={() => navigation.goBack()} color={COLORS.accent1} />
      </View>
    );
  }

  // --- Lógica de renderização ---
  const handleToggleFavorite = () => {
    toggleFavorite(movieDetails.id);
  };

  const favoriteIconName = isFavorite(movieDetails?.id) ? 'heart' : 'heart-outline';
  const favoriteIconColor = isFavorite(movieDetails?.id) ? COLORS.accent1 : COLORS.textPrimary;
  const director = movieDetails?.credits?.crew?.find((person) => person.job === 'Director');
  const actors = movieDetails?.credits?.cast?.slice(0, 5)?.map((person) => person.name)?.join(', ') || 'N/A';
  const year = movieDetails?.release_date ? new Date(movieDetails.release_date).getFullYear() : 'N/A';
  const runtime = movieDetails?.runtime ? `${movieDetails.runtime} min` : 'N/A';
  const releaseDateFormatted = formatReleaseDate(movieDetails?.release_date);
  const statusText = getStatusText(movieDetails?.status);

  // --- ANIMAÇÕES GERAIS DA PÁGINA ---
  const animatedPageOpacity = pageAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const animatedPageTranslateY = pageAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0], 
  });

  // Estilo para conteúdo vertical (slide + fade)
  const generalAnimatedStyle = {
    opacity: animatedPageOpacity,
    transform: [{ translateY: animatedPageTranslateY }],
  };

  // --- MUDANÇA: 'carouselAnimatedStyle' REMOVIDO ---

  // --- LÓGICA DE COR MANTIDA ---
  const getRatingColor = (rating) => {
    if (rating >= 7.5) return COLORS.accent1;
    if (rating >= 5) return '#e5446c94';
    return '#e5446c3d';
  };
  
  const ratingColor = movieDetails?.vote_average
    ? getRatingColor(movieDetails.average)
    : COLORS.infoBoxBg;

  // --- JSX ---
  return (
    <>
      <ScrollView style={styles.scrollViewContainer}>
        <ImageBackground
          source={{
            uri: movieDetails?.backdrop_path
              ? `${BACKDROP_BASE_URL_W780}${movieDetails.backdrop_path}`
              : 'https://via.placeholder.com/400x225.png?text=No+Backdrop',
          }}
          style={styles.backdrop}
        >
          <View style={styles.backdropOverlay}></View>
        </ImageBackground>

        <View style={styles.detailsContainer}>
          {/* --- Todos estes usam 'generalAnimatedStyle' (com slide) --- */}
          <Animated.Image
            source={{
              uri: movieDetails?.poster_path
                ? `${POSTER_BASE_URL_W500}${movieDetails.poster_path}`
                : 'https://via.placeholder.com/300x450.png?text=No+Image',
            }}
            style={[styles.poster, generalAnimatedStyle]}
          />

          <Animated.View style={[styles.headerBelowPoster, generalAnimatedStyle]}>
            <TouchableOpacity onPress={onShare} style={styles.actionButton}>
              <Ionicons name="share-social-outline" size={28} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.titleBelowPoster}>{movieDetails?.title || 'Carregando...'}</Text>
            <TouchableOpacity onPress={handleToggleFavorite} style={styles.actionButton}>
              <Ionicons name={favoriteIconName} size={30} color={favoriteIconColor} />
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.metaAndRatingWrapper}>
            <Animated.Text style={[styles.metaInfoText, generalAnimatedStyle]}>
              {year} · {runtime}
            </Animated.Text>
            {movieDetails?.vote_average > 0 && (
              <Animated.View style={[
                styles.ratingContainer,
                generalAnimatedStyle, 
                { backgroundColor: ratingColor } 
              ]}>
                <Ionicons name="flame" size={20} color={COLORS.textPrimary} />
                <Text style={styles.ratingText}>
                  {movieDetails.vote_average.toFixed(1)}
                  <Text style={styles.ratingTextSecondary}> / 10</Text>
                </Text>
              </Animated.View>
            )}
          </View>

          <Animated.View style={[styles.genreContainer, generalAnimatedStyle]}>
            {movieDetails?.genres?.map((genre) => (
              <View key={genre.id} style={styles.genrePill}>
                <Text style={styles.genrePillText}>{genre.name}</Text>
              </View>
            ))}
          </Animated.View>

          {trailerKey && (
            <>
              <Animated.Text style={[styles.sectionTitle, generalAnimatedStyle]}>Trailer</Animated.Text>
              <Animated.View style={[styles.trailerContainer, generalAnimatedStyle]}>
                {showVideo ? (
                  <YoutubePlayer height={220} play={false} videoId={trailerKey} webViewStyle={{ opacity: 0.99 }} />
                ) : (
                  <View style={styles.videoPlaceholder}><ActivityIndicator size="large" color={COLORS.accent1} /></View>
                )}
              </Animated.View>
            </>
          )}

          <Animated.Text style={[styles.sectionTitle, generalAnimatedStyle]}>Enredo</Animated.Text>
          <Animated.View style={[styles.descriptionBox, generalAnimatedStyle]}>
            <Text style={styles.descriptionText}>{movieDetails?.overview || 'Sinopse não disponível.'}</Text>
          </Animated.View>

          <Animated.View style={[styles.infoBlockContainer, generalAnimatedStyle]}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Lançamento</Text>
                <Text style={styles.infoValue}>{releaseDateFormatted}</Text>
              </View>
              <View style={[styles.infoItem, { alignItems: 'flex-end' }]}>
                <Text style={styles.infoLabel}>Status</Text>
                <Text style={styles.infoValue}>{statusText}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Diretor</Text>
                <Text style={styles.infoValue} numberOfLines={1}>{director ? director.name : 'N/A'}</Text>
              </View>
            </View>
            <View style={styles.infoItemFull}>
              <Text style={styles.infoLabel}>Elenco Principal</Text>
              <Text style={styles.infoValue}>{actors || 'N/A'}</Text>
            </View>
          </Animated.View>

          {/* --- CORREÇÃO (PASSO 1): Wrapper da Coleção REMOVIDO --- */}
          {collectionMovies.length > 0 && (
            <>
              <Animated.Text style={[styles.sectionTitle, generalAnimatedStyle]}>
                {movieDetails?.belongs_to_collection?.name ? `Filmes relacionados` : 'Mais da Coleção'}
              </Animated.Text>
              
              {/* O 'Animated.View' foi removido daqui */}
              <FlatList
                data={collectionMovies}
                renderItem={({ item }) => (
                  <CollectionCardItem
                    item={item}
                    onPress={() => navigation.push('DetalhesFilme', { mediaItem: item })}
                  />
                )}
                keyExtractor={(item, index) => (item ? item.id.toString() : index.toString())}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.collectionCarouselContainer}
              />
            </>
          )}

          {/* --- CORREÇÃO (PASSO 2): Wrapper das Reviews REMOVIDO --- */}
          {reviews.length > 0 && (
            <>
              <Animated.Text style={[styles.sectionTitle, generalAnimatedStyle]}>Reviews</Animated.Text>
              
              {/* O 'Animated.View' foi removido daqui */}
              <Animated.FlatList
                data={reviews}
                renderItem={({ item, index }) => (
                  <ReviewCardItem
                    item={item}
                    index={index}
                    scrollX={scrollX}
                    isExpanded={!!expandedReviews[item.id]}
                    onOpenModal={() => openReviewModal(item)}
                    ITEM_SIZE={ITEM_SIZE}
                  />
                )}
                keyExtractor={(item, index) => (item ? item.id : index.toString())}
                horizontal
                showsHorizontalScrollIndicator={false}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                  { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
                snapToInterval={ITEM_SIZE}
                snapToAlignment="start"
                decelerationRate="fast"
                contentContainerStyle={styles.reviewCarouselContainer}
              />
            </>
          )}

        </View>
      </ScrollView>

      <ReviewModal
        visible={modalVisible}
        onClose={closeReviewModal}
        review={selectedReview}
      />
    </>
  );
};

// --- StyleSheet ---
// (Nenhuma mudança necessária no StyleSheet)
const getStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollViewContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.accent1,
    textAlign: 'center',
    marginVertical: 50,
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  backdrop: {
    width: '100%',
    height: 200,
  },
  backdropOverlay: {
    flex: 1,
    backgroundColor: COLORS.backdropOverlay,
  },
  titleBelowPoster: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 5,
    lineHeight: 34,
  },
  headerBelowPoster: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  actionButton: {
    padding: 5,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    paddingTop: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  poster: {
    width: 200,
    height: 300,
    borderRadius: 12,
    marginTop: -50,
    borderWidth: 3,
    borderColor: COLORS.background,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  metaAndRatingWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 5,
    paddingHorizontal: 20,
    flexWrap: 'wrap',
  },
  metaInfoText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    opacity: 0.7,
    marginRight: 15,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.infoBoxBg,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  ratingTextSecondary: {
    fontSize: 14,
    fontWeight: 'normal',
    color: COLORS.textPrimary,
    opacity: 0.7,
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  genrePill: {
    backgroundColor: COLORS.accent2,
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 12,
    margin: 4,
  },
  genrePillText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    alignSelf: 'flex-start',
    marginTop: 25,
    marginBottom: 10,
    width: '100%',
    paddingHorizontal: 20,
  },
  trailerContainer: {
    width: '90%',
    alignSelf: 'center',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 10,
    backgroundColor: COLORS.infoBoxBg,
  },
  videoPlaceholder: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  descriptionBox: {
    backgroundColor: COLORS.infoBoxBg,
    borderRadius: 10,
    padding: 15,
    width: '90%',
    alignSelf: 'center',
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'left',
    color: COLORS.textPrimary,
    opacity: 0.8,
  },
  infoBlockContainer: {
    width: '90%',
    alignSelf: 'center',
    marginTop: 20,
    backgroundColor: COLORS.infoBoxBg,
    borderRadius: 10,
    padding: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  infoItem: {
    flex: 1,
    marginHorizontal: 5,
  },
  infoItemFull: {
    width: '100%',
    marginHorizontal: 5,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    opacity: 0.6,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: COLORS.textPrimary,
    opacity: 0.9,
  },
  collectionCarouselContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingBottom: 20,
  },
  reviewCarouselContainer: {
    paddingHorizontal: SPACER_WIDTH,
    paddingVertical: 10,
    paddingBottom: 20,
  },
});

export default DetalhesFilmeScreen;