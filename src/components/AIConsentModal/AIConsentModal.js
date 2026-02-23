/**
 * AI Data Processing Disclosure - Apple 5.1.1 & 5.1.2 compliance
 * Shown before first use of any AI feature
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {colors, family, size, WP, HP} from '../../utilities';

const AI_CONSENT_KEY = 'aiConsent';

const DISCLOSURE_TEXT =
  'When using AI-powered features (Food Scan, Predict Sugar Alert, AI Forecast, Chat), SugarCare securely transmits relevant data such as glucose readings, meal logs, food images, and chat inputs to OpenAI API services for processing. This data is used solely to generate personalized insights and is transmitted securely.';

export function AIConsentModal({visible, onAccept, onDecline}) {
  const {width} = useWindowDimensions();
  const maxWidth = Math.min(width * 0.9, 420);

  const handleAccept = async () => {
    try {
      await AsyncStorage.setItem(AI_CONSENT_KEY, 'true');
      onAccept?.();
    } catch (e) {
      onAccept?.();
    }
  };

  const handleDecline = () => {
    onDecline?.();
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={handleDecline}
      onBackButtonPress={handleDecline}
      avoidKeyboard
      useNativeDriver
      hideModalContentWhileAnimating
      style={styles.modal}>
      <View style={[styles.container, {maxWidth}]}>
        <Text style={styles.title}>AI Data Processing Disclosure</Text>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.message}>{DISCLOSURE_TEXT}</Text>
        </ScrollView>
        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleDecline}
            activeOpacity={0.8}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.acceptButton]}
            onPress={handleAccept}
            activeOpacity={0.8}>
            <Text style={styles.acceptText}>Agree & Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export {AI_CONSENT_KEY};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: WP(5),
    width: '90%',
    maxHeight: '70%',
  },
  title: {
    fontSize: size.h5,
    fontFamily: family.inter_medium,
    fontWeight: '700',
    color: colors.b1,
    marginBottom: HP(1.5),
  },
  scroll: {
    maxHeight: 160,
  },
  scrollContent: {
    paddingRight: 4,
  },
  message: {
    fontSize: size.medium,
    fontFamily: family.inter_regular,
    color: colors.g1,
    lineHeight: 24,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
    marginTop: HP(2),
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
  acceptButton: {
    backgroundColor: colors.p1,
  },
  cancelText: {
    fontSize: size.medium,
    fontFamily: family.inter_medium,
    color: colors.b1,
  },
  acceptText: {
    fontSize: size.medium,
    fontFamily: family.inter_medium,
    fontWeight: '600',
    color: colors.white,
  },
});

export default AIConsentModal;
