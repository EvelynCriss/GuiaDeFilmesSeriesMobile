import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

const USERS_KEY = '@GuiaTuristico:users';   
const SESSION_KEY = '@GuiaTuristico:session'; 

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedSession = await AsyncStorage.getItem(SESSION_KEY);
        if (storedSession) {
          setUser(JSON.parse(storedSession));
        }
      } catch (error) {
        console.error('Erro ao carregar sessão:', error);
      } finally {
        setIsLoadingAuth(false);
      }
    };
    loadSession();
  }, []);

  const register = async (name, email, password) => {
    try {
      const usersJson = await AsyncStorage.getItem(USERS_KEY);
      const users = usersJson ? JSON.parse(usersJson) : [];

      const userExists = users.find(u => u.email === email);
      if (userExists) throw new Error('Este e-mail já está cadastrado.');

      const newUser = { 
        id: Date.now().toString(), 
        name, 
        email, 
        password,
        photo: null,
        notificationsEnabled: false 
      };
      
      const newUsersList = [...users, newUser];

      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(newUsersList));
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
      setUser(newUser);
      return true;
    } catch (error) {
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const usersJson = await AsyncStorage.getItem(USERS_KEY);
      const users = usersJson ? JSON.parse(usersJson) : [];

      const foundUser = users.find(u => u.email === email && u.password === password);

      if (foundUser) {
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(foundUser));
        setUser(foundUser);
        return true;
      } else {
        throw new Error('E-mail ou senha inválidos.');
      }
    } catch (error) {
      throw error;
    }
  };

  const updateUser = async (updates) => {
    if (!user) return;

    try {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);

      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));

      const usersJson = await AsyncStorage.getItem(USERS_KEY);
      if (usersJson) {
        const users = JSON.parse(usersJson);
        const newUsersList = users.map(u => (u.email === user.email ? updatedUser : u));
        await AsyncStorage.setItem(USERS_KEY, JSON.stringify(newUsersList));
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
    }
  };

  const guestLogin = async () => {
    await AsyncStorage.removeItem(SESSION_KEY);
    setUser(null); 
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(SESSION_KEY);
      setUser(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoadingAuth, login, register, logout, guestLogin, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);