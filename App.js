import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { FavoritesProvider } from './context/FavoritesContext';
import { ReviewsProvider } from './context/ReviewsContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext'; 

import CustomHeader from './components/CustomHeader';
import TabNavigator from './navigation/TabNavigator';
import LoginScreen from './screens/LoginScreen'; 
import RegisterScreen from './screens/RegisterScreen'; 

const Stack = createStackNavigator();

function AppContent() {
  const { colors: COLORS, theme } = useTheme();
  
  const navigationTheme = {
    ...(theme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      background: COLORS.background,
      text: COLORS.textPrimary,
      card: COLORS.background,
      border: COLORS.borderColor,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={COLORS.headerBackground} />
      
      <Stack.Navigator
        initialRouteName="Login" 
        screenOptions={{
          header: (props) => <CustomHeader {...props} />,
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} 
          options={{ headerShown: false }} 
        />

        <Stack.Screen
          name="MainTabs"
          component={TabNavigator}
          options={{ headerShown: false }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider> 
        <ThemeProvider>
          <FavoritesProvider>
            <ReviewsProvider>
              <AppContent />
            </ReviewsProvider>
          </FavoritesProvider>
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}