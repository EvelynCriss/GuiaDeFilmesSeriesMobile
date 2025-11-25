import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ReviewsContext = createContext();
const REVIEWS_KEY = '@GuiaTuristico:reviews';

export const ReviewsProvider = ({ children }) => {
  const [reviewsMap, setReviewsMap] = useState({});
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  const loadReviews = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(REVIEWS_KEY);
      if (stored !== null) setReviewsMap(JSON.parse(stored));
    } catch (error) {
      console.error('Erro ao carregar avaliações do AsyncStorage:', error);
    } finally {
      setIsLoadingReviews(false);
    }
  }, []);

  const saveReviews = useCallback(async (map) => {
    try {
      await AsyncStorage.setItem(REVIEWS_KEY, JSON.stringify(map));
    } catch (error) {
      console.error('Erro ao salvar avaliações no AsyncStorage:', error);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  useEffect(() => {
    if (!isLoadingReviews) {
      saveReviews(reviewsMap);
    }
  }, [reviewsMap, isLoadingReviews, saveReviews]);

  const addReview = (movieId, review) => {
    setReviewsMap(prev => {
      const prevArr = prev[movieId] || [];
      const newArr = [review, ...prevArr];
      return { ...prev, [movieId]: newArr };
    });
  };

  const getReviewsForMovie = (movieId) => {
    return reviewsMap[movieId] || [];
  };

  const contextValue = {
    reviewsMap,
    isLoadingReviews,
    addReview,
    getReviewsForMovie,
  };

  return (
    <ReviewsContext.Provider value={contextValue}>
      {children}
    </ReviewsContext.Provider>
  );
};

export const useReviews = () => useContext(ReviewsContext);
