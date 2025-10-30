// screens/ListaPontosTuristicos.js
import React, { useState, useEffect, useMemo, useCallback } from 'react'; // <--- Importe useCallback
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import PontoTuristicoCard from '../components/PontoTuristicoCard';
import api from '../services/api';
import { useNavigation, useFocusEffect } from '@react-navigation/native'; // <--- Importe useFocusEffect
import * as Location from 'expo-location';
import { calculateDistance } from '../utils/locationUtils';
import { Ionicons } from '@expo/vector-icons'; // <--- Importe Ionicons

const ListaPontosTuristicos = () => {
  // ... (estados e useEffects existentes) ...

  // <--- Modifique fetchPontosTuristicos para ser um useCallback
  const fetchPontosTuristicos = useCallback(async () => {
    try {
      setIsLoading(true); // Garante que o loading aparece ao refetch
      const response = await api.get('/posts');
      const dadosAdaptados = response.data.map(item => ({
        id: String(item.id),
        nome: item.title,
        descricao: item.body,
        imagem: `https://picsum.photos/id/${item.id % 100}/150/150`,
        latitude: -25.4284 + (Math.random() - 0.5) * 0.1,
        longitude: -49.2733 + (Math.random() - 0.5) * 0.1,
        detalhesCompletos: item.body + ' ' + item.title,
        categoria: item.id % 3 === 0 ? 'Parque' : (item.id % 3 === 1 ? 'Museu' : 'Teatro'),
      }));
      setPontosTuristicos(dadosAdaptados);
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
      setError("Não foi possível carregar os pontos turísticos.");
    } finally {
      setIsLoading(false);
    }
  }, []); // Dependências vazias, pois não depende de nenhum estado/prop

  // <--- Use useFocusEffect para recarregar a lista quando a tela focar
  useFocusEffect(
    useCallback(() => {
      fetchPontosTuristicos();
    }, [fetchPontosTuristicos])
  );

  // ... (filteredAndSortedPontos e handlePontoPress existentes) ...

  return (
    <View style={styles.container}>
      <Text style={styles.mainTitle}>Pontos Turísticos</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar pontos turísticos..."
        value={searchTerm}
        onChangeText={setSearchTerm}
      />
      <View style={styles.categoryFilterContainer}>
        {['Todos', 'Parque', 'Museu', 'Teatro'].map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.selectedCategoryButton,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === category && styles.selectedCategoryButtonText,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {locationErrorMsg && ( <Text style={styles.locationError}>{locationErrorMsg}</Text> )}
      {userLocation && ( <Text style={styles.locationInfo}>Localização obtida: Lat {userLocation.latitude.toFixed(4)}, Lon {userLocation.longitude.toFixed(4)}</Text> )}

      {/* <--- Botão para adicionar novo ponto */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('GerenciarPonto', {})} // Navega para a tela de gerenciamento sem ponto para edição
      >
        <Ionicons name="add-circle" size={30} color="#007bff" />
        <Text style={styles.addButtonText}>Adicionar Novo Ponto</Text>
      </TouchableOpacity>

      {filteredAndSortedPontos.length === 0 && (searchTerm !== '' || selectedCategory !== 'Todos') ? (
        <Text style={styles.noResultsText}>Nenhum resultado encontrado para "{debouncedSearchTerm}" na categoria "{selectedCategory}".</Text>
      ) : (
        <FlatList
          data={filteredAndSortedPontos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PontoTuristicoCard
              ponto={item}
              onPress={() => handlePontoPress(item)}
            />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // ... estilos existentes ...
  addButton: { // <--- Estilo para o botão de adicionar
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e6f2ff',
    padding: 10,
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007bff',
  },
  addButtonText: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
  },
});

export default ListaPontosTuristicos;