import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../context/FavoritesContext';
import api from '../services/api';
import { OMDB_API_KEY } from '@env'; // <--- MUDANÇA: Importado do @env

// <--- MUDANÇA: Chave vindo do .env
const API_KEY = OMDB_API_KEY; 

const DetalhesPontoTuristico = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { isFavorite, toggleFavorite } = useFavorites();
 
  const { pontoDetalhes: filmeBase } = route.params;

  const [movieDetails, setMovieDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      // <--- MUDANÇA: Verificação se a chave foi carregada
      if (!API_KEY) {
        setError("Chave de API (OMDB_API_KEY) não encontrada no .env");
        setLoading(false);
        return;
      }
      
      if (!filmeBase?.imdbID) {
        setError("ID do filme não encontrado.");
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/', {
          params: {
            i: filmeBase.imdbID,
            apikey: API_KEY,
            plot: 'full',
          }
        });

        if (response.data.Response === "True") {
          setMovieDetails(response.data);
        } else {
          setError(response.data.Error);
        }
      } catch (err) {
        setError("Erro ao buscar detalhes do filme.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [filmeBase?.imdbID]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error || !movieDetails) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error || 'Detalhes do filme não encontrados.'}</Text>
        <Button title="Voltar" onPress={() => navigation.goBack()} />
      </View>
    );
  }
 
  const handleToggleFavorite = () => {
    toggleFavorite(movieDetails.imdbID);
  };
  const favoriteIconName = isFavorite(movieDetails.imdbID) ? 'heart' : 'heart-outline';
  const favoriteIconColor = isFavorite(movieDetails.imdbID) ? 'red' : 'gray';
 
  return (
    <ScrollView style={styles.scrollViewContainer}>
      <View style={styles.contentContainer}>
        <Image 
          source={{ uri: movieDetails.Poster !== 'N/A' ? movieDetails.Poster : 'https://via.placeholder.com/300x450.png?text=No+Image' }}
          style={styles.poster}
        />
        <View style={styles.header}>
          <Text style={styles.title}>{movieDetails.Title}</Text>
          <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteButton}>
            <Ionicons name={favoriteIconName} size={30} color={favoriteIconColor} />
          </TouchableOpacity>
        </View>
        <Text style={styles.metaInfo}>{movieDetails.Year} · {movieDetails.Rated} · {movieDetails.Runtime}</Text>
        <Text style={styles.genreText}>{movieDetails.Genre}</Text>
        
        <Text style={styles.sectionTitle}>Enredo</Text>
        <Text style={styles.descriptionText}>{movieDetails.Plot}</Text>

        <Text style={styles.sectionTitle}>Diretor</Text>
        <Text style={styles.detailText}>{movieDetails.Director}</Text>

        <Text style={styles.sectionTitle}>Atores</Text>
        <Text style={styles.detailText}>{movieDetails.Actors}</Text>

        <Text style={styles.sectionTitle}>Avaliações</Text>
        {movieDetails.Ratings && movieDetails.Ratings.map((rating, index) => (
          <Text key={index} style={styles.detailText}>- {rating.Source}: {rating.Value}</Text>
        ))}
        
        <View style={{ marginTop: 20 }}>
          <Button title="Voltar para a Lista" onPress={() => navigation.goBack()} />
        </View>
      </View>
    </ScrollView>
  );
};
 
// ... (estilos permanecem os mesmos)
const styles = StyleSheet.create({
  scrollViewContainer: { flex: 1, backgroundColor: '#fff' },
  contentContainer: { padding: 20, alignItems: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  title: { fontSize: 26, fontWeight: 'bold', flexShrink: 1, marginRight: 10 },
  favoriteButton: { padding: 5 },
  poster: {
    width: 200,
    height: 300,
    borderRadius: 8,
    marginBottom: 20,
  },
  metaInfo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
    textAlign: 'center',
  },
  genreText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#888',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginTop: 15,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: '100%',
  },
  descriptionText: { fontSize: 16, lineHeight: 24, textAlign: 'justify', color: '#444' },
  detailText: { fontSize: 15, color: '#555', alignSelf: 'flex-start', marginBottom: 5 },
  errorText: { fontSize: 18, color: 'red', textAlign: 'center', marginVertical: 50 }
});
 
export default DetalhesPontoTuristico;