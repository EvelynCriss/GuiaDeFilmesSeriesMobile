import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const FavoritesScreen = () => {
  const { colors: COLORS } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: COLORS.background }]}>
      <Text style={{ color: COLORS.textPrimary }}>Meus Favoritos</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

export default FavoritesScreen;