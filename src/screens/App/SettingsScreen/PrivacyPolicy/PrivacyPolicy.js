import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Linking,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Header} from '../../../../components';
import {colors, family, HP, size, WP} from '../../../../utilities';
import {useNavigation} from '@react-navigation/native';

const SECTIONS = [
  {num: 1, title: 'Information We Collect', text: 'We collect data you provide directly, such as your name, email address, and health information, including blood sugar readings, meal descriptions, and activity levels. When you use the food scanner, we process images you capture. We may also gather data from your device, including usage patterns and preferences.'},
  {num: 2, title: 'How We Use Your Information', text: "Your data helps us personalize your experience, improve our services, and provide you with tailored health insights and AI-based predictions. We may also use your information for research and development purposes, ensuring we continue to enhance our app's features."},
  {num: 3, title: 'Third-Party AI Services & Data Sharing', text: "To provide AI features (sugar predictions, meal recommendations, food analysis, risk forecasting, and chat assistance), we send certain data to our secure servers (sugarcare.cloud) and may use third-party AI services to process it. Our backend servers and any AI service providers we use are bound by contracts to protect your data. We do not sell or rent your data. Before we send your data to AI services, we obtain your explicit permission. You can decline and continue using the app without AI features."},
  {num: 4, title: 'Data Protection', text: 'We implement robust security measures to protect your information from unauthorized access, loss, or misuse. Your data is encrypted and stored securely.'},
  {num: 5, title: 'Sharing Your Information', text: 'We do not sell or rent your personal information to third parties. We may share your data with trusted partners who assist us in operating our app, provided they agree to keep your information confidential.'},
  {num: 6, title: 'Your Rights', text: 'You have the right to access, correct, or delete your personal information at any time. You can also opt-out of certain data collection practices.'},
  {num: 7, title: 'Changes to This Policy', text: 'We may update this privacy policy periodically. We will notify you of any significant changes via the app or email.'},
];

const PrivacyPolicy = () => {
  const navigation = useNavigation();

  const openEmail = () => {
    Linking.openURL('mailto:info@sugarcare.cloud');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header title="Privacy Policy" onPress={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="shield-checkmark" size={WP(8)} color={colors.p1} />
          </View>
          <Text
            style={styles.heroTitle}
            {...(Platform.OS === 'android' && {includeFontPadding: false})}>
            Your Privacy Matters
          </Text>
          <Text
            style={styles.heroSubtitle}
            {...(Platform.OS === 'android' && {includeFontPadding: false})}>
            We prioritize your privacy. This policy outlines how we collect,
            use, and protect your personal information while using our app.
          </Text>
        </View>

        <Text
          style={styles.intro}
          {...(Platform.OS === 'android' && {includeFontPadding: false})}>
          Our app utilizes AI features to track blood sugar levels and provide
          health insights. Here's how we handle your data:
        </Text>

        {SECTIONS.map(section => (
          <View key={section.num} style={styles.sectionCard}>
            <View style={styles.sectionAccent} />
            <View style={styles.sectionNumberWrap}>
              <Text
                style={styles.sectionNumber}
                {...(Platform.OS === 'android' && {includeFontPadding: false})}>
                {section.num}
              </Text>
            </View>
            <Text
              style={styles.sectionTitle}
              {...(Platform.OS === 'android' && {includeFontPadding: false})}>
              {section.title}
            </Text>
            <Text
              style={styles.sectionText}
              {...(Platform.OS === 'android' && {includeFontPadding: false})}>
              {section.text}
            </Text>
          </View>
        ))}

        <TouchableOpacity
          style={styles.contactCard}
          onPress={openEmail}
          activeOpacity={0.85}>
          <View style={styles.contactAccent} />
          <Ionicons
            name="mail-open-outline"
            size={WP(5)}
            color={colors.p1}
            style={styles.contactIcon}
          />
          <View style={styles.contactContent}>
            <Text
              style={styles.contactTitle}
              {...(Platform.OS === 'android' && {includeFontPadding: false})}>
              Questions? Contact Us
            </Text>
            <Text
              style={styles.contactEmail}
              {...(Platform.OS === 'android' && {includeFontPadding: false})}>
              info@sugarcare.cloud
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={WP(4)} color={colors.g9} />
        </TouchableOpacity>

        <Text
          style={styles.footer}
          {...(Platform.OS === 'android' && {includeFontPadding: false})}>
          By using our app, you consent to our privacy policy.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

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
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    paddingHorizontal: WP(4),
    paddingBottom: HP(3),
  },
  heroCard: {
    backgroundColor: colors.p12,
    borderRadius: WP(3),
    padding: WP(3.5),
    marginTop: HP(1),
    marginBottom: HP(1.2),
    alignItems: 'center',
    ...cardShadow,
    ...cardBorder,
  },
  heroIconWrap: {
    width: WP(14),
    height: WP(14),
    borderRadius: WP(7),
    backgroundColor: 'rgba(66, 82, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: HP(1),
  },
  heroTitle: {
    fontSize: size.h5,
    fontFamily: family.inter_bold,
    color: colors.b1,
    marginBottom: HP(0.5),
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: size.small,
    fontFamily: family.inter_regular,
    color: colors.g1,
    lineHeight: size.small * 1.4,
    textAlign: 'center',
  },
  intro: {
    fontSize: size.small,
    fontFamily: family.inter_medium,
    color: colors.g9,
    lineHeight: size.small * 1.4,
    marginBottom: HP(1.5),
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: WP(3),
    padding: WP(3.5),
    paddingLeft: WP(4.5),
    marginBottom: HP(1.2),
    overflow: 'hidden',
    position: 'relative',
    ...cardShadow,
    ...cardBorder,
  },
  sectionAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: WP(1.2),
    backgroundColor: colors.p1,
  },
  sectionNumberWrap: {
    width: WP(6),
    height: WP(6),
    borderRadius: WP(3),
    backgroundColor: colors.p1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: HP(0.5),
  },
  sectionNumber: {
    fontSize: size.tiny,
    fontFamily: family.inter_bold,
    color: colors.white,
  },
  sectionTitle: {
    fontSize: size.small,
    fontFamily: family.inter_bold,
    color: colors.b1,
    marginBottom: HP(0.5),
  },
  sectionText: {
    fontSize: size.xsmall,
    fontFamily: family.inter_regular,
    color: colors.g1,
    lineHeight: size.xsmall * 1.4,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: WP(3),
    padding: WP(3.5),
    paddingLeft: WP(4.5),
    marginTop: HP(0.5),
    overflow: 'hidden',
    position: 'relative',
    ...cardShadow,
    ...cardBorder,
  },
  contactAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: WP(1.2),
    backgroundColor: colors.p1,
  },
  contactIcon: {
    marginRight: WP(2),
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: size.small,
    fontFamily: family.inter_bold,
    color: colors.b1,
    marginBottom: HP(0.2),
  },
  contactEmail: {
    fontSize: size.xsmall,
    fontFamily: family.inter_regular,
    color: colors.p1,
  },
  footer: {
    fontSize: size.xsmall,
    fontFamily: family.inter_regular,
    color: colors.g9,
    lineHeight: size.xsmall * 1.4,
    marginTop: HP(1),
    textAlign: 'center',
  },
});

export default PrivacyPolicy;
