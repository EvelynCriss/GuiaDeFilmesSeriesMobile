// screens/ListaPontosTuristicos.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PontoTuristicoCard from '../components/PontoTuristicoCard';
import api from '../services/api';
import { OMDB_API_KEY } from '@env'; // <--- MUDANÇA: Importado do @env

// <--- MUDANÇA: Chave vindo do .env
const API_KEY = OMDB_API_KEY; 

const ListaPontosTuristicos = () => {
  const navigation = useNavigation();
  
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      if (!API_KEY) {
        setError("Chave de API (OMDB_API_KEY) não encontrada no .env");
        setLoading(false);
        return;
      }
      
      try {
        const response = await api.get('/', {
          params: {
            s: 'Batman', 
            apikey: API_KEY,
          }
        });

        if (response.data.Search) {
          
          // <--- MUDANÇA AQUI: Filtra os duplicados ---
          // A API da OMDb (busca 's=') às vezes retorna duplicados.
          // Usamos um Map para garantir que cada imdbID apareça apenas uma vez.
          const uniqueMovies = Array.from(
            new Map(response.data.Search.map(movie => [movie.imdbID, movie])).values()
          );
          // --- Fim da mudança ---

          setMovies(uniqueMovies); // <--- Passamos a lista limpa para o estado

        } else {
          setError(response.data.Error || 'Nenhum filme encontrado');
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
      <Text style={styles.title}>Filmes (Ex: "Batman")</Text>
      <FlatList
        style={{ width: '100%' }}
        data={movies}
        keyExtractor={(item) => item.imdbID}
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