import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Platform,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {appIcons, colors, family, HP, size, WP} from '../../utilities';

const SugarRecordCard = ({record, empty, onPress}) => {
  if (empty || !record) {
    return (
      <View style={styles.emptyCard}>
        <View style={styles.emptyIconWrapper}>
          <Ionicons name="water-outline" size={32} color={colors.g9} />
        </View>
        <Text style={styles.emptyTitle}>No records yet</Text>
        <Text style={styles.emptySubtitle}>
          Tap "Add New Record" to log your first blood sugar reading
        </Text>
      </View>
    );
  }

  const getStatusConfig = value => {
    if (value < 70)
      return {
        label: 'Low',
        bg: colors.warning,
        light: '#FFF8E6',
        icon: 'arrow-down-circle',
      };
    if (value > 180)
      return {
        label: 'High',
        bg: colors.danger,
        light: '#FEF2F2',
        icon: 'arrow-up-circle',
      };
    return {
      label: 'Normal',
      bg: colors.gr1,
      light: '#ECFDF5',
      icon: 'checkmark-circle',
    };
  };

  const status = getStatusConfig(record.value);
  const CardWrapper = onPress ? TouchableOpacity : View;

  const metaLine = [record.tag || 'Reading', record.date, record.time]
    .filter(Boolean)
    .join(' · ');

  return (
    <CardWrapper
      style={styles.card}
      onPress={onPress}
      activeOpacity={onPress ? 0.82 : 1}>
      <View style={[styles.accentBar, {backgroundColor: status.bg}]} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.valueBlock}>
            <Image source={appIcons.bloodIcon} style={styles.bloodIcon} />
            <Text style={styles.value}>{record.value}</Text>
            <Text style={styles.unit}>mg/dL</Text>
          </View>
          <View style={[styles.statusBadge, {backgroundColor: status.bg}]}>
            <Ionicons
              name={status.icon}
              size={12}
              color={colors.white}
              style={styles.statusIcon}
            />
            <Text style={styles.statusText}>{status.label}</Text>
          </View>
        </View>
        <View style={[styles.metaRow, record.notes && styles.metaRowWithNotes]}>
          <Text style={styles.metaText} numberOfLines={1}>
            {metaLine}
          </Text>
        </View>
        {record.notes ? (
          <View style={styles.notesRow}>
            <Text style={styles.notesLabel}>Notes: </Text>
            <Text style={styles.notesText} numberOfLines={1}>
              {record.notes}
            </Text>
          </View>
        ) : null}
      </View>
    </CardWrapper>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    marginBottom: HP(1.4),
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {elevation: 3},
    }),
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  content: {
    paddingVertical: HP(1.6),
    paddingHorizontal: WP(3),
    paddingLeft: WP(4) + 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HP(0.6),
  },
  valueBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bloodIcon: {
    width: 20,
    height: 20,
    marginRight: WP(1.5),
  },
  value: {
    fontSize: 22,
    fontFamily: family.inter_bold,
    color: colors.b1,
    letterSpacing: -0.3,
  },
  unit: {
    fontSize: size.xsmall,
    fontFamily: family.inter_medium,
    color: colors.g9,
    marginLeft: 3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: WP(2),
    paddingVertical: HP(0.35),
    borderRadius: 14,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    color: colors.white,
    fontSize: size.xxsmall,
    fontFamily: family.inter_bold,
  },
  metaRow: {},
  metaRowWithNotes: {
    marginBottom: HP(0.5),
  },
  metaText: {
    fontSize: size.xxsmall,
    fontFamily: family.inter_regular,
    color: colors.g9,
  },
  notesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notesLabel: {
    fontSize: size.xxsmall,
    fontFamily: family.inter_regular,
    color: colors.g9,
    fontStyle: 'italic',
  },
  notesText: {
    flex: 1,
    fontSize: size.xxsmall,
    fontFamily: family.inter_regular,
    color: colors.g7,
    fontStyle: 'italic',
  },
  emptyCard: {
    backgroundColor: colors.g13,
    borderRadius: 14,
    paddingVertical: HP(4),
    paddingHorizontal: WP(5),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: HP(1.6),
    borderWidth: 2,
    borderColor: colors.g11,
    borderStyle: 'dashed',
  },
  emptyIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: HP(1.5),
  },
  emptyTitle: {
    fontSize: size.medium,
    fontFamily: family.inter_bold,
    color: colors.b1,
    marginBottom: HP(0.5),
  },
  emptySubtitle: {
    fontSize: size.small,
    fontFamily: family.inter_regular,
    color: colors.g9,
    textAlign: 'center',
    lineHeight: size.small * 1.45,
  },
});

export {SugarRecordCard};
