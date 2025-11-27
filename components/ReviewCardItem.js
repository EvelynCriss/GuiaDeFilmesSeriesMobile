import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import RenderStars from './RenderStars';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.7;

const ReviewCardItem = ({ item, index, scrollX, isExpanded, onOpenModal, ITEM_SIZE }) => {
  const { colors: COLORS } = useTheme();
  const styles = getStyles(COLORS);

  const inputRange = [
    (index - 1) * ITEM_SIZE,
    index * ITEM_SIZE,
    (index + 1) * ITEM_SIZE,
  ];

  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [0.8, 1, 0.8],
    extrapolate: 'clamp',
  });

  const translateY = scrollX.interpolate({
    inputRange,
    outputRange: [60, 0, 60],
    extrapolate: 'clamp',
  });

  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.4, 1, 0.4],
    extrapolate: 'clamp',
  });

  const reviewContent = item.content;
  const needsTruncation = reviewContent.length > 250;
  const rating = item.author_details?.rating;

  return (
    <Animated.View style={[
      styles.reviewCard,
      {
        transform: [{ scale }, { translateY }],
        opacity: opacity,
      }
    ]}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewAuthor} numberOfLines={1}>
          {item.author_details?.name || item.author}
        </Text>
        <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.reviewText} />
      </View>
      <View style={styles.reviewRatingContainer}>
        <RenderStars rating={rating} />
      </View>
      <View style={styles.reviewContentBox}>
        <Text style={styles.reviewContent}>
          {isExpanded || !needsTruncation
            ? reviewContent
            : `${reviewContent.substring(0, 250)}...`}
        </Text>
        {needsTruncation && (
          <TouchableOpacity onPress={onOpenModal}>
            <Text style={styles.readMoreText}>
              {isExpanded ? 'Ver menos' : 'Ver mais'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const getStyles = (COLORS) => StyleSheet.create({
  reviewCard: {
    backgroundColor: COLORS.reviewCardBg,
    borderRadius: 10,
    padding: 15,
    width: CARD_WIDTH, 
    marginHorizontal: 0.5,
    shadowColor: COLORS.accent1,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: COLORS.reviewCardBorder,
    alignSelf: 'flex-start',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  reviewAuthor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.reviewText,
    marginBottom: 5,
    flexShrink: 1,
    marginRight: 10,
  },
  reviewRatingContainer: {
  flexDirection: 'row',
  marginVertical: 10,
  minHeight: 20,
  alignItems: 'center',
},
  reviewContentBox: {
    backgroundColor: COLORS.reviewTextBox,
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
    minHeight: 100,
    flexShrink: 1,
  },
  reviewContent: {
    fontSize: 14,
    color: COLORS.reviewText,
    opacity: 1,
    lineHeight: 20,
    flexWrap: 'wrap',
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.accent2,
    marginTop: 10,
  },
});

export default ReviewCardItem;