/**
 * Delete Account Modal - Apple 5.1.1(v) compliance
 * Full account deletion flow within the app
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
} from 'react-native';
import Modal from 'react-native-modal';
import {
  colors,
  family,
  size,
  WP,
  HP,
  showSuccess,
  showError,
} from '../../utilities';

export function DeleteAccountModal({
  visible,
  onClose,
  onDeleted,
  onConfirmDelete,
}) {
  const [loading, setLoading] = useState(false);
  const {width} = useWindowDimensions();
  const maxWidth = Math.min(width * 0.9, 400);

  const handleConfirm = async () => {
    if (!onConfirmDelete) return;
    setLoading(true);
    try {
      await onConfirmDelete();
      onClose?.();
      onDeleted?.();
      showSuccess('Account deleted successfully');
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Network error. Please try again.';
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!loading) onClose?.();
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={handleCancel}
      onBackButtonPress={handleCancel}
      avoidKeyboard
      useNativeDriver
      hideModalContentWhileAnimating
      style={styles.modal}>
      <View style={[styles.container, {maxWidth}]}>
        <Text style={styles.title}>Delete Account</Text>
        <Text style={styles.message}>
          This will permanently delete your account and all associated health
          data. This action cannot be undone.
        </Text>
        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
            disabled={loading}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.confirmButton]}
            onPress={handleConfirm}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.confirmText}>Delete Permanently</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: WP(6),
    width: '90%',
  },
  title: {
    fontSize: size.h5,
    fontFamily: family.inter_medium,
    fontWeight: '700',
    color: colors.b1,
    marginBottom: HP(1.5),
  },
  message: {
    fontSize: size.medium,
    fontFamily: family.inter_regular,
    color: colors.g1,
    lineHeight: 24,
    marginBottom: HP(3),
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  button: {
    paddingVertical: HP(1.2),
    paddingHorizontal: WP(4),
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.g13,
  },
  confirmButton: {
    backgroundColor: colors.r2,
  },
  cancelText: {
    fontSize: size.medium,
    fontFamily: family.inter_medium,
    color: colors.b1,
  },
  confirmText: {
    fontSize: size.medium,
    fontFamily: family.inter_medium,
    fontWeight: '600',
    color: colors.white,
  },
});

export default DeleteAccountModal;
