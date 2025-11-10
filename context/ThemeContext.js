// context/ThemeContext.js
import React, { createContext, useState, useContext } from 'react';
import { lightColors, darkColors } from '../components/ColorPalete'; // Ajuste o caminho

// 1. Criar o Contexto
const ThemeContext = createContext();

// 2. Criar o Provedor
export const ThemeProvider = ({ children }) => {
  // 'dark' ou 'light'
  const [theme, setTheme] = useState('dark'); 

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  // 3. Determinar quais cores usar
  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 4. Criar o Hook customizado para facilitar o uso
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};