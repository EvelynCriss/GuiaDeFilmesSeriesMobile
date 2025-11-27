import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
 
const FavoritesContext = createContext();
const FAVORITES_KEY = '@GuiaTuristico:favorites';
 
export const FavoritesProvider = ({ children }) => {
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);

  const loadFavorites = useCallback(async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem(FAVORITES_KEY);
      if (storedFavorites !== null) {
        setFavoriteIds(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error("Erro ao carregar favoritos do AsyncStorage:", error);
    } finally {
      setIsLoadingFavorites(false);
    }
  }, []);
 
  const saveFavorites = useCallback(async (ids) => {
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
    } catch (error) {
      console.error("Erro ao salvar favoritos no AsyncStorage:", error);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);
 
  useEffect(() => {
    if (!isLoadingFavorites) { 
      saveFavorites(favoriteIds);
    }
  }, [favoriteIds, isLoadingFavorites, saveFavorites]);
 
  const toggleFavorite = (pontoId) => {
    setFavoriteIds(prevIds => {
      if (prevIds.includes(pontoId)) {
        return prevIds.filter(id => id !== pontoId); 
      } else {
        return [...prevIds, pontoId]; 
      }
    });
  };

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
 
export const useFavorites = () => useContext(FavoritesContext); 