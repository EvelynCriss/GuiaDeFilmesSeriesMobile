import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const CustomHeader = ({ navigation, back, transparent = false }) => {
  const { colors: COLORS, theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('SearchResults', { query: searchQuery });
      setSearchQuery('');
    }
  };

  const containerBackgroundColor = transparent ? 'transparent' : COLORS.headerBackground;
  const borderBottomWidth = transparent ? 0 : 1;

  const elementBackground = transparent 
    ? COLORS.glassBackground 
    : (theme === 'light' ? '#F0F0F0' : COLORS.surface);

  const contentColor = transparent 
    ? COLORS.glassText 
    : COLORS.textPrimary;

  const placeholderColor = transparent
    ? COLORS.glassPlaceholder
    : COLORS.placeholderText;

  const elementBorderColor = transparent 
    ? COLORS.glassBorder 
    : 'transparent';

  return (
    <SafeAreaView 
      edges={['top', 'right', 'left']}
      style={{ backgroundColor: containerBackgroundColor }}
    >
      <View style={[styles.container, { 
        backgroundColor: containerBackgroundColor, 
        borderBottomColor: COLORS.borderSubtle,
        borderBottomWidth: borderBottomWidth,
      }]}>

        <View style={styles.leftContainer}>
          {back ? (
            <TouchableOpacity 
              onPress={navigation.goBack} 
              style={[styles.iconButton, { 
                backgroundColor: elementBackground,
                borderColor: elementBorderColor,
                borderWidth: transparent ? 1 : 0
              }]}
            >
              <Ionicons 
                name="chevron-back" 
                size={24} 
                color={contentColor} 
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              onPress={toggleTheme}
              style={[styles.iconButton, { 
                backgroundColor: elementBackground,
                borderColor: elementBorderColor,
                borderWidth: transparent ? 1 : 0
              }]}
            >
              <Ionicons 
                name={theme === 'dark' ? 'moon' : 'sunny'} 
                size={22} 
                color={theme === 'dark' ? COLORS.accent1 : COLORS.accent3} 
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.searchContainer, { 
          backgroundColor: elementBackground,
          borderColor: elementBorderColor,
          borderWidth: transparent ? 1 : 0
        }]}>
          <Ionicons name="search" size={20} color={placeholderColor} style={{ opacity: 0.7 }} />
          
          <TextInput
            style={[styles.searchInput, { color: contentColor }]}
            placeholder="Pesquisar..."
            placeholderTextColor={placeholderColor}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={contentColor} style={{ opacity: 0.7 }} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.rightContainer} />

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  leftContainer: {
    width: 40,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 10,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    height: '100%', 
  },
  rightContainer: {
    width: 20,
  },
});

export default CustomHeader;