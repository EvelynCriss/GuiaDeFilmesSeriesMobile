// screens/DetalhesFilmeScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  Dimensions,
  Animated,
  FlatList,
  Share,
  Alert,
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../context/FavoritesContext';
import { useReviews } from '../context/ReviewsContext';
import api from '../services/api';
import { TMDB_API_KEY } from '@env';
import { useTheme } from '../context/ThemeContext';

import CollectionCardItem from '../components/CollectionCardItem';
import ReviewModal from '../components/ReviewModal';
import AddReviewModal from '../components/AddReviewModal';
import ReviewCardItem from '../components/ReviewCardItem';
import GenrePill from '../components/GenrePill';
import MovieRating from '../components/MovieRating';

const API_KEY = TMDB_API_KEY;
const POSTER_BASE_URL_W500 = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE_URL_W780 = 'https://image.tmdb.org/t/p/w780';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.7;
const CARD_MARGIN = 0.5;
const ITEM_SIZE = CARD_WIDTH + CARD_MARGIN * 2;
const SPACER_WIDTH = (SCREEN_WIDTH - ITEM_SIZE) / 2;

// --- COMPONENTE ANIMADO ---
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const DetalhesFilmeScreen = () => {
  const { colors: COLORS } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { mediaItem: filmeBase } = route.params;
  const insets = useSafeAreaInsets();

  const scrollViewRef = useRef(null);
  const [reviewsSectionY, setReviewsSectionY] = useState(0);

  const isTV = filmeBase?.media_type === 'tv' || !!filmeBase?.name;

  const [movieDetails, setMovieDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedReviews, setExpandedReviews] = useState({});
  const [reviews, setReviews] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [addModalVisible, setAddModalVisible] = useState(false);

  const { addReview, getReviewsForMovie } = useReviews();

  const [bottomListData, setBottomListData] = useState([]);
  const [bottomListTitle, setBottomListTitle] = useState('');

  const [trailerKey, setTrailerKey] = useState(null);
  const [showVideo, setShowVideo] = useState(false);

  const pageAnimation = React.useRef(new Animated.Value(0)).current;
  const scrollX = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchDetailsAndReviews = async () => {
      setLoading(true);
      setMovieDetails(null);
      setReviews([]);
      setBottomListData([]);
      setBottomListTitle('');
      setError(null);
      setTrailerKey(null);
      setShowVideo(false);

      if (!API_KEY || !filmeBase?.id) {
        setError('Chave de API ou ID da mídia não encontrado.');
        setLoading(false);
        return;
      }

      const endpointBase = isTV ? `/tv/${filmeBase.id}` : `/movie/${filmeBase.id}`;

      try {
        const [detailsResponse, englishReviewsResponse] = await Promise.all([
          api.get(endpointBase, {
            params: {
              api_key: API_KEY,
              language: 'pt-BR',
              append_to_response: isTV
                ? 'aggregate_credits,reviews,videos'
                : 'credits,reviews,videos',
            },
          }),
          api.get(`${endpointBase}/reviews`, {
            params: {
              api_key: API_KEY,
              language: 'en-US',
            },
          }),
        ]);

        if (detailsResponse.data) {
          const details = detailsResponse.data;
          setMovieDetails({ ...details, media_type: isTV ? 'tv' : 'movie' });

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
              setTrailerKey(anyTrailer ? anyTrailer.key : videos.find(v => v.site === 'YouTube')?.key);
            }
          }

          if (isTV) {
            if (details.seasons && details.seasons.length > 0) {
              const filteredSeasons = details.seasons.filter(season => {
                const isCurrentSeason = filmeBase.season_number !== undefined && season.season_number === filmeBase.season_number;
                const isSameId = season.id === details.id;
                return !isCurrentSeason && !isSameId;
              });

              if (filteredSeasons.length > 0) {
                setBottomListData(filteredSeasons);
                setBottomListTitle('Outras Temporadas');
              }
            }
          } else {
            if (details.belongs_to_collection) {
              try {
                const collectionResponse = await api.get(`/collection/${details.belongs_to_collection.id}`, {
                  params: { api_key: API_KEY, language: 'pt-BR' },
                });
                if (collectionResponse.data && collectionResponse.data.parts) {
                  const otherMovies = collectionResponse.data.parts.filter(
                    part => part && part.id !== details.id
                  );
                  const formattedParts = otherMovies.map(m => ({ ...m, media_type: 'movie' }));

                  if (formattedParts.length > 0) {
                    setBottomListData(formattedParts);
                    setBottomListTitle('Da mesma coleção');
                  }
                }
              } catch (collectionErr) {
                console.log("Erro ao buscar coleção:", collectionErr);
              }
            }
          }
        } else {
          throw new Error(detailsResponse.data.status_message || 'Mídia não encontrada');
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
        
        try {
          const localReviews = getReviewsForMovie(filmeBase.id) || [];
          setReviews([...localReviews, ...combinedReviews]);
        } catch (e) {
          setReviews(combinedReviews);
        }

      } catch (err) {
        setError('Erro ao buscar detalhes.');
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
  }, [filmeBase?.id, pageAnimation, isTV]);

  useEffect(() => {
    if (!loading && trailerKey) {
      const timer = setTimeout(() => {
        setShowVideo(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, trailerKey]);

  const openReviewModal = (review) => {
    setSelectedReview(review);
    setModalVisible(true);
  };

  const closeReviewModal = () => {
    setModalVisible(false);
    setSelectedReview(null);
  };

  const openAddReviewModal = () => setAddModalVisible(true);
  const closeAddReviewModal = () => setAddModalVisible(false);

  const handleSaveLocalReview = (review) => {
    const movieId = movieDetails?.id || filmeBase?.id;
    if (!movieId) return;
    addReview(movieId, review);
    setReviews(prev => [review, ...prev]);
  };

  const scrollToReviews = () => {
    if (scrollViewRef.current && reviewsSectionY > 0) {
      scrollViewRef.current.scrollTo({ y: reviewsSectionY, animated: true });
    }
  };

  const onShare = async () => {
    if (!movieDetails) return;
    const typePath = isTV ? 'tv' : 'movie';
    const movieUrl = `https://www.themoviedb.org/${typePath}/${movieDetails.id}`;
    const titleToShare = movieDetails.title || movieDetails.name;
    try {
      await Share.share({
        message: `Confira: ${titleToShare}\n\n${movieUrl}`,
        title: `Recomendar: ${titleToShare}`,
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
      'Returning Series': 'Renovada', 'Ended': 'Finalizada', 'Pilot': 'Piloto'
    };
    return statusMap[status] || status || 'N/A';
  };

  const styles = getStyles(COLORS);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.accent1} />
        <Text style={styles.loadingText}>Carregando detalhes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Voltar" onPress={() => navigation.goBack()} color={COLORS.accent1} />
      </View>
    );
  }

  if (!movieDetails) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Conteúdo não encontrado.</Text>
        <Button title="Voltar" onPress={() => navigation.goBack()} color={COLORS.accent1} />
      </View>
    );
  }

  const handleToggleFavorite = () => {
    toggleFavorite(movieDetails.id);
  };

  const favoriteIconName = isFavorite(movieDetails?.id) ? 'heart' : 'heart-outline';
  const favoriteIconColor = isFavorite(movieDetails?.id) ? COLORS.accent1 : COLORS.textPrimary;

  const title = movieDetails.title || movieDetails.name;
  const dateToFormat = movieDetails.release_date || movieDetails.first_air_date;
  const releaseDateFormatted = formatReleaseDate(dateToFormat);
  const year = dateToFormat ? new Date(dateToFormat).getFullYear() : 'N/A';

  let duration = 'N/A';
  if (isTV) {
    if (movieDetails.episode_run_time && movieDetails.episode_run_time.length > 0) {
      duration = `${movieDetails.episode_run_time[0]} min/ep`;
    } else if (movieDetails.number_of_seasons) {
      duration = `${movieDetails.number_of_seasons} Temp.`;
    }
  } else {
    duration = movieDetails.runtime ? `${movieDetails.runtime} min` : 'N/A';
  }

  let directorLabel = isTV ? 'Criador(es)' : 'Diretor';
  let directorOrCreator = 'N/A';
  if (isTV && movieDetails.created_by && movieDetails.created_by.length > 0) {
    directorOrCreator = movieDetails.created_by.map(c => c.name).join(', ');
  } else if (!isTV) {
    const director = movieDetails.credits?.crew?.find((person) => person.job === 'Director');
    if (director) directorOrCreator = director.name;
  }

  const castSource = isTV ? movieDetails.aggregate_credits : movieDetails.credits;
  const actors = castSource?.cast?.slice(0, 5)?.map((person) => person.name)?.join(', ') || 'N/A';
  const statusText = getStatusText(movieDetails.status);

  const animatedPageOpacity = pageAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const animatedPageTranslateY = pageAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  const generalAnimatedStyle = {
    opacity: animatedPageOpacity,
    transform: [{ translateY: animatedPageTranslateY }],
  };

  return (
    <>
     <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollViewContainer}
        contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}
      >
        <ImageBackground
          source={{
            uri: movieDetails?.backdrop_path
              ? `${BACKDROP_BASE_URL_W780}${movieDetails.backdrop_path}`
              : 'https://via.placeholder.com/800x450.png?text=Sem+Imagem',
          }}
          style={styles.backdrop}
        >
          <View style={styles.backdropOverlay}></View>
        </ImageBackground>

        <View style={styles.detailsContainer}>
          <Animated.Image
            source={{
              uri: movieDetails?.poster_path
                ? `${POSTER_BASE_URL_W500}${movieDetails.poster_path}`
                : 'https://via.placeholder.com/300x450.png?text=Sem+Poster',
            }}
            style={[styles.poster, generalAnimatedStyle]}
          />

          <Animated.View style={[styles.headerBelowPoster, generalAnimatedStyle]}>
            <TouchableOpacity onPress={onShare} style={styles.actionButton}>
              <Ionicons name="share-social-outline" size={28} color={COLORS.textPrimary} />
            </TouchableOpacity>

            <Text style={styles.titleBelowPoster}>{title}</Text>

            <TouchableOpacity onPress={handleToggleFavorite} style={styles.actionButton}>
              <Ionicons name={favoriteIconName} size={30} color={favoriteIconColor} />
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.metaAndRatingWrapper}>
            <Animated.Text style={[styles.metaInfoText, generalAnimatedStyle]}>
              {year} · {duration}
            </Animated.Text>

            <MovieRating
              rating={movieDetails?.vote_average}
              style={generalAnimatedStyle}
            />

            <AnimatedTouchableOpacity 
              onPress={scrollToReviews} 
              style={[styles.jumpToReviewsBtn, generalAnimatedStyle]}
              activeOpacity={0.6}
            >
              <Ionicons name="chatbox-ellipses-outline" size={20} color={COLORS.textPrimary} />
            </AnimatedTouchableOpacity>
          </View>

          <Animated.View style={[styles.genreContainer, generalAnimatedStyle]}>
            {movieDetails?.genres?.map((genre) => (
              <GenrePill
                key={genre.id}
                name={genre.name}
                id={genre.id}
                type={isTV ? 'tv' : 'movie'}
              />
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

          <Animated.Text style={[styles.sectionTitle, generalAnimatedStyle]}>Sinopse</Animated.Text>
          <Animated.View style={[styles.descriptionBox, generalAnimatedStyle]}>
            <Text style={styles.descriptionText}>
              {movieDetails?.overview || 'Descrição não disponível para este título.'}
            </Text>
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
                <Text style={styles.infoLabel}>{directorLabel}</Text>
                <Text style={styles.infoValue} numberOfLines={2}>{directorOrCreator}</Text>
              </View>
            </View>
            <View style={styles.infoItemFull}>
              <Text style={styles.infoLabel}>Elenco Principal</Text>
              <Text style={styles.infoValue}>{actors}</Text>
            </View>
          </Animated.View>

          {bottomListData.length > 0 && (
            <>
              <Animated.Text style={[styles.sectionTitle, generalAnimatedStyle]}>
                {bottomListTitle}
              </Animated.Text>

              <FlatList
                data={bottomListData}
                renderItem={({ item }) => (
                  <CollectionCardItem
                    item={item}
                    onPress={() => {
                      if (isTV) {
                        navigation.navigate('DetalhesTemporada', {
                          seriesId: movieDetails.id,
                          seasonNumber: item.season_number,
                          seasonTitle: item.name,
                        });
                      } else {
                        navigation.push('DetalhesFilme', { mediaItem: item });
                      }
                    }}
                  />
                )}
                keyExtractor={(item, index) => (item && item.id ? item.id.toString() : index.toString())}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.collectionCarouselContainer}
              />
            </>
          )}

          {/* --- SEÇÃO DE AVALIAÇÕES --- */}
          <View 
            style={{ width: '100%' }}
            onLayout={(event) => {
              const layout = event.nativeEvent.layout;
              setReviewsSectionY(layout.y);
            }}
          >
             <Animated.Text style={[styles.sectionTitle, generalAnimatedStyle]}>Avaliações</Animated.Text>
             
             <Animated.View style={[styles.actionButtonContainer, generalAnimatedStyle]}>
                <TouchableOpacity
                  onPress={openAddReviewModal}
                  style={styles.addReviewButtonWide}
                  activeOpacity={0.8}
                >
                  <Ionicons name="create-outline" size={22} color={COLORS.textPrimary} style={{ marginRight: 10 }} />
                  <Text style={styles.addReviewButtonText}>Avaliar este título</Text>
                </TouchableOpacity>
              </Animated.View>

              {reviews.length > 0 ? (
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
              ) : (
                <Text style={styles.noReviewsText}>Nenhuma avaliação ainda. Seja o primeiro!</Text>
              )}
          </View>
        </View>
      </ScrollView>

      <ReviewModal
        visible={modalVisible}
        onClose={closeReviewModal}
        review={selectedReview}
      />

      <AddReviewModal
        visible={addModalVisible}
        onClose={closeAddReviewModal}
        onSave={handleSaveLocalReview}
      />
    </>
  );
};

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
  jumpToReviewsBtn: {
    marginLeft: 10,
    padding: 6,
    borderRadius: 20,
    backgroundColor: COLORS.infoBoxBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButtonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  addReviewButtonWide: {
    backgroundColor: COLORS.accent2, // --- ALTERADO PARA ACCENT2 ---
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30, 
    width: '65%', 
    shadowColor: COLORS.accent2,    // --- ALTERADO PARA ACCENT2 ---
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6, 
  },
  addReviewButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
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
  noReviewsText: {
    color: COLORS.textPrimary,
    opacity: 0.6,
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  }
});

export default DetalhesFilmeScreen;