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
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
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
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.iconBadge}>
              <Image
                source={appIcons.info}
                style={styles.icon}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>Medical Disclaimer</Text>
          </View>
          <Text style={styles.disclaimerText}>
            SugarCare provides educational health information only and is not a
            medical diagnosis or treatment. All health insights, predictions, and
            recommendations are for informational purposes. Always consult a
            qualified healthcare professional before making medical decisions.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Medical Sources & Citations</Text>
        <Text style={styles.sectionIntro}>
          The health information in this app is based on guidelines from the
          following reputable sources. Tap to visit:
        </Text>

        {SOURCES.map(source => (
          <TouchableOpacity
            key={source.url}
            onPress={() => openLink(source.url)}
            activeOpacity={0.7}
            style={styles.sourceCard}>
            <Text style={styles.sourceLabel}>{source.label}</Text>
            <Text style={styles.sourceUrl}>{source.url}</Text>
            <Text style={styles.sourceHint}>Tap to open ↗</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.footer}>
          We recommend verifying any health information with your healthcare
          provider. These sources are provided for your reference and do not
          constitute an endorsement by SugarCare.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: WP('5'),
    paddingBottom: HP('6'),
  },
  card: {
    backgroundColor: '#F6F9FF',
    borderRadius: 12,
    padding: WP('5'),
    marginBottom: HP('3'),
    borderWidth: 1,
    borderColor: '#C2D3FF',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: HP('1.5'),
  },
  iconBadge: {
    width: WP('10'),
    height: WP('10'),
    borderRadius: WP('5'),
    backgroundColor: 'rgba(66, 82, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: WP('3'),
  },
  icon: {
    width: WP('5'),
    height: WP('5'),
    tintColor: colors.p1,
  },
  title: {
    fontSize: size.large,
    fontFamily: family.inter_medium,
    fontWeight: '600',
    color: colors.b1,
    flex: 1,
  },
  disclaimerText: {
    fontSize: size.small,
    fontFamily: family.inter_regular,
    color: '#475569',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: size.large,
    fontFamily: family.inter_medium,
    fontWeight: '600',
    color: colors.b1,
    marginBottom: HP('1'),
  },
  sectionIntro: {
    fontSize: size.small,
    fontFamily: family.inter_regular,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: HP('2'),
  },
  sourceCard: {
    backgroundColor: colors.white,
    padding: WP('4'),
    borderRadius: 12,
    marginBottom: HP('1.5'),
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sourceLabel: {
    fontSize: size.medium,
    fontFamily: family.inter_medium,
    color: colors.p1,
    marginBottom: HP('0.5'),
  },
  sourceUrl: {
    fontSize: size.xsmall,
    fontFamily: family.inter_regular,
    color: '#64748b',
  },
  sourceHint: {
    fontSize: size.tiny,
    fontFamily: family.inter_medium,
    color: colors.p1,
    marginTop: HP('0.5'),
  },
  footer: {
    fontSize: size.small,
    fontFamily: family.inter_regular,
    color: '#64748b',
    lineHeight: 20,
    marginTop: HP('2'),
  },
});

export default MedicalSources;
