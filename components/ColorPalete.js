// components/ColorPalete.js

export const darkColors = {
  // Cores do Tema
  background: '#2A2B2A',      // Fundo principal
  textPrimary: '#F8F4E3',     // Texto principal
  infoBoxBg: '#404040',      // Fundo para caixas de info

  // Acentos
  accent1: '#E5446D',
  accent2: '#F2676A',
  accent3: '#FF8966',

  // Específicos do Review
  reviewCardBg: '#2A2B2A',    
  reviewTextBox: '#6B6B6B',    
  reviewText: '#F8F4E3',      

  // Valores que estavam fixados no código (hardcoded)
  starOutline: 'rgba(248, 244, 227, 0.5)', 
  modalOverlayBg: 'rgba(0, 0, 0, 0.7)',
  borderColor: 'rgba(248, 244, 227, 0.2)', 
  backdropOverlay: 'rgba(0, 0, 0, 0.4)',
  shadowColor: '#ddddddff', // Sombra clara para fundos escuros
  reviewCardBorder: 'rgba(248, 244, 227, 0.1)',
};

export const lightColors = {
  // Cores do Tema
  background: '#F4F4F4',      // Fundo principal claro
  textPrimary: '#1A1A1A',     // Texto principal escuro
  infoBoxBg: '#e0e0e0ff',      // Fundo para caixas de info (branco)

  // Acentos (podem ser os mesmos ou diferentes)
  accent1: '#E5446D',
  accent2: '#F2676A',
  accent3: '#FF8966',

  // Específicos do Review
  reviewCardBg: '#FFFFFF',    
  reviewTextBox: '#EAEAEA',    
  reviewText: '#1A1A1A',      

  // Valores que estavam fixados no código (hardcoded)
  starOutline: 'rgba(26, 26, 26, 0.5)', // Contorno da estrela escuro
  modalOverlayBg: 'rgba(0, 0, 0, 0.7)', // Pode manter o overlay escuro
  borderColor: 'rgba(26, 26, 26, 0.2)', // Borda escura
  backdropOverlay: 'rgba(0, 0, 0, 0.4)', // Pode manter
  shadowColor: '#000000', // Sombra escura para fundos claros
  reviewCardBorder: 'rgba(26, 26, 26, 0.1)',
};