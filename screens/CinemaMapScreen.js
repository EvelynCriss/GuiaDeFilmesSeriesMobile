import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions, Alert, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.04;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const CinemaMapScreen = ({ navigation }) => {
  const { colors: COLORS, theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cinemas, setCinemas] = useState([]);

  const generateMockCinemas = (lat, long) => {
    return [
      { id: 1, title: "Cinepolis Center",latitude: lat + 0.005, longitude: long + 0.005, description: "Shopping Center - Salas VIP" },
      { id: 2, title: "Cinemark Downtown", latitude: lat - 0.007, longitude: long - 0.002, description: "Melhor pipoca da cidade" },
      { id: 3, title: "Espaço Itaú de Cinema", latitude: lat + 0.002, longitude: long - 0.008, description: "Filmes cult e alternativos" },
      { id: 4, title: "UCI Cinemas IMAX", latitude: lat - 0.003, longitude: long + 0.009, description: "Experiência IMAX completa" },
    ];
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permissão de localização negada. Não podemos mostrar cinemas próximos.');
        setLoading(false);
        Alert.alert("Permissão Necessária", "Precisamos da sua localização para encontrar cinemas próximos.");
        return;
      }

      try {
        let userLocation = await Location.getCurrentPositionAsync({});
        setLocation(userLocation.coords);
        setCinemas(generateMockCinemas(userLocation.coords.latitude, userLocation.coords.longitude));
      } catch (error) {
         setErrorMsg('Erro ao obter localização.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const styles = getStyles(COLORS, insets);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.accent1} />
        <Text style={styles.loadingText}>Encontrando sua localização...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {location ? (
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          customMapStyle={theme === 'dark' ? mapDarkStyle : []}
          showsUserLocation={true}
          showsMyLocationButton={true}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }}
        >
          {cinemas.map(cinema => (
            <Marker
              key={cinema.id}
              coordinate={{ latitude: cinema.latitude, longitude: cinema.longitude }}
              title={cinema.title}
              description={cinema.description}
              pinColor={COLORS.accent1}
            >
                 <View style={styles.customMarker}>
                    <Ionicons name="videocam" size={24} color={COLORS.background} />
                 </View>
            </Marker>
          ))}
        </MapView>
      ) : (
        <View style={styles.center}>
           <Ionicons name="location-off-outline" size={64} color={COLORS.textPrimary} style={{opacity: 0.5}}/>
           <Text style={styles.errorText}>{errorMsg || "Não foi possível carregar o mapa."}</Text>
        </View>
      )}
      
      <TouchableOpacity style={styles.backButtonFloat} onPress={() => navigation.goBack()}>
         <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
      </TouchableOpacity>

       <View style={styles.infoOverlay}>
          <Text style={styles.infoText}>Cinemas próximos a você (Simulação)</Text>
       </View>
    </View>
  );
};

const getStyles = (COLORS, insets) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
     marginTop: insets.top + 60,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.textPrimary,
  },
  errorText: {
    color: COLORS.textPrimary,
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20
  },
  customMarker: {
      backgroundColor: COLORS.accent1,
      padding: 8,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: COLORS.background,
      elevation: 5,
      // CORRIGIDO: Usa a cor de sombra da paleta
      shadowColor: COLORS.shadowColor,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.3,
      shadowRadius: 3,
  },
  backButtonFloat: {
      position: 'absolute',
      top: insets.top + 10,
      left: 15,
      width: 40, height: 40,
      borderRadius: 20,
      backgroundColor: COLORS.surface,
      justifyContent: 'center', alignItems: 'center',
      elevation: 5,
      zIndex: 10,
      // CORRIGIDO
      shadowColor: COLORS.shadowColor,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.3,
      shadowRadius: 3,
  },
  infoOverlay: {
      position: 'absolute',
      bottom: insets.bottom + 70, 
      alignSelf: 'center',
      backgroundColor: COLORS.surface,
      paddingVertical: 8, paddingHorizontal: 20,
      borderRadius: 20,
      elevation: 3,
      // CORRIGIDO
      shadowColor: COLORS.shadowColor,
  },
  infoText: {
      color: COLORS.textPrimary,
      fontWeight: 'bold', fontSize: 12
  }
});

// JSON do Google Maps permanece "hardcoded" pois são chaves específicas da API do Google, não cores de UI.
const mapDarkStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
  { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
  { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#263c3f" }] },
  { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#6b9a76" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] },
  { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#212a37" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#746855" }] },
  { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#1f2835" }] },
  { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#2f3948" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] },
  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#515c6d" }] },
  { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [{ "color": "#17263c" }] }
];

export default CinemaMapScreen;