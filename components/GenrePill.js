// components/GenrePill.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const GenrePill = ({ name }) => {
  const { colors: COLORS } = useTheme();
  const styles = getStyles(COLORS);

  return (
    <View style={styles.genrePill}>
      <Text style={styles.genrePillText}>{name}</Text>
    </View>
  );
};

const getStyles = (COLORS) => StyleSheet.create({
  genrePill: {
    backgroundColor: COLORS.accent2,
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 12,
    margin: 4,
  },
  genrePillText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default GenrePill;