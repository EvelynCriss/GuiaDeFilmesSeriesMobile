import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Switch, 
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ProfileScreen = () => {
  const { colors: COLORS, theme, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();

  // Função auxiliar para renderizar opções do menu
  const renderMenuItem = (icon, label, onPress, isSwitch = false) => (
    <TouchableOpacity 
      style={[styles.menuItem, { borderBottomColor: COLORS.borderSubtle }]} 
      onPress={isSwitch ? toggleTheme : onPress}
      activeOpacity={isSwitch ? 1 : 0.7}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: COLORS.surface }]}>
          <Ionicons name={icon} size={22} color={COLORS.accent1} />
        </View>
        <Text style={[styles.menuItemText, { color: COLORS.textPrimary }]}>{label}</Text>
      </View>
      
      {isSwitch ? (
        <Switch
          trackColor={{ false: '#767577', true: COLORS.accent1 }}
          thumbColor={theme === 'dark' ? '#f4f3f4' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleTheme}
          value={theme === 'dark'}
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color={COLORS.textPrimary} style={{ opacity: 0.5 }} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: COLORS.background }]}>
      <ScrollView 
        contentContainerStyle={{ 
          paddingTop: insets.top + 20, 
          paddingBottom: 100 
        }}
      >
        {/* Cabeçalho do Perfil */}
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: 'https://github.com/DanielMoletta.png' }} // Exemplo: sua foto do GitHub
            style={[styles.avatar, { borderColor: COLORS.accent1 }]}
          />
          <Text style={[styles.userName, { color: COLORS.textPrimary }]}>Daniel Moletta</Text>
          <Text style={[styles.userEmail, { color: COLORS.textPrimary }]}>dev@exemplo.com</Text>
          
          <TouchableOpacity style={[styles.editButton, { backgroundColor: COLORS.accent1 }]}>
            <Text style={styles.editButtonText}>Editar Perfil</Text>
          </TouchableOpacity>
        </View>

        {/* Seção de Configurações */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>Aparência</Text>
          
          <View style={[styles.menuContainer, { backgroundColor: COLORS.infoBoxBg }]}>
            {/* --- AQUI ESTÁ O BOTÃO DE TEMA --- */}
            {renderMenuItem(
              theme === 'dark' ? 'moon' : 'sunny', 
              'Modo Escuro', 
              toggleTheme, 
              true // Indica que é um switch
            )}
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>Conta</Text>
          
          <View style={[styles.menuContainer, { backgroundColor: COLORS.infoBoxBg }]}>
            {renderMenuItem('notifications-outline', 'Notificações', () => {})}
            {renderMenuItem('lock-closed-outline', 'Privacidade', () => {})}
            {renderMenuItem('language-outline', 'Idioma', () => {})}
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <TouchableOpacity style={[styles.logoutButton, { borderColor: COLORS.accent2 }]}>
            <Text style={[styles.logoutText, { color: COLORS.accent2 }]}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 20,
  },
  editButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  sectionContainer: {
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft: 5,
    opacity: 0.8,
  },
  menuContainer: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 35,
    height: 35,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default ProfileScreen;