// screens/ListaPontosTuristicos.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PontoTuristicoCard from '../components/PontoTuristicoCard';
import api from '../services/api';
import { TMDB_API_KEY } from '@env'; // <--- MUDANÇA: Importado do @env

// <--- MUDANÇA: Chave vindo do .env
const API_KEY = TMDB_API_KEY;

const ListaPontosTuristicos = () => {
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
        // <--- MUDANÇA: Endpoint e parâmetros atualizados para TMDb
        const response = await api.get('/search/movie', {
          params: {
            query: 'Fast and furious', // <--- MUDANÇA: 's' virou 'query'
            api_key: API_KEY,          // <--- MUDANÇA: 'apikey' virou 'api_key'
            language: 'pt-BR',
          }
        });

        // <--- MUDANÇA: 'Search' virou 'results'
        if (response.data.results) {

          // <--- MUDANÇA AQUI: Filtra os duplicados ---
          // Usamos um Map para garantir que cada 'id' (antes 'imdbID') apareça apenas uma vez.
          const uniqueMovies = Array.from(
            new Map(response.data.results.map(movie => [movie.id, movie])).values() // <--- MUDANÇA: 'imdbID' virou 'id'
          );
          // --- Fim da mudança ---

          setMovies(uniqueMovies);

        } else {
          // <--- MUDANÇA: 'Error' virou 'status_message' (padrão do TMDb)
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

  const handleFilmePress = (filme) => {
    // <--- MUDANÇA: 'pontoDetalhes' agora passa o objeto 'filme' da TMDb
    // A tela de detalhes vai usar 'filme.id' em vez de 'filme.imdbID'
    navigation.navigate('DetalhesPonto', { pontoDetalhes: filme });
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
      <Text style={styles.title}>Filmes</Text>
      <FlatList
        style={{ width: '100%' }}
        data={movies}
        keyExtractor={(item) => item.id.toString()} // <--- MUDANÇA: 'imdbID' virou 'id' (e convertemos para string)
        renderItem={({ item }) => (
          <PontoTuristicoCard
            ponto={item}
            onPress={() => handleFilmePress(item)}
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

export default ListaPontosTuristicos;