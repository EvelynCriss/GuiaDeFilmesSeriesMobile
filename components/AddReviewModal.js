import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const AddReviewModal = ({ visible, onClose, onSave }) => {
  const { colors: COLORS } = useTheme();
  const { user } = useAuth();
  const styles = getStyles(COLORS);

  const [content, setContent] = useState('');
  const [stars, setStars] = useState(5);

  const handleSave = () => {
    if (!user) return; 
    const review = {
      id: `local-${Date.now()}`,
      author: user.name,
      author_details: { name: user.name, rating: stars * 2 },
      content: content || '',
      created_at: new Date().toISOString(),
    };
    onSave && onSave(review);
    setContent('');
    setStars(5);
  };

  const renderStarsInput = () => (
    <View style={styles.starsRow}>
      {[1,2,3,4,5].map((n) => (
        <TouchableOpacity key={n} onPress={() => setStars(n)} style={styles.starTouch}>
          <Ionicons name={n <= stars ? 'star' : 'star-outline'} size={28} color={COLORS.accent1} />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{user ? "Adicionar Avaliação" : "Fazer Login"}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          {!user ? (
             <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <Ionicons name="lock-closed" size={50} color={COLORS.accent1} style={{ marginBottom: 15 }} />
                <Text style={{ color: COLORS.textPrimary, textAlign: 'center', marginBottom: 20 }}>
                  Você precisa estar logado para publicar uma avaliação.
                </Text>
                <TouchableOpacity onPress={onClose} style={[styles.actionBtn, styles.saveBtn, { width: '100%', alignItems: 'center' }]}>
                  <Text style={styles.actionText}>Entendi</Text>
                </TouchableOpacity>
             </View>
          ) : (
            <>
              <Text style={styles.label}>Sua nota</Text>
              {renderStarsInput()}

              <Text style={styles.label}>Publicando como:</Text>
              <Text style={{ color: COLORS.accent3, fontWeight: 'bold', marginBottom: 10 }}>{user.name}</Text>

              <Text style={styles.label}>Comentário</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                value={content}
                onChangeText={setContent}
                placeholder="Escreva sua avaliação..."
                placeholderTextColor={COLORS.placeholderText} 
                multiline
              />

              <View style={styles.actionsRow}>
                <TouchableOpacity onPress={onClose} style={[styles.actionBtn, styles.cancelBtn]}>
                  <Text style={[styles.actionText, { color: COLORS.textPrimary }]}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => { handleSave(); onClose(); }} style={[styles.actionBtn, styles.saveBtn]}>
                  <Text style={styles.actionText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (COLORS) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: COLORS.modalOverlayBg, justifyContent: 'center', alignItems: 'center', padding: 20 },
  container: { width: '100%', backgroundColor: COLORS.reviewCardBg, borderRadius: 12, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
  closeBtn: { padding: 4 },
  label: { color: COLORS.textPrimary, marginTop: 8, marginBottom: 6 },
  starsRow: { flexDirection: 'row', marginBottom: 8 },
  starTouch: { paddingHorizontal: 6 },
  input: { backgroundColor: COLORS.infoBoxBg, color: COLORS.textPrimary, borderRadius: 8, padding: 10 },
  textarea: { height: 100, textAlignVertical: 'top' },
  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  actionBtn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, marginLeft: 8 },
  cancelBtn: { backgroundColor: 'transparent' },
  saveBtn: { backgroundColor: COLORS.accent2 },
  actionText: { color: COLORS.textPrimary, fontWeight: 'bold' },
});

export default AddReviewModal;