import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  ActivityIndicator, 
  StatusBar 
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import api from '../services/api';
import { TMDB_API_KEY } from '@env';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const DetalhesTemporadaScreen = () => {
  const { colors: COLORS, theme } = useTheme();
  const route = useRoute();
  const { seriesId, seasonNumber, seasonTitle } = route.params;

  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        const response = await api.get(`/tv/${seriesId}/season/${seasonNumber}`, {
          params: {
            api_key: TMDB_API_KEY,
            language: 'pt-BR',
          },
        });
        setEpisodes(response.data.episodes || []);
      } catch (error) {
        console.error("Erro ao buscar episódios", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEpisodes();
  }, [seriesId, seasonNumber]);

  const styles = getStyles(COLORS);

  const renderEpisode = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{
          uri: item.still_path
            ? `https://image.tmdb.org/t/p/w500${item.still_path}`
            : 'https://via.placeholder.com/300x169.png?text=Sem+Imagem',
        }}
        style={styles.episodeImage}
      />
      <View style={styles.textContainer}>
        <Text style={styles.episodeNumber}>Episódio {item.episode_number}</Text>
        <Text style={styles.episodeTitle}>{item.name}</Text>
        <Text style={styles.overview} numberOfLines={3}>
          {item.overview || 'Sem descrição disponível.'}
        </Text>
        <Text style={styles.date}>
          {item.air_date ? new Date(item.air_date).toLocaleDateString('pt-BR') : 'Data desconhecida'}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.accent1} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
       <StatusBar barStyle={theme === 'light' ? 'dark-content' : 'light-content'} backgroundColor={COLORS.headerBackground} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{seasonTitle}</Text>
        <Text style={styles.headerSubtitle}>{episodes.length} Episódios</Text>
      </View>
      <FlatList
        data={episodes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderEpisode}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const getStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textPrimary,
    opacity: 0.7,
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.infoBoxBg,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
  },
  episodeImage: {
    width: 130,
    height: 'auto',
    resizeMode: 'cover',
  },
  textContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  episodeNumber: {
    fontSize: 12,
    color: COLORS.accent1,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  episodeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  overview: {
    fontSize: 12,
    color: COLORS.textPrimary,
    opacity: 0.7,
    marginBottom: 6,
  },
  date: {
    fontSize: 10,
    color: COLORS.textPrimary,
    opacity: 0.5,
    textAlign: 'right',
  },
});

export default DetalhesTemporadaScreen;