import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const RegisterScreen = ({ navigation }) => {
  const { colors: COLORS } = useTheme();
  const { register } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
      Alert.alert('Sucesso', 'Conta criada com sucesso!', [
        { text: 'OK', onPress: () => navigation.replace('MainTabs') }
      ]);
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: COLORS.textPrimary }]}>Criar Conta</Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.label, { color: COLORS.textPrimary }]}>Nome Completo</Text>
        <TextInput 
          style={[styles.input, { backgroundColor: COLORS.infoBoxBg, color: COLORS.textPrimary }]}
          placeholder="Seu nome"
          placeholderTextColor={COLORS.placeholderText}
          value={name}
          onChangeText={setName}
        />

        <Text style={[styles.label, { color: COLORS.textPrimary }]}>E-mail</Text>
        <TextInput 
          style={[styles.input, { backgroundColor: COLORS.infoBoxBg, color: COLORS.textPrimary }]}
          placeholder="seu@email.com"
          placeholderTextColor={COLORS.placeholderText}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={[styles.label, { color: COLORS.textPrimary }]}>Senha</Text>
        <TextInput 
          style={[styles.input, { backgroundColor: COLORS.infoBoxBg, color: COLORS.textPrimary }]}
          placeholder="********"
          placeholderTextColor={COLORS.placeholderText}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: COLORS.accent2 }]} 
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.fixedWhite} />
          ) : (
            <Text style={[styles.buttonText, { color: COLORS.fixedWhite }]}>Cadastrar</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  content: { padding: 24 },
  label: { marginBottom: 8, fontSize: 14, fontWeight: '600' },
  input: { borderRadius: 12, padding: 15, marginBottom: 20, fontSize: 16 },
  button: { borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 10 },
  buttonText: { fontWeight: 'bold', fontSize: 16 },
});

export default RegisterScreen;