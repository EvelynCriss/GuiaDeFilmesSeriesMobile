import React from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const getRatingGradientColors = (rating, COLORS) => {
  if (rating >= 9.0) {
    return [COLORS.accent3, COLORS.accent1];
  }
  if (rating >= 7.5) {
    return [COLORS.accent1, COLORS.accent3];
  }
  if (rating >= 6.0) {
    return [COLORS.accent2, COLORS.accent3 + '99'];
  }
  if (rating >= 4.5) {
    return [COLORS.accent2, COLORS.accent2 + '80'];
  }
  return [COLORS.infoBoxBg, COLORS.reviewTextBox];
};

const MovieRating = ({ rating, style }) => {
  const { colors: COLORS } = useTheme();
  const styles = getStyles(COLORS);

  if (!rating || rating <= 0) {
    return null;
  }

  const ratingGradientColors = getRatingGradientColors(rating, COLORS);

  return (
    <AnimatedLinearGradient
      colors={ratingGradientColors}
      start={{ x: 0.0, y: 0.5 }}
      end={{ x: 1.0, y: 0.5 }}
      style={[styles.ratingContainer, style]}
    >
      <Ionicons name="flame" size={20} color={COLORS.textPrimary} />
      <Text style={styles.ratingText}>
        {rating.toFixed(1)}
        <Text style={styles.ratingTextSecondary}> / 10</Text>
      </Text>
    </AnimatedLinearGradient>
  );
};

const getStyles = (COLORS) => StyleSheet.create({
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    overflow: 'hidden',
  },
  ratingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  ratingTextSecondary: {
    fontSize: 14,
    fontWeight: 'normal',
    color: COLORS.textPrimary,
    opacity: 0.7,
  },
});

export default MovieRating;