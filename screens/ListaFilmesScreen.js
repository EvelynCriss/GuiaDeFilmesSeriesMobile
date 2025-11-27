import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, 
  Dimensions, StatusBar, Animated, Easing
} from 'react-native';
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
const HERO_HEIGHT = 480;

const ListaFilmesScreen = () => { 
  const navigation = useNavigation();
  const { colors: COLORS } = useTheme(); 
  const insets = useSafeAreaInsets();
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current; 
  const slideAnim = useRef(new Animated.Value(50)).current;
  const [popularMovies, setPopularMovies] = useState([]);
  const [popularTV, setPopularTV] = useState([]); 
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMovies = useCallback(async () => {
     if (!API_KEY) { setLoading(false); return; }
     try {
       const [popularResponse, tvResponse] = await Promise.all([
         api.get('/movie/popular', { params: { api_key: API_KEY, language: 'pt-BR' } }),
         api.get('/tv/popular', { params: { api_key: API_KEY, language: 'pt-BR' } })
       ]);
       if (popularResponse.data.results) {
         const movies = popularResponse.data.results.map(m => ({...m, media_type: 'movie'}));
         setPopularMovies(movies);
         if (movies.length > 0) setFeaturedMovie(movies[1]);
       }
       if (tvResponse.data.results) {
         setPopularTV(tvResponse.data.results.map(s => ({...s, media_type: 'tv', title: s.name, release_date: s.first_air_date})));
       }
     } catch (err) { setError(err.message); } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
        Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      ]).start();
    } else {
      fetchMovies();
    }
  }, [loading, fetchMovies]);

  const handleMediaPress = (media) => navigation.navigate('DetalhesFilme', { mediaItem: media });
  const handleCategoryPress = (genre, type) => navigation.navigate('ListaFilmesCategoria', { genreId: genre.id, genreName: genre.name, mediaType: type, iconName: genre.icon });
  const handleOpenCinemaMap = () => navigation.navigate('CinemaMap');

  const imageTranslateY = scrollY.interpolate({ inputRange: [-HERO_HEIGHT, 0, HERO_HEIGHT], outputRange: [-HERO_HEIGHT / 2, 0, HERO_HEIGHT * 0.5], extrapolate: 'clamp' });
  const imageScale = scrollY.interpolate({ inputRange: [-HERO_HEIGHT, 0], outputRange: [2, 1], extrapolateRight: 'clamp' });

  const renderMediaItem = useCallback(({ item }) => (<FilmeCard media={item} onPress={() => handleMediaPress(item)} isCarousel={true} />), [handleMediaPress]);
  const renderMovieCategoryItem = useCallback(({ item }) => (
    <TouchableOpacity style={styles.categoryCard} onPress={() => handleCategoryPress(item, 'movie')} activeOpacity={0.7}>
      <View style={styles.categoryIconContainerMovie}><Ionicons name={item.icon} size={28} color={COLORS.accent1} /></View>
      <Text style={styles.categoryText} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  ), [COLORS, handleCategoryPress]);
  const renderSeriesCategoryItem = useCallback(({ item }) => (
    <TouchableOpacity style={styles.categoryCard} onPress={() => handleCategoryPress(item, 'tv')} activeOpacity={0.7}>
      <View style={styles.categoryIconContainerSeries}><Ionicons name={item.icon} size={26} color={COLORS.accent3} /></View>
      <Text style={styles.categoryText} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  ), [COLORS, handleCategoryPress]);
  const getItemLayoutMedia = useCallback((data, index) => ({ length: CARD_WIDTH, offset: CARD_WIDTH * index, index }), []);

  const styles = getStyles(COLORS); 

  if (loading) return (<View style={[styles.container, styles.center]}><ActivityIndicator size="large" color={COLORS.accent1} /><Text style={styles.loadingText}>Preparando a pipoca...</Text></View>);
  if (error) return (<View style={[styles.container, styles.center]}><Ionicons name="alert-circle-outline" size={64} color={COLORS.accent1} /><Text style={styles.errorText}>{error}</Text><TouchableOpacity style={styles.retryButton} onPress={() => { setError(null); setLoading(true); fetchMovies(); }}><Text style={styles.retryButtonText}>Tentar Novamente</Text></TouchableOpacity></View>);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <Animated.ScrollView 
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}
      >
        {featuredMovie && (
          <TouchableOpacity onPress={() => handleMediaPress(featuredMovie)} activeOpacity={0.95}>
            <View style={styles.heroContainer}>
              <Animated.Image
                source={{ uri: featuredMovie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${featuredMovie.backdrop_path}` : 'https://via.placeholder.com/800x450.png?text=No+Image' }}
                style={[styles.heroImage, { transform: [{ translateY: imageTranslateY }, { scale: imageScale }] }]}
              />
              
              <View style={styles.heroOverlay}>
                <Animated.View style={[styles.heroContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                  <View style={styles.heroBadgeContainer}><Text style={styles.heroBadge}>EM DESTAQUE</Text></View>
                  <Text style={styles.heroTitle} numberOfLines={2}>{featuredMovie.title}</Text>
                  <Text style={styles.heroDescription} numberOfLines={2}>{featuredMovie.overview || 'Descrição não disponível'}</Text>
                  <View style={styles.heroButtonModern}>
                    <Text style={styles.heroButtonTextModern}>Ver Agora</Text>
                    <Ionicons name="play-circle" size={24} color={COLORS.background} />
                  </View>
                </Animated.View>
              </View>
            </View>
          </TouchableOpacity>
        )}

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={styles.cinemaButtonContainer}>
            <TouchableOpacity style={[styles.cinemaButton, { backgroundColor: COLORS.surface }]} onPress={handleOpenCinemaMap} activeOpacity={0.8}>
                <View style={[styles.cinemaIconBadge, {backgroundColor: COLORS.accent2 + '20'}]}>
                    <Ionicons name="map" size={24} color={COLORS.accent2} />
                </View>
                <View style={styles.cinemaTextContainer}>
                    <Text style={[styles.cinemaButtonTitle, {color: COLORS.textPrimary}]}>Cinemas Perto de Você</Text>
                    <Text style={[styles.cinemaButtonSubtitle, {color: COLORS.textPrimary}]}>Encontre sessões e horários próximos</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textPrimary} style={{opacity: 0.5}} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.sectionHeader}><View style={[styles.accentBar, { backgroundColor: COLORS.accent1 }]} /><Text style={styles.title}>Filmes em Alta</Text></View>
          <FlatList data={popularMovies} renderItem={renderMediaItem} keyExtractor={(item) => `movie-${item.id}`} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselContainer} initialNumToRender={4} getItemLayout={getItemLayoutMedia} />

          <View style={styles.sectionHeader}><View style={[styles.accentBar, { backgroundColor: COLORS.accent1 }]} /><Text style={styles.title}>Categorias de Filmes</Text></View>
          <FlatList data={movie_genres} renderItem={renderMovieCategoryItem} keyExtractor={(item) => `genre-movie-${item.id}`} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer} initialNumToRender={6} />

          <View style={styles.sectionHeader}><View style={[styles.accentBar, { backgroundColor: COLORS.accent3 }]} /><Text style={styles.title}>Séries Populares</Text></View>
          <FlatList data={popularTV} renderItem={renderMediaItem} keyExtractor={(item) => `tv-${item.id}`} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselContainer} initialNumToRender={4} getItemLayout={getItemLayoutMedia} />

          <View style={styles.sectionHeader}><View style={[styles.accentBar, { backgroundColor: COLORS.accent3 }]} /><Text style={styles.title}>Categorias de Séries</Text></View>
          <FlatList data={show_genres} renderItem={renderSeriesCategoryItem} keyExtractor={(item) => `genre-tv-${item.id}`} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer} initialNumToRender={6} />

          <View style={{ height: 40 }} />
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
};

const getStyles = (COLORS) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { justifyContent: 'center', alignItems: 'center', flex: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 30, marginBottom: 15, paddingHorizontal: 20 },
  accentBar: { width: 4, height: 24, borderRadius: 2, marginRight: 10 },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: 0.5 },
  errorText: { fontSize: 16, color: COLORS.accent1, textAlign: 'center', paddingHorizontal: 20, marginBottom: 20 },
  retryButton: { backgroundColor: COLORS.accent1, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, marginTop: 10 },
  retryButtonText: { color: COLORS.background, fontSize: 16, fontWeight: 'bold' },
  loadingText: { marginTop: 10, fontSize: 16, color: COLORS.textPrimary },
  carouselContainer: { paddingHorizontal: 20 },
  categoriesContainer: { paddingHorizontal: 20, gap: 12 },
  categoryCard: { alignItems: 'center', marginRight: 16, width: 80 },
  categoryIconContainerMovie: { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.infoBoxBg, justifyContent: 'center', alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: COLORS.borderSubtle },
  categoryIconContainerSeries: { width: 60, height: 60, borderRadius: 14, backgroundColor: COLORS.infoBoxBg, justifyContent: 'center', alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: COLORS.borderSubtle },
  categoryText: { color: COLORS.textPrimary, fontSize: 11, fontWeight: '500', textAlign: 'center' },
  heroContainer: { width: SCREEN_WIDTH, height: HERO_HEIGHT, position: 'relative', overflow: 'hidden', backgroundColor: COLORS.background },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover', position: 'absolute', top: 0, left: 0 },
  
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.heroOverlay, 
    justifyContent: 'flex-end',
  },
  heroContent: {
    padding: 24,
    paddingBottom: 40,
    backgroundColor: COLORS.heroContentBg, 
    borderTopLeftRadius: 30, 
  },
  heroBadgeContainer: { backgroundColor: COLORS.accent1, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 10 },
  heroBadge: { fontSize: 10, fontWeight: 'bold', color: COLORS.background, letterSpacing: 1, textTransform: 'uppercase' },
  heroTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: COLORS.fixedWhite, 
    marginBottom: 8,
    textShadowColor: COLORS.shadowColor,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroDescription: {
    fontSize: 15,
    color: COLORS.heroDescription, 
    opacity: 0.95,
    marginBottom: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
  heroButtonModern: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.accent1, paddingVertical: 14, paddingHorizontal: 28, borderRadius: 30, alignSelf: 'flex-start', gap: 10, elevation: 5, shadowColor: COLORS.shadowColor, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 },
  heroButtonTextModern: { fontSize: 16, fontWeight: 'bold', color: COLORS.background, textTransform: 'uppercase' },
  cinemaButtonContainer: { paddingHorizontal: 20, marginTop: 25 },
  cinemaButton: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, elevation: 2, shadowColor: COLORS.shadowColor, shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 4 },
  cinemaIconBadge: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  cinemaTextContainer: { flex: 1 },
  cinemaButtonTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  cinemaButtonSubtitle: { fontSize: 13, opacity: 0.7 },
});

export default ListaFilmesScreen;