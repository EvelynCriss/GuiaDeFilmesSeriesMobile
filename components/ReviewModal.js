// components/ReviewModal.js
import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import RenderStars from './RenderStars'; // Importa o componente de estrelas

const ReviewModal = ({ visible, onClose, review }) => {
  const { colors: COLORS } = useTheme(); // <--- MUDANÇA
  const styles = getStyles(COLORS);
  
  if (!review) {
    return null; // Não renderiza nada se não houver review selecionado
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Review de {review?.author_details?.name || review?.author}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalRatingContainer}>
            <RenderStars rating={review?.author_details?.rating} />
          </View>

          <ScrollView style={styles.modalContentScroll} showsVerticalScrollIndicator={true}>
            <Text style={styles.modalContentText}>
              {review?.content}
            </Text>
          </ScrollView>

          <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
            <Text style={styles.modalCloseBtnText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (COLORS) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.modalOverlayBg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: COLORS.reviewCardBg,
    borderRadius: 15,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 10,
  },
  closeButton: {
    padding: 5,
  },
  modalRatingContainer: {
    marginBottom: 15,
  },
  modalContentScroll: {
    flexGrow: 0,
    maxHeight: 400,
    marginBottom: 20,
  },
  modalContentText: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.textPrimary,
    textAlign: 'left',
  },
  modalCloseBtn: {
    backgroundColor: COLORS.accent2,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCloseBtnText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ReviewModal;