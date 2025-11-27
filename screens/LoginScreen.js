import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; 
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const logoImage = require('../assets/icon.png');

const LoginScreen = ({ navigation }) => {
  const { colors: COLORS, theme } = useTheme(); 
  const { login, guestLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const darkGradient = ['#1a1a1a', '#2C1A1D', '#0f0f0f']; 
  const lightGradient = ['#ffffff', '#fff0f3', '#ffe4e8'];

  const activeGradient = theme === 'dark' ? darkGradient : lightGradient;

  const glassStyle = {
    backgroundColor: COLORS.glassBackground,
    borderColor: COLORS.glassBorder,
    borderWidth: theme === 'light' ? 1.5 : 1, 
    
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: theme === 'light' ? 0.2 : 0, 
    shadowRadius: 12,
    elevation: theme === 'light' ? 8 : 0, 
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      navigation.replace('MainTabs');
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    await guestLogin();
    navigation.replace('MainTabs');
  };

  return (
    <LinearGradient
      colors={activeGradient}
      style={styles.backgroundContainer}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar 
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent" 
        translucent 
      />
      
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Image source={logoImage} style={styles.logo} resizeMode="contain" />
            </View>

            <View style={styles.form}>
              <Text style={[styles.label, { color: COLORS.glassText }]}>E-mail</Text>
              <TextInput
                style={[styles.input, glassStyle, { color: COLORS.glassText }]}
                placeholder="seu@email.com"
                placeholderTextColor={COLORS.glassPlaceholder}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <Text style={[styles.label, { color: COLORS.glassText }]}>Senha</Text>
              <TextInput
                style={[styles.input, glassStyle, { color: COLORS.glassText }]}
                placeholder="********"
                placeholderTextColor={COLORS.glassPlaceholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <TouchableOpacity
                style={[
                  styles.button, 
                  glassStyle, 
                  { 
                    backgroundColor: COLORS.accent1 + (theme === 'dark' ? '90' : 'FF'), 
                    borderColor: COLORS.accent1 
                  }
                ]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.fixedWhite} />
                ) : (
                  <Text style={[styles.buttonText, { color: COLORS.fixedWhite }]}>Entrar</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.linkButton}>
                <Text style={[styles.linkText, { color: COLORS.accent2 }]}>Criar nova conta</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity onPress={handleGuest} style={[styles.guestButton, glassStyle]}>
                <Text style={[styles.guestText, { color: COLORS.glassText }]}>Entrar sem logar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  backgroundContainer: { flex: 1, width: '100%', height: '100%' },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  
  logoContainer: { 
    alignItems: 'center', 
    marginBottom: 60 
  },
  logo: { 
    width: 240, 
    height: 240,
  },
  
  form: { marginBottom: 20 },
  label: { marginBottom: 6, fontSize: 13, fontWeight: '600', marginLeft: 4 },
  
  input: { 
    borderRadius: 14, 
    padding: 12, 
    marginBottom: 16, 
    fontSize: 16,
    overflow: 'hidden', 
  },
  
  button: { 
    borderRadius: 14, 
    padding: 12, 
    alignItems: 'center', 
    marginBottom: 12,
  },
  buttonText: { fontWeight: 'bold', fontSize: 16 },
  
  linkButton: { alignItems: 'center', padding: 8 },
  linkText: { fontWeight: 'bold', fontSize: 15 },
  
  footer: { marginTop: 10, alignItems: 'center' },
  
  guestButton: { 
    padding: 12, 
    borderRadius: 25, 
    width: '100%', 
    alignItems: 'center',
  },
  guestText: { fontSize: 15, fontWeight: '600' }
});

export default LoginScreen;