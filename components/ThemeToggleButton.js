// components/ThemeToggleButton.js
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const ThemeToggleButton = () => {
  const { theme, toggleTheme, colors } = useTheme();

  return (
    <TouchableOpacity onPress={toggleTheme} style={styles.button}>
      <Ionicons
        name={theme === 'dark' ? 'sunny-outline' : 'moon-outline'}
        size={24}
        color={colors.textPrimary} // Usa a cor do tema
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 10,
    marginRight: 10, // Ajuste conforme necessário
  },
});

export default ThemeToggleButton;