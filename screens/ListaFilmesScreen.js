// screens/ListaFilmesScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FilmeCard from '../components/FilmeCard'; // <--- MUDANÇA: Importa o novo Card
import api from '../services/api';
import { TMDB_API_KEY } from '@env';

const API_KEY = TMDB_API_KEY;

// <--- MUDANÇA: Nome do componente
const ListaFilmesScreen = () => { 
  const navigation = useNavigation();

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
        const response = await api.get('/trending/movie/day', {
          params: {
            api_key: API_KEY,
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

  // <--- MUDANÇA: Nome da função e parâmetros de navegação
  const handleMediaPress = (media) => {
    navigation.navigate('DetalhesFilme', { mediaItem: media }); // <--- Rota 'DetalhesFilme', parâmetro 'mediaItem'
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Carregando filmes...</Text>
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
      <Text style={styles.title}>Filmes em Alta</Text>
      <FlatList
        style={{ width: '100%' }}
        data={movies}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          // <--- MUDANÇA: Usa o FilmeCard e passa a prop 'media'
          <FilmeCard
            media={item}
            onPress={() => handleMediaPress(item)}
          />
        )}
      />
    </View>
  );
};

// ... (estilos permanecem os mesmos)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
    backgroundColor: '#f0f0f0',
  },
  center: {
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  }
});

// <--- MUDANÇA: Exporta o novo nome do componente
export default ListaFilmesScreen;