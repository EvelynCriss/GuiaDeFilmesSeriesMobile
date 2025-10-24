import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps'; // <--- Importe MapView, Marker, Callout
import { useNavigation } from '@react-navigation/native'; // Para navegação a partir do Callout

// Dados fictícios de pontos turísticos com coordenadas
// Em breve, usaremos os dados da API com coordenadas reais ou adaptadas
const pontosDeExemplo = [
  { id: '1', nome: 'Jardim Botânico', descricao: 'Estufa icônica de vidro.', latitude: -25.4411, longitude: -49.2329 },
  { id: '2', nome: 'Ópera de Arame', descricao: 'Teatro com estrutura de tubo de aço.', latitude: -25.3934, longitude: -49.2608 },
  { id: '3', nome: 'Parque Tanguá', descricao: 'Mirante e cascata em antiga pedreira.', latitude: -25.3670, longitude: -49.2740 },
];

const MapaScreen = () => {
  const navigation = useNavigation();

  // <--- Região inicial do mapa (Curitiba, Brasil)
  const initialRegion = {
    latitude: -25.4284,
    longitude: -49.2733,
    latitudeDelta: 0.15, // Nível de zoom (menor valor = mais zoom)
    longitudeDelta: 0.15,
  };

  // <--- Função para ir para a tela de detalhes ao clicar no Callout
  const handleMarkerPress = (ponto) => {
    // Navega para a tela de detalhes, passando o objeto ponto
    navigation.navigate('ExplorarStack', { // Nome do Stack Navigator onde DetalhesPonto está
      screen: 'DetalhesPonto', // Nome da tela de detalhes
      params: { pontoDetalhes: ponto },
    });
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion} // <--- Define a região inicial
        showsUserLocation={true}       // <--- Mostra a localização do usuário (se permitida)
      >
        {pontosDeExemplo.map(ponto => ( // <--- Mapeia os pontos para Marcadores
          <Marker
            key={ponto.id}
            coordinate={{ latitude: ponto.latitude, longitude: ponto.longitude }}
            title={ponto.nome}
            description={ponto.descricao}
          >
            <Callout onPress={() => handleMarkerPress(ponto)}> {/* <--- Callout clicável */}
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{ponto.nome}</Text>
                <Text style={styles.calloutDescription}>{ponto.descricao}</Text>
                <Text style={styles.calloutLink}>Ver Detalhes »</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: {
    width: '100%',
    height: '100%',
  },
  calloutContainer: { // Estilo do balão de informação
    width: 150,
    padding: 5,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  calloutDescription: {
    fontSize: 12,
    color: '#666',
  },
  calloutLink: {
    fontSize: 12,
    color: 'blue',
    marginTop: 5,
    textAlign: 'right',
  }
});

export default MapaScreen;