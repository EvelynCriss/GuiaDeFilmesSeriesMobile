// components/RenderStars.js (versão compacta)
import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './ColorPalete';

const RenderStars = ({ rating }) => {
  const numStars = Math.round(rating / 2);

  if (rating === null || rating === undefined || rating === 0) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons name="remove-circle-outline" size={16} color={COLORS.textPrimary} />
        <Text style={{ 
          fontSize: 12, 
          color: COLORS.textPrimary, 
          opacity: 0.5,
          marginLeft: 4
        }}>
          Sem nota
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flexDirection: 'row' }}>
      {[...Array(5)].map((_, index) => {
        const starName = index < numStars ? 'star' : 'star-outline';
        const starColor =
          index < numStars ? COLORS.accent1 : COLORS.starOutline;
        return <Ionicons key={index} name={starName} size={18} color={starColor} />;
      })}
    </View>
  );
};

export default RenderStars;