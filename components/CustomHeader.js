import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Image, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const CustomHeader = ({ navigation, back, route }) => {
  const { colors: COLORS, theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('SearchResults', { query: searchQuery });

      setSearchQuery('');
    }
  };

  return (
    <SafeAreaView 
      style={{ backgroundColor: COLORS.headerBackground }} 
      edges={['top', 'right', 'left']}
    >
      <View style={[styles.container, { 
        backgroundColor: COLORS.headerBackground, 
        borderBottomColor: COLORS.borderSubtle,
      }]}>

        <View style={styles.leftContainer}>
          {back ? (
            <TouchableOpacity onPress={navigation.goBack} style={styles.backButton}>
              <Ionicons name="chevron-back" size={28} color={COLORS.textPrimary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.logoContainer}>
              <Ionicons name="film" size={28} color={COLORS.accent1} />
            </View>
          )}
        </View>

        <View style={[styles.searchContainer, { backgroundColor: COLORS.surface }]}>
          <Ionicons name="search" size={20} color={COLORS.textPrimary} style={{ opacity: 0.5 }} />
          <TextInput
            style={[styles.searchInput, { color: COLORS.textPrimary }]}
            placeholder="Pesquisar filmes..."
            placeholderTextColor={theme === 'dark' ? '#888' : '#999'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.textPrimary} style={{ opacity: 0.5 }} />
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
    borderBottomWidth: 1,
  },
  leftContainer: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  backButton: {
    padding: 5,
  },
  logoContainer: {
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
  },
  rightContainer: {
    width: 20,
  },
});

export default CustomHeader;