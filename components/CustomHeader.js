import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const CustomHeader = ({ navigation, back, transparent = false }) => {
  const { colors: COLORS, theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('SearchResults', { query: searchQuery });
      setSearchQuery('');
    }
  };

  // --- LÓGICA DE CORES ---

  // 1. Fundo do Header
  const containerBackgroundColor = transparent ? 'transparent' : COLORS.headerBackground;
  const borderBottomWidth = transparent ? 0 : 1;
  
  // 2. Fundo do Input de Busca
  const inputBackgroundColor = transparent 
    ? (theme === 'dark' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(155, 155, 155, 0.6)') 
    : COLORS.surface;

  // 3. Fundo dos Ícones (Voltar e Logo)
  // Agora aplicamos isso para AMBOS os casos (Logo ou Voltar) quando transparente
  const iconButtonBackground = transparent 
    ? (theme === 'dark' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(155, 155, 155, 0.6)') 
    : 'transparent';

  // 4. Cores dos Elementos
  const contentColor = transparent
    ? (theme === 'dark' ? '#FFFFFF' : '#000000')
    : COLORS.textPrimary;

  const placeholderColor = transparent
    ? (theme === 'dark' ? '#CCCCCC' : '#444444')
    : (theme === 'dark' ? '#AAAAAA' : '#666666');

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

        {/* Lado Esquerdo: Botão Voltar OU Logo */}
        <View style={styles.leftContainer}>
          {back ? (
            <TouchableOpacity 
              onPress={navigation.goBack} 
              style={[styles.iconButton, { backgroundColor: iconButtonBackground }]}
            >
              <Ionicons 
                name="chevron-back" 
                size={24} 
                color={contentColor} 
              />
            </TouchableOpacity>
          ) : (
            // AQUI ESTA A MUDANÇA: O Logo também ganha o container com background
            <View style={[styles.iconButton, { backgroundColor: iconButtonBackground }]}>
              <Ionicons name="film" size={24} color={COLORS.accent1} />
            </View>
          )}
        </View>

        {/* Barra de Pesquisa */}
        <View style={[styles.searchContainer, { backgroundColor: inputBackgroundColor }]}>
          <Ionicons name="search" size={20} color={contentColor} style={{ opacity: 0.6 }} />
          
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
              <Ionicons name="close-circle" size={18} color={contentColor} style={{ opacity: 0.6 }} />
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
  // Estilo unificado para o botão circular (Logo e Voltar)
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
  },
  rightContainer: {
    width: 20,
  },
});

export default CustomHeader;