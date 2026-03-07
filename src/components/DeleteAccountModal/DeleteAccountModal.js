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
  useWindowDimensions,
  Platform,
} from 'react-native';
import Modal from 'react-native-modal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  colors,
  family,
  size,
  WP,
  HP,
  showSuccess,
  showError,
} from '../../utilities';

// Matches AIConsentModal & WhatToEat for iOS/Android consistency
const cardShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  android: {elevation: 4},
});

const cardBorder = {
  borderWidth: 1,
  borderColor: 'rgba(0, 0, 0, 0.06)',
};

export function DeleteAccountModal({
  visible,
  onClose,
  onDeleted,
  onConfirmDelete,
}) {
  const [loading, setLoading] = useState(false);
  const {width} = useWindowDimensions();
  const maxWidth = Math.min(width * 0.9, 420);

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
        <View style={styles.accent} />
        <View style={styles.iconWrap}>
          <Ionicons name="warning" size={WP(8)} color={colors.r2} />
        </View>
        <Text
          style={styles.title}
          {...(Platform.OS === 'android' && {includeFontPadding: false})}>
          Delete Account
        </Text>
        <Text
          style={styles.message}
          {...(Platform.OS === 'android' && {includeFontPadding: false})}>
          This will permanently delete your account and all associated health
          data. This action cannot be undone.
        </Text>
        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
            disabled={loading}
            activeOpacity={0.85}>
            <Text
              style={styles.cancelText}
              {...(Platform.OS === 'android' && {includeFontPadding: false})}>
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.confirmButton]}
            onPress={handleConfirm}
            disabled={loading}
            activeOpacity={0.85}>
            {loading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text
                style={styles.confirmText}
                {...(Platform.OS === 'android' && {includeFontPadding: false})}>
                Delete Permanently
              </Text>
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
    borderRadius: WP(5),
    padding: WP(6),
    width: '90%',
    overflow: 'hidden',
    position: 'relative',
    ...cardShadow,
    ...cardBorder,
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: WP(1.2),
    backgroundColor: colors.r2,
  },
  iconWrap: {
    width: WP(14),
    height: WP(14),
    borderRadius: WP(7),
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: HP(2),
  },
  title: {
    fontSize: size.h4,
    fontFamily: family.inter_bold,
    color: colors.b1,
    marginBottom: HP(1.5),
    paddingRight: WP(2),
  },
  message: {
    fontSize: size.medium,
    fontFamily: family.inter_regular,
    color: colors.g1,
    lineHeight: size.medium * 1.5,
    marginBottom: HP(3),
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: HP(0.5),
  },
  button: {
    paddingVertical: HP(1.5),
    paddingHorizontal: WP(5),
    borderRadius: WP(2.5),
    minWidth: WP(28),
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.g11,
  },
  confirmButton: {
    backgroundColor: colors.r2,
    marginLeft: WP(3),
  },
  cancelText: {
    fontSize: size.medium,
    fontFamily: family.inter_medium,
    color: colors.b1,
  },
  confirmText: {
    fontSize: size.medium,
    fontFamily: family.inter_bold,
    color: colors.white,
  },
});

export default DeleteAccountModal;
