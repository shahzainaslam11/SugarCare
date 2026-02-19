import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Linking,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Header} from '../../../../components';
import {colors, family, HP, size, WP} from '../../../../utilities';
import {useNavigation} from '@react-navigation/native';

const PrivacyPolicy = () => {
  const navigation = useNavigation();

  const openEmail = () => {
    Linking.openURL('mailto:info@sugarcare.cloud');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header title="Privacy Policy" onPress={() => navigation.goBack()} />

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          We prioritize your privacy. This policy outlines how we collect, use,
          and protect your personal information while using our app, which
          utilizes AI features to track blood sugar levels and provide health
          insights.
        </Text>

        {/* Section 1 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Information We Collect:</Text>
          <Text style={styles.sectionText}>
            We collect data you provide directly, such as your name, email
            address, and health information, including blood sugar readings,
            meal descriptions, and activity levels. When you use the food
            scanner, we process images you capture. We may also gather data from
            your device, including usage patterns and preferences.
          </Text>
        </View>

        {/* Section 2 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            2. How We Use Your Information:
          </Text>
          <Text style={styles.sectionText}>
            Your data helps us personalize your experience, improve our
            services, and provide you with tailored health insights and AI-based
            predictions. We may also
            use your information for research and development purposes, ensuring
            we continue to enhance our app’s features.
          </Text>
        </View>

        {/* Section 3: Third-Party AI */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            3. Third-Party AI Services & Data Sharing:
          </Text>
          <Text style={styles.sectionText}>
            To provide AI features (sugar predictions, meal recommendations,
            food analysis, risk forecasting, and chat assistance), we send
            certain data to our secure servers (sugarcare.cloud) and may use
            third-party AI services to process it.
          </Text>
          <Text style={styles.sectionText}>
            <Text style={styles.boldText}>Data sent for AI processing:</Text>{' '}
            Blood sugar readings, meal descriptions, food images, activity
            levels, chat messages, and other health-related inputs you provide.
          </Text>
          <Text style={styles.sectionText}>
            <Text style={styles.boldText}>Who receives the data:</Text> Our
            backend servers and any AI service providers we use. These providers
            are bound by contracts to protect your data and use it only to
            deliver our services. We do not sell or rent your data.
          </Text>
          <Text style={styles.sectionText}>
            <Text style={styles.boldText}>Your consent:</Text> Before we send
            your data to AI services, we obtain your explicit permission. You
            can decline and continue using the app without AI features.
          </Text>
        </View>

        {/* Section 4 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Data Protection:</Text>
          <Text style={styles.sectionText}>
            We implement robust security measures to protect your information
            from unauthorized access, loss, or misuse. Your data is encrypted
            and stored securely.
          </Text>
        </View>

        {/* Section 5 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Sharing Your Information:</Text>
          <Text style={styles.sectionText}>
            We do not sell or rent your personal information to third parties.
            We may share your data with trusted partners who assist us in
            operating our app, provided they agree to keep your information
            confidential.
          </Text>
        </View>

        {/* Section 6 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Your Rights:</Text>
          <Text style={styles.sectionText}>
            You have the right to access, correct, or delete your personal
            information at any time. You can also opt-out of certain data
            collection practices.
          </Text>
        </View>

        {/* Section 7 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Changes to This Policy:</Text>
          <Text style={styles.sectionText}>
            We may update this privacy policy periodically. We will notify you
            of any significant changes via the app or email.
          </Text>
        </View>

        {/* Contact */}
        <Text style={styles.footer}>
          By using our app, you consent to our privacy policy. If you have any
          questions or concerns, please contact us at{' '}
          <Text style={styles.emailLink} onPress={openEmail}>
            info@sugarcare.cloud
          </Text>
          .
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white || '#f5f5f5',
  },
  scrollContent: {
    padding: WP(5),
    paddingBottom: HP(6),
  },
  intro: {
    fontSize: size.medium,
    fontFamily: family.inter_medium,
    color: colors.g1 || '#555',
    lineHeight: WP(5.8),
    marginBottom: HP(3),
  },
  section: {
    marginBottom: HP(3),
  },
  sectionTitle: {
    fontSize: size.large,
    fontFamily: family.inter_medium,
    fontWeight: 'bold',
    color: colors.textDark || '#222',
    marginBottom: HP(1),
  },
  sectionText: {
    fontSize: size.small,
    fontFamily: family.inter_medium,
    color: colors.textGray || '#555',
    lineHeight: WP(5.8),
  },
  boldText: {
    fontWeight: '600',
    color: colors.b1 || '#333',
  },
  footer: {
    fontSize: size.small,
    fontFamily: family.inter_medium,
    color: colors.g1 || '#555',
    lineHeight: WP(5.8),
    marginTop: HP(4),
  },
  emailLink: {
    fontSize: size.small,
    fontFamily: family.inter_medium,
    color: colors.p1 || '#007AFF',
    textDecorationLine: 'underline',
  },
});

export default PrivacyPolicy;
