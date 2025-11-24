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

  // --- LÓGICA DE VISIBILIDADE ---

  // 1. Fundo do Header (O container principal)
  // Mantemos transparente como você pediu.
  const containerBackgroundColor = transparent ? 'transparent' : COLORS.headerBackground;
  const borderBottomWidth = transparent ? 0 : 1;
  
  // 2. Fundo da Caixa de Pesquisa e Botões
  // AQUI ESTÁ A CORREÇÃO:
  // Se for transparente, usamos um PRETO com 75% de opacidade. 
  // Isso garante que o texto branco seja lido perfeitamente, mesmo se o fundo do app for branco.
  const elementBackground = transparent 
    ? 'rgba(30, 30, 30, 0.75)' 
    : (theme === 'light' ? '#F0F0F0' : COLORS.surface);

  // 3. Cor do Texto e Ícones
  // Se transparente (fundo escuro), texto sempre BRANCO.
  const contentColor = transparent 
    ? '#FFFFFF' 
    : COLORS.textPrimary;

  const placeholderColor = transparent
    ? '#CCCCCC' // Cinza claro para ler em cima do preto
    : (theme === 'dark' ? '#AAAAAA' : '#888888');

  // Borda sutil para destacar a caixa quando o fundo for parecido
  const elementBorderColor = transparent 
    ? 'rgba(255, 255, 255, 0.1)' 
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

        {/* Lado Esquerdo: Botão Voltar OU Logo */}
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
            <View style={[styles.iconButton, { 
              backgroundColor: elementBackground,
              borderColor: elementBorderColor,
              borderWidth: transparent ? 1 : 0
            }]}>
              <Ionicons name="film" size={24} color={COLORS.accent1} />
            </View>
          )}
        </View>

        {/* Barra de Pesquisa */}
        <View style={[styles.searchContainer, { 
          backgroundColor: elementBackground,
          borderColor: elementBorderColor,
          borderWidth: transparent ? 1 : 0
        }]}>
          <Ionicons name="search" size={20} color={contentColor} style={{ opacity: 0.7 }} />
          
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
    borderRadius: 20, // Mais arredondado
    paddingHorizontal: 10,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    height: '100%', // Garante que o input ocupe a altura toda para facilitar o toque
  },
  rightContainer: {
    width: 20,
  },
});

export default CustomHeader;