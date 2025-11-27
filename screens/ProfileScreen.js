import React from 'react';
import { 
  View, Text, StyleSheet, Image, TouchableOpacity, Switch, ScrollView, Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';

import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const ProfileScreen = ({ navigation }) => {
  const { colors: COLORS, theme, toggleTheme } = useTheme();
  const { user, logout, updateUser } = useAuth();
  const insets = useSafeAreaInsets();

  const handleEditAvatar = async () => {
    if (!user) return;

    Alert.alert(
      "Foto de Perfil",
      "Escolha uma opção",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Tirar Foto", onPress: openCamera },
        { text: "Escolher da Galeria", onPress: openGallery }
      ]
    );
  };

  const openCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera.');
        return;
      }

      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        updateUser({ photo: result.assets[0].uri });
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível abrir a câmera.");
    }
  };

  const openGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria.');
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        updateUser({ photo: result.assets[0].uri });
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível abrir a galeria.");
    }
  };

  const toggleNotifications = async (value) => {
    if (value) {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        
        if (status === 'granted') {
          updateUser({ notificationsEnabled: true });
          
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Notificações Ativadas! 🔔",
              body: "Agora você receberá novidades sobre filmes e séries.",
            },
            trigger: null,
          });
        } else {
          Alert.alert("Permissão negada", "Habilite as notificações nas configurações do celular.");
          updateUser({ notificationsEnabled: false });
        }
      } catch (error) {
        console.log("Notificações nativas indisponíveis no Expo Go:", error.message);
        updateUser({ notificationsEnabled: true }); 
        Alert.alert(
            "Notificações Simuladas 🔔",
            "No Expo Go (Android), as notificações nativas são limitadas. Em um app real, você veria um push notification agora."
        );
      }
    } else {
      updateUser({ notificationsEnabled: false });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  const handleLoginRedirect = () => {
    navigation.replace('Login');
  };

  const renderMenuItem = (icon, label, onPress, type = 'arrow', switchValue = false) => (
    <TouchableOpacity 
      style={[styles.menuItem, { borderBottomColor: COLORS.borderSubtle }]} 
      onPress={type === 'switch' ? () => onPress(!switchValue) : onPress}
      activeOpacity={type === 'switch' ? 1 : 0.7}
      disabled={type === 'switch' && !user && label === 'Notificações'}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: COLORS.surface }]}>
          <Ionicons name={icon} size={22} color={COLORS.accent1} />
        </View>
        <Text style={[styles.menuItemText, { color: COLORS.textPrimary }]}>{label}</Text>
      </View>
      
      {type === 'switch' ? (
        <Switch
          trackColor={{ false: COLORS.switchTrackFalse, true: COLORS.accent1 }}
          thumbColor={COLORS.switchThumb}
          ios_backgroundColor={COLORS.switchIosBg}
          onValueChange={onPress}
          value={switchValue}
          disabled={!user && label === 'Notificações'}
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color={COLORS.textPrimary} style={{ opacity: 0.5 }} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: COLORS.background }]}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 100 }}>
        
        <View style={styles.profileHeader}>
          <View>
            <Image
              source={{ uri: user?.photo || 'https://github.com/DanielMoletta.png' }} 
              style={[styles.avatar, { borderColor: COLORS.accent1 }]}
            />
            
            {user && (
              <TouchableOpacity 
                style={[styles.cameraButton, { backgroundColor: COLORS.accent1 }]} 
                onPress={handleEditAvatar}
              >
                <Ionicons name="camera" size={20} color="#FFF" />
              </TouchableOpacity>
            )}
          </View>

          {user ? (
            <>
              <Text style={[styles.userName, { color: COLORS.textPrimary }]}>{user.name}</Text>
              <Text style={[styles.userEmail, { color: COLORS.textPrimary }]}>{user.email}</Text>
              
              <TouchableOpacity 
                style={[styles.editButton, { backgroundColor: COLORS.accent1 }]}
                onPress={handleEditAvatar}
              >
                <Text style={[styles.editButtonText, { color: COLORS.fixedWhite }]}>Editar Foto</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={[styles.userName, { color: COLORS.textPrimary }]}>Visitante</Text>
              <Text style={[styles.userEmail, { color: COLORS.textPrimary }]}>Modo de visualização</Text>
            </>
          )}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>Aparência</Text>
          <View style={[styles.menuContainer, { backgroundColor: COLORS.infoBoxBg }]}>
            {renderMenuItem(
              theme === 'dark' ? 'moon' : 'sunny', 
              'Modo Escuro', 
              toggleTheme, 
              'switch', 
              theme === 'dark'
            )}
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>Conta</Text>
          <View style={[styles.menuContainer, { backgroundColor: COLORS.infoBoxBg }]}>
            
            {renderMenuItem(
              'notifications-outline', 
              'Notificações', 
              toggleNotifications, 
              'switch', 
              user ? user.notificationsEnabled : false
            )}
            
            {renderMenuItem('lock-closed-outline', 'Privacidade', () => {})}
            {renderMenuItem('language-outline', 'Idioma', () => {})}
          </View>
        </View>

        <View style={styles.sectionContainer}>
          {user ? (
            <TouchableOpacity onPress={handleLogout} style={[styles.logoutButton, { borderColor: COLORS.accent2 }]}>
              <Text style={[styles.logoutText, { color: COLORS.accent2 }]}>Sair da Conta</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleLoginRedirect} style={[styles.logoutButton, { borderColor: COLORS.accent1, backgroundColor: COLORS.accent1 }]}>
              <Text style={[styles.logoutText, { color: COLORS.fixedWhite }]}>Fazer Login</Text>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileHeader: { alignItems: 'center', marginBottom: 30 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, marginBottom: 15 },
  cameraButton: {
    position: 'absolute',
    bottom: 15,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  userName: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  userEmail: { fontSize: 14, opacity: 0.6, marginBottom: 20 },
  editButton: { paddingVertical: 10, paddingHorizontal: 24, borderRadius: 20 },
  editButtonText: { fontWeight: 'bold' },
  sectionContainer: { marginBottom: 25, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, marginLeft: 5, opacity: 0.8 },
  menuContainer: { borderRadius: 15, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1 },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 35, height: 35, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuItemText: { fontSize: 16, fontWeight: '500' },
  logoutButton: { padding: 15, borderRadius: 15, borderWidth: 1, alignItems: 'center', marginTop: 10 },
  logoutText: { fontSize: 16, fontWeight: 'bold' }
});

export default ProfileScreen;