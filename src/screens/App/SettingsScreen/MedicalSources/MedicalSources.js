import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Linking,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Header} from '../../../../components';
import {colors, family, size, WP, HP, appIcons} from '../../../../utilities';

const SOURCES = [
  {label: 'American Diabetes Association', url: 'https://diabetes.org'},
  {label: 'World Health Organization', url: 'https://www.who.int'},
  {label: 'Mayo Clinic – Diabetes Guidelines', url: 'https://www.mayoclinic.org'},
];

const MedicalSources = () => {
  const navigation = useNavigation();

  const openLink = url => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Sources & Medical Information"
        onPress={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.disclaimerCard}>
          <View style={styles.disclaimerAccent} />
          <View style={styles.iconBadge}>
            <Image
              source={appIcons.info}
              style={styles.icon}
              resizeMode="contain"
            />
          </View>
          <View style={styles.disclaimerBody}>
            <Text
              style={styles.disclaimerTitle}
              {...(Platform.OS === 'android' && {includeFontPadding: false})}>
              Medical Disclaimer
            </Text>
            <Text
              style={styles.disclaimerText}
              {...(Platform.OS === 'android' && {includeFontPadding: false})}>
              SugarCare provides educational health information only and is not a
              medical diagnosis or treatment. All health insights, predictions,
              and recommendations are for informational purposes. Always consult a
              qualified healthcare professional before making medical decisions.
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionAccent} />
          <Text
            style={styles.sectionTitle}
            {...(Platform.OS === 'android' && {includeFontPadding: false})}>
            Medical Sources & Citations
          </Text>
        </View>
        <Text
          style={styles.sectionIntro}
          {...(Platform.OS === 'android' && {includeFontPadding: false})}>
          Based on guidelines from these reputable sources. Tap to open:
        </Text>

        {SOURCES.map(source => (
          <TouchableOpacity
            key={source.url}
            onPress={() => openLink(source.url)}
            activeOpacity={0.85}
            style={styles.sourceCard}>
            <View style={styles.sourceAccent} />
            <View style={styles.sourceContent}>
              <Text
                style={styles.sourceLabel}
                {...(Platform.OS === 'android' && {includeFontPadding: false})}>
                {source.label}
              </Text>
              <Text
                style={styles.sourceUrl}
                {...(Platform.OS === 'android' && {includeFontPadding: false})}>
                {source.url}
              </Text>
            </View>
            <Ionicons
              name="open-outline"
              size={18}
              color={colors.p1}
              style={styles.sourceChevron}
            />
          </TouchableOpacity>
        ))}

        <View style={styles.footerCard}>
          <Text
            style={styles.footer}
            {...(Platform.OS === 'android' && {includeFontPadding: false})}>
            Verify health information with your healthcare provider. Sources are
            for reference and do not constitute endorsement by SugarCare.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const cardShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  android: {elevation: 2},
});

const cardBorder = {
  borderWidth: 1,
  borderColor: 'rgba(0, 0, 0, 0.05)',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    paddingHorizontal: WP(4.5),
    paddingBottom: HP(4),
  },
  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.p12,
    borderRadius: WP(3),
    padding: WP(3.5),
    marginTop: HP(1.5),
    marginBottom: HP(2),
    overflow: 'hidden',
    position: 'relative',
    ...cardShadow,
    ...cardBorder,
  },
  disclaimerAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.p1,
    borderTopLeftRadius: WP(3),
    borderBottomLeftRadius: WP(3),
  },
  iconBadge: {
    width: WP(9),
    height: WP(9),
    borderRadius: WP(4.5),
    backgroundColor: 'rgba(66, 82, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: WP(2.5),
  },
  icon: {
    width: WP(4.5),
    height: WP(4.5),
    tintColor: colors.p1,
  },
  disclaimerBody: {
    flex: 1,
  },
  disclaimerTitle: {
    fontSize: size.h6,
    fontFamily: family.inter_bold,
    color: colors.b1,
    marginBottom: HP(0.4),
  },
  disclaimerText: {
    fontSize: size.small,
    fontFamily: family.inter_regular,
    color: colors.g1,
    lineHeight: size.small * 1.45,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: HP(0.6),
  },
  sectionAccent: {
    width: 3,
    height: HP(1.8),
    backgroundColor: colors.p1,
    borderRadius: 2,
    marginRight: WP(2),
  },
  sectionTitle: {
    fontSize: size.medium,
    fontFamily: family.inter_bold,
    color: colors.b1,
    flex: 1,
  },
  sectionIntro: {
    fontSize: size.small,
    fontFamily: family.inter_regular,
    color: colors.g9,
    lineHeight: size.small * 1.4,
    marginBottom: HP(1.8),
  },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: HP(1.4),
    paddingHorizontal: WP(3),
    paddingLeft: 14,
    borderRadius: WP(3),
    marginBottom: HP(1.2),
    overflow: 'hidden',
    position: 'relative',
    ...cardShadow,
    ...cardBorder,
  },
  sourceAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.p1,
    borderTopLeftRadius: WP(3),
    borderBottomLeftRadius: WP(3),
  },
  sourceContent: {
    flex: 1,
  },
  sourceLabel: {
    fontSize: size.small,
    fontFamily: family.inter_bold,
    color: colors.b1,
    marginBottom: 1,
  },
  sourceUrl: {
    fontSize: size.xxsmall,
    fontFamily: family.inter_regular,
    color: colors.g9,
  },
  sourceChevron: {
    marginLeft: WP(1.5),
  },
  footerCard: {
    backgroundColor: colors.g13,
    borderRadius: WP(2.5),
    padding: WP(3),
    marginTop: HP(0.8),
  },
  footer: {
    fontSize: size.xxsmall,
    fontFamily: family.inter_regular,
    color: colors.g9,
    lineHeight: size.xxsmall * 1.5,
    textAlign: 'center',
  },
});

export default MedicalSources;
