// screens/DetalhesFilmeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../context/FavoritesContext';
import api from '../services/api';
import { TMDB_API_KEY } from '@env';

const API_KEY = TMDB_API_KEY;
const POSTER_BASE_URL_W500 = 'https://image.tmdb.org/t/p/w500';

// <--- MUDANÇA: Nome do componente
const DetalhesFilmeScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { isFavorite, toggleFavorite } = useFavorites();

  // <--- MUDANÇA: Parâmetro 'pontoDetalhes' agora é 'mediaItem'
  const { mediaItem: filmeBase } = route.params;

  const [movieDetails, setMovieDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!API_KEY) {
        setError("Chave de API (TMDB_API_KEY) não encontrada no .env");
        setLoading(false);
        return;
      }
      
      if (!filmeBase?.id) {
        setError("ID do filme não encontrado.");
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/movie/${filmeBase.id}`, {
          params: {
            api_key: API_KEY,
            language: 'pt-BR',
            append_to_response: 'credits',
          }
        });

        if (response.data) {
          setMovieDetails(response.data);
        } else {
          setError(response.data.status_message || 'Filme não encontrado');
        }
      } catch (err) {
        setError("Erro ao buscar detalhes do filme.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [filmeBase?.id]);

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
    toggleFavorite(movieDetails.id);
  };
  const favoriteIconName = isFavorite(movieDetails.id) ? 'heart' : 'heart-outline';
  const favoriteIconColor = isFavorite(movieDetails.id) ? 'red' : 'gray';

  const director = movieDetails?.credits?.crew?.find(person => person.job === 'Director');
  const actors = movieDetails?.credits?.cast?.slice(0, 5).map(person => person.name).join(', ');
  const year = movieDetails.release_date ? new Date(movieDetails.release_date).getFullYear() : 'N/A';
  const runtime = movieDetails.runtime ? `${movieDetails.runtime} min` : 'N/A';

  return (
    <ScrollView style={styles.scrollViewContainer}>
      <View style={styles.contentContainer}>
        <Image
          source={{ uri: movieDetails.poster_path ? `${POSTER_BASE_URL_W500}${movieDetails.poster_path}` : 'https://via.placeholder.com/300x450.png?text=No+Image' }}
          style={styles.poster}
        />
        <View style={styles.header}>
          <Text style={styles.title}>{movieDetails.title}</Text>
          <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteButton}>
            <Ionicons name={favoriteIconName} size={30} color={favoriteIconColor} />
          </TouchableOpacity>
        </View>

        <Text style={styles.metaInfo}>{year} · {runtime}</Text>
        <Text style={styles.genreText}>
          {movieDetails.genres?.map(g => g.name).join(', ') || 'Gênero não informado'}
        </Text>
        <Text style={styles.sectionTitle}>Enredo</Text>
        <Text style={styles.descriptionText}>
          {movieDetails.overview || 'Sinopse não disponível.'}
        </Text>
        <Text style={styles.sectionTitle}>Diretor</Text>
        <Text style={styles.detailText}>{director ? director.name : 'N/A'}</Text>
        <Text style={styles.sectionTitle}>Atores</Text>
        <Text style={styles.detailText}>{actors || 'N/A'}</Text>
        <Text style={styles.sectionTitle}>Avaliações</Text>
        <Text style={styles.detailText}>
          TMDb: {movieDetails.vote_average ? movieDetails.vote_average.toFixed(1) : 'N/A'}/10 (de {movieDetails.vote_count || 0} votos)
        </Text>

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

// <--- MUDANÇA: Exporta o novo nome
export default DetalhesFilmeScreen;