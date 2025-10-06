import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'; // <--- Importe AsyncStorage
 
const FavoritesContext = createContext(); // <--- Cria o Contexto
const FAVORITES_KEY = '@GuiaTuristico:favorites'; // <--- Chave para AsyncStorage
 
export const FavoritesProvider = ({ children }) => {
  const [favoriteIds, setFavoriteIds] = useState([]); // <--- Armazena apenas os IDs dos favoritos
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true); // <--- Estado de carregamento
 
  // <--- Função para carregar favoritos do AsyncStorage
  const loadFavorites = useCallback(async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem(FAVORITES_KEY);
      if (storedFavorites !== null) {
        setFavoriteIds(JSON.parse(storedFavorites)); // <--- Converte de string para array
      }
    } catch (error) {
      console.error("Erro ao carregar favoritos do AsyncStorage:", error);
    } finally {
      setIsLoadingFavorites(false);
    }
  }, []);
 
  // <--- Função para salvar favoritos no AsyncStorage
  const saveFavorites = useCallback(async (ids) => {
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(ids)); // <--- Converte de array para string
    } catch (error) {
      console.error("Erro ao salvar favoritos no AsyncStorage:", error);
    }
  }, []);
 
  // <--- Efeito para carregar favoritos ao iniciar
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]); // Executa uma vez na montagem
 
  // <--- Efeito para salvar favoritos sempre que 'favoriteIds' mudar
  useEffect(() => {
    if (!isLoadingFavorites) { // Garante que não salve antes de carregar
      saveFavorites(favoriteIds);
    }
  }, [favoriteIds, isLoadingFavorites, saveFavorites]);
 
  // <--- Lógica para adicionar/remover favorito
  const toggleFavorite = (pontoId) => {
    setFavoriteIds(prevIds => {
      if (prevIds.includes(pontoId)) {
        return prevIds.filter(id => id !== pontoId); // Remove se já existe
      } else {
        return [...prevIds, pontoId]; // Adiciona se não existe
      }
    });
  };
 
  // <--- Lógica para verificar se é favorito
  const isFavorite = useCallback((pontoId) => {
    return favoriteIds.includes(pontoId);
  }, [favoriteIds]);
 
  const contextValue = {
    favoriteIds,
    isLoadingFavorites,
    toggleFavorite,
    isFavorite,
  };
 
  return (
    <FavoritesContext.Provider value={contextValue}>
      {children}
    </FavoritesContext.Provider>
  );
};
 
export const useFavorites = () => useContext(FavoritesContext); // <--- Hook customizado