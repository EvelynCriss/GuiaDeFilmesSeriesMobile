import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

const GenrePill = ({ name, id, type }) => {
  const { colors: COLORS } = useTheme();
  const navigation = useNavigation();
  const styles = getStyles(COLORS);

  const handlePress = () => {
    navigation.push('ListaFilmesCategoria', {
      genreId: id,
      genreName: name,
      mediaType: type, 
    });
  };

  return (
    <TouchableOpacity 
      style={styles.genrePill} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text style={styles.genrePillText}>{name}</Text>
    </TouchableOpacity>
  );
};

const getStyles = (COLORS) => StyleSheet.create({
  genrePill: {
    backgroundColor: COLORS.accent2,
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 12,
    margin: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  genrePillText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default GenrePill;