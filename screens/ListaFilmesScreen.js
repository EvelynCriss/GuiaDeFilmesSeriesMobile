// screens/ListaFilmesScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FilmeCard from '../components/FilmeCard'; 
import api from '../services/api';
import { TMDB_API_KEY } from '@env';
import { useTheme } from '../context/ThemeContext';

const API_KEY = TMDB_API_KEY;

const ListaFilmesScreen = () => { 
  const navigation = useNavigation();
  const { colors: COLORS } = useTheme();

  const [popularMovies, setPopularMovies] = useState([]);
  const [actionMovies, setActionMovies] = useState([]);
  const [horrorMovies, setHorrorMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      if (!API_KEY) {
        setError("Chave de API (TMDB_API_KEY) não encontrada no .env");
        setLoading(false);
        return;
      }
      try {
        // Busca filmes populares
        const popularResponse = await api.get('/movie/popular', {
          params: {
            api_key: API_KEY,
            language: 'pt-BR',
          }
        });

        // Busca filmes de ação (genre_id: 28)
        const actionResponse = await api.get('/discover/movie', {
          params: {
            api_key: API_KEY,
            language: 'pt-BR',
            with_genres: 28, // Ação
            sort_by: 'popularity.desc'
          }
        });

        // Busca filmes de terror (genre_id: 27)
        const horrorResponse = await api.get('/discover/movie', {
          params: {
            api_key: API_KEY,
            language: 'pt-BR',
            with_genres: 27, // Terror
            sort_by: 'popularity.desc'
          }
        });

        // Remove duplicados e atualiza os estados
        if (popularResponse.data.results) {
          const uniquePopular = Array.from(
            new Map(popularResponse.data.results.map(movie => [movie.id, movie])).values()
          );
          setPopularMovies(uniquePopular);
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

      } catch (err) {
        setError('Erro ao buscar filmes. Verifique sua conexão ou API Key.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

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
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Seção Filmes em Alta */}
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

      {/* Seção Filmes de Ação */}
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

      {/* Seção Filmes de Terror */}
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
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  carouselContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  }
});

export default ListaFilmesScreen;