import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useTheme } from '@/modules/Theme/context/ThemeContext';
import { useBadgeStore } from '@/modules/Badge/store/useBadgeStore';
import { Badge } from '@/modules/Badge/interfaces/Badge';

interface BadgeSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (selectedBadges: Badge[]) => void;
  currentlyEquipped: Badge[];
}

export const BadgeSelectorModal: React.FC<BadgeSelectorModalProps> = ({ visible, onClose, onSave, currentlyEquipped }) => {
  const { colors } = useTheme();
  const { myBadges, allBadges } = useBadgeStore();
  const [selectedBadges, setSelectedBadges] = useState<Badge[]>([]);

  useEffect(() => {
    setSelectedBadges(currentlyEquipped);
  }, [currentlyEquipped, visible]);

  const getBadgeDetails = (badgeId: number): Badge | undefined => {
    return allBadges.find(b => b.id === badgeId);
  };

  const handleSelectBadge = (badge: Badge) => {
    setSelectedBadges(prev => {
      if (prev.find(b => b.id === badge.id)) {
        return prev.filter(b => b.id !== badge.id);
      } else if (prev.length < 5) {
        return [...prev, badge];
      }
      return prev;
    });
  };

  const handleSave = () => {
    onSave(selectedBadges);
    onClose();
  };

  const earnedBadges = myBadges.map(ub => getBadgeDetails(ub.badgeId)).filter((b): b is Badge => b !== undefined);

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>칭호 관리</Text>
          <Text style={[styles.modalSubtitle, { color: colors.secondary }]}>프로필에 표시할 칭호를 최대 5개 선택하세요.</Text>
          
          <ScrollView style={styles.badgeList}>
            {earnedBadges.map(badge => {
              const isSelected = selectedBadges.some(b => b.id === badge.id);
              return (
                <TouchableOpacity 
                  key={badge.id} 
                  style={[
                    styles.badgeItem,
                    { borderColor: colors.border },
                    isSelected && { borderColor: colors.primary, backgroundColor: colors.primary + '10' }
                  ]}
                  onPress={() => handleSelectBadge(badge)}
                >
                  <Image source={{ uri: badge.imageUrl }} style={styles.badgeImage} />
                  <View style={styles.badgeInfo}>
                    <Text style={[styles.badgeName, { color: colors.text }]}>{badge.name}</Text>
                    <Text style={[styles.badgeDescription, { color: colors.secondary }]}>{badge.description}</Text>
                  </View>
                  {isSelected && <Text style={[styles.checkIcon, { color: colors.primary }]}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.border }]}
              onPress={onClose}
            >
              <Text style={[styles.cancelButtonText, { color: colors.secondary }]}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>저장</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  badgeList: {
    maxHeight: '70%',
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  badgeImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '600',
  },
  badgeDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  checkIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {},
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {},
  saveButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
});
