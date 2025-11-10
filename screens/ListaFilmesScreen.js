// screens/ListaFilmesScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FilmeCard from '../components/FilmeCard'; 
import api from '../services/api';
import { TMDB_API_KEY } from '@env';
import { useTheme } from '../context/ThemeContext';

const API_KEY = TMDB_API_KEY;

const ListaFilmesScreen = () => { 
  const navigation = useNavigation();
  const { colors: COLORS } = useTheme();

  const [movies, setMovies] = useState([]);
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
        // <--- MUDANÇA: Endpoint e parâmetros atualizados para TMDb
        const response = await api.get('/movie/popular', {
          params: {
            api_key: API_KEY,          // <--- MUDANÇA: 'apikey' virou 'api_key'
            language: 'pt-BR',
          }
        });
        if (response.data.results) {
          const uniqueMovies = Array.from(
            new Map(response.data.results.map(movie => [movie.id, movie])).values()
          );
          setMovies(uniqueMovies);
        } else {
          setError(response.data.status_message || 'Nenhum filme encontrado');
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
        {/* <--- MUDANÇA: Cor do indicador --- */}
        <ActivityIndicator size="large" color={COLORS.accent1} /> 
        {/* <--- MUDANÇA: Estilo do texto --- */}
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
    <View style={styles.container}>
      <FlatList
        style={{ width: '100%' }}
        data={movies}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <FilmeCard
            media={item}
            onPress={() => handleMediaPress(item)}
          />
        )}
      />
    </View>
  );
};

// <--- MUDANÇA: Estilos atualizados ---
const getStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
    backgroundColor: COLORS.background, // <--- MUDANÇA
  },
  center: {
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary, // <--- MUDANÇA
  },
  errorText: {
    fontSize: 16,
    color: COLORS.accent1, // <--- MUDANÇA
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  // <--- MUDANÇA: Novo estilo para texto de loading ---
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textPrimary,
  }
});

export default ListaFilmesScreen;