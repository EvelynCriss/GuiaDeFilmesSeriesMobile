import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { TMDB_API_KEY } from '@env';
import { useTheme } from '../context/ThemeContext';
import FilmeCard from '../components/FilmeCard';

const SearchResultsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors: COLORS, theme } = useTheme();
  const insets = useSafeAreaInsets();

  const { query } = route.params;

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const styles = getStyles(COLORS);

  const fetchSearchResults = useCallback(async () => {
    if (!TMDB_API_KEY) {
      setError("Chave de API ausente");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get('/search/multi', {
        params: {
          api_key: TMDB_API_KEY,
          language: 'pt-BR',
          query: query,
          include_adult: false,
        }
      });

      const filteredResults = response.data.results.filter(
        item => item.media_type === 'movie' || item.media_type === 'tv'
      );

      setResults(filteredResults);
    } catch (err) {
      setError('Erro ao realizar a busca.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchSearchResults();
  }, [fetchSearchResults]);

  const handleMediaPress = useCallback((media) => {
    navigation.navigate('DetalhesFilme', { mediaItem: media });
  }, [navigation]);

  const renderItem = useCallback(({ item }) => (
    <FilmeCard
      media={item}
      onPress={() => handleMediaPress(item)}
      isCarousel={false}
    />
  ), [handleMediaPress]);

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

      <View style={[styles.headerContainer, { marginTop: 60 + insets.top }]}>
        <Text style={styles.resultsTitle}>
          Resultados para: <Text style={styles.highlightText}>{query}</Text>
        </Text>
      </View>

      {results.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="search-outline" size={64} color={COLORS.textPrimary} style={{ opacity: 0.5 }} />
          <Text style={styles.noResultsText}>Nenhum resultado encontrado.</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: 80 + insets.bottom }
          ]}
          showsVerticalScrollIndicator={false}

          initialNumToRender={8}
          maxToRenderPerBatch={6}
          windowSize={5}
          removeClippedSubviews={true}
          updateCellsBatchingPeriod={50}
        />
      )}
    </View>
  );
};

const getStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  highlightText: {
    color: COLORS.accent1,
    fontStyle: 'italic',
  },
  listContent: {
    paddingBottom: 30,
  },
  noResultsText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textPrimary,
    opacity: 0.7,
  },
});

export default SearchResultsScreen;