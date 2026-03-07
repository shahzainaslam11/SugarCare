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
  Image,
  Platform,
} from 'react-native';
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {appIcons, colors, family, size, WP, HP} from '../../utilities';

const AI_CONSENT_KEY = 'aiConsent';

const DISCLOSURE_TEXT =
  'When using AI-powered features (Food Scan, Predict Sugar Alert, AI Forecast, Chat), SugarCare securely transmits relevant data such as glucose readings, meal logs, food images, and chat inputs to OpenAI API services for processing. This data is used solely to generate personalized insights and is transmitted securely.';

export function AIConsentModal({visible, onAccept, onDecline}) {
  const {width} = useWindowDimensions();
  const maxWidth = Math.min(width * 0.9, 420);

  const handleAccept = () => {
    onAccept?.(); // Resolve immediately so gate doesn't block on storage
    AsyncStorage.setItem(AI_CONSENT_KEY, 'true').catch(() => {});
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
        <View style={styles.accent} />
        <View style={styles.iconWrap}>
          <Image source={appIcons.aiIcon} style={styles.icon} resizeMode="contain" />
        </View>
        <Text
          style={styles.title}
          {...(Platform.OS === 'android' && {includeFontPadding: false})}>
          AI Data Processing Disclosure
        </Text>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <Text
            style={styles.message}
            {...(Platform.OS === 'android' && {includeFontPadding: false})}>
            {DISCLOSURE_TEXT}
          </Text>
        </ScrollView>
        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleDecline}
            activeOpacity={0.85}>
            <Text
              style={styles.cancelText}
              {...(Platform.OS === 'android' && {includeFontPadding: false})}>
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.acceptButton]}
            onPress={handleAccept}
            activeOpacity={0.85}>
            <Text
              style={styles.acceptText}
              {...(Platform.OS === 'android' && {includeFontPadding: false})}>
              Agree & Continue
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export {AI_CONSENT_KEY};

// Matches WhatToEat cards for iOS/Android consistency
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
    maxHeight: '75%',
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
    backgroundColor: colors.p1,
  },
  iconWrap: {
    width: WP(14),
    height: WP(14),
    borderRadius: WP(7),
    backgroundColor: colors.p12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: HP(2),
  },
  icon: {
    width: WP(8),
    height: WP(8),
  },
  title: {
    fontSize: size.h4,
    fontFamily: family.inter_bold,
    color: colors.b1,
    marginBottom: HP(1.5),
    paddingRight: WP(2),
  },
  scroll: {
    maxHeight: HP(22),
  },
  scrollContent: {
    paddingRight: WP(2),
    paddingBottom: HP(0.5),
  },
  message: {
    fontSize: size.medium,
    fontFamily: family.inter_regular,
    color: colors.g1,
    lineHeight: size.medium * 1.5,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: HP(2.5),
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
  acceptButton: {
    backgroundColor: colors.p1,
    marginLeft: WP(3),
  },
  cancelText: {
    fontSize: size.medium,
    fontFamily: family.inter_medium,
    color: colors.b1,
  },
  acceptText: {
    fontSize: size.medium,
    fontFamily: family.inter_bold,
    color: colors.white,
  },
});

export default AIConsentModal;
