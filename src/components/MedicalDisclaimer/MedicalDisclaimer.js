import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Linking,
  TouchableOpacity,
  Image,
} from 'react-native';
import {colors, family, size, WP, HP, appIcons} from '../../utilities';

const SOURCES = [
  {label: 'American Diabetes Association', url: 'https://diabetes.org'},
  {label: 'World Health Organization', url: 'https://www.who.int'},
  {label: 'Mayo Clinic – Diabetes Guidelines', url: 'https://www.mayoclinic.org'},
];

const DISCLAIMER_TEXT =
  'SugarCare provides educational health information only and is not a medical diagnosis or treatment. Always consult a qualified healthcare professional before making medical decisions.';

export function MedicalDisclaimer() {
  const openLink = url => {
    Linking.openURL(url).catch(() => {});
  };

  return (
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
      <Text style={styles.disclaimerText}>{DISCLAIMER_TEXT}</Text>
      <Text style={styles.sourcesLabel}>Sources</Text>
      <View style={styles.sourcesRow}>
        {SOURCES.map(source => (
          <TouchableOpacity
            key={source.url}
            onPress={() => openLink(source.url)}
            activeOpacity={0.7}
            style={styles.sourceChip}>
            <Text style={styles.sourceLabel}>{source.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F6F9FF',
    borderRadius: 12,
    padding: WP('4'),
    marginTop: HP('1.5'),
    marginBottom: HP('2'),
    borderWidth: 1,
    borderColor: '#C2D3FF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: HP('1'),
  },
  iconBadge: {
    width: WP('8'),
    height: WP('8'),
    borderRadius: WP('4'),
    backgroundColor: 'rgba(66, 82, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: WP('2'),
  },
  icon: {
    width: WP('4'),
    height: WP('4'),
    tintColor: colors.p1,
  },
  title: {
    fontSize: size.small,
    fontFamily: family.inter_medium,
    fontWeight: '600',
    color: colors.b1,
  },
  disclaimerText: {
    fontSize: size.xsmall,
    fontFamily: family.inter_regular,
    color: '#475569',
    lineHeight: 20,
    marginBottom: HP('1.5'),
  },
  sourcesLabel: {
    fontSize: size.xsmall,
    fontFamily: family.inter_medium,
    color: colors.b1,
    marginBottom: HP('0.8'),
  },
  sourcesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sourceChip: {
    backgroundColor: colors.white,
    paddingHorizontal: WP('3'),
    paddingVertical: HP('0.6'),
    borderRadius: 8,
    marginRight: WP('2'),
    marginBottom: HP('0.6'),
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sourceLabel: {
    fontSize: size.tiny,
    fontFamily: family.inter_medium,
    color: colors.p1,
  },
});

export default MedicalDisclaimer;
