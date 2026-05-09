import React from 'react';
import {Platform, Pressable, StyleSheet, Text, View} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors, family, HP, size, WP} from '../../utilities';

const cardShadow = Platform.select({
  ios: {
    shadowColor: colors.drakBlack,
    shadowOffset: {width: 0, height: HP(0.25)},
    shadowOpacity: 0.07,
    shadowRadius: WP(3),
  },
  android: {elevation: 4},
});

const PlanCard = ({plan, selected, onPress}) => {
  const isUnavailable = plan?.price === 'Unavailable';
  const priceDisplay = plan.price || 'Loading...';

  return (
    <Pressable
      style={({pressed}) => [
        styles.card,
        selected && styles.cardSelected,
        isUnavailable && styles.cardUnavailable,
        pressed && styles.cardPressed,
      ]}
      onPress={() => onPress(plan)}>
      {selected ? <View style={styles.accentRail} pointerEvents="none" /> : null}
      <View style={styles.cardBody}>
        <View style={styles.topRow}>
          <View style={styles.titleBlock}>
            <View style={styles.radioRow}>
              <View style={[styles.selectorDot, selected && styles.selectorDotActive]} />
              <Text style={styles.planTitle} numberOfLines={2}>
                {plan.title}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.pricePill,
              isUnavailable && styles.pricePillMuted,
              selected && !isUnavailable && styles.pricePillSelected,
            ]}>
            <Text
              style={[styles.priceText, isUnavailable && styles.unavailablePrice]}
              numberOfLines={1}>
              {priceDisplay}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          {plan.bestValue ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>BEST VALUE</Text>
            </View>
          ) : null}
          <Text style={[styles.label, !plan.bestValue && styles.labelSolo]}>{plan.label}</Text>
        </View>

        <Text style={styles.description} numberOfLines={3}>
          {plan.description}
        </Text>

        <View style={styles.creditsRow}>
          <Text style={styles.creditsLabel}>Credits:</Text>
          <Text style={styles.creditsValue}>
            {typeof plan.credits === 'number' ? `${plan.credits} credits` : plan.credits}
          </Text>
        </View>

        {selected && !isUnavailable ? (
          <View style={styles.selectedFooter}>
            <Ionicons name="checkmark-circle" size={WP(4.2)} color={colors.p1} />
            <Text style={styles.selectedFooterText}>Selected</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: WP(4.5),
    marginBottom: HP(1),
    borderWidth: 1,
    borderColor: colors.g15,
    overflow: 'hidden',
    ...cardShadow,
  },
  cardUnavailable: {
    opacity: 0.88,
  },
  cardSelected: {
    borderColor: colors.p1,
    borderWidth: 2,
    backgroundColor: colors.riskCardBg,
    ...Platform.select({
      ios: {
        shadowColor: colors.p1,
        shadowOpacity: 0.14,
        shadowRadius: WP(3),
        shadowOffset: {width: 0, height: HP(0.35)},
      },
      android: {elevation: 5},
    }),
  },
  cardPressed: {
    opacity: 0.94,
    transform: [{scale: 0.992}],
  },
  accentRail: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: WP(1.1),
    backgroundColor: colors.p1,
    borderTopLeftRadius: WP(4.5),
    borderBottomLeftRadius: WP(4.5),
  },
  cardBody: {
    paddingVertical: HP(1.4),
    paddingHorizontal: WP(4),
    paddingLeft: WP(4.6),
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: WP(2),
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
    paddingRight: WP(1),
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: WP(2),
  },
  selectorDot: {
    width: WP(3.2),
    height: WP(3.2),
    borderRadius: WP(1.6),
    borderWidth: 2,
    borderColor: colors.g11,
    marginTop: HP(0.35),
  },
  selectorDotActive: {
    borderColor: colors.p1,
    backgroundColor: colors.p1,
  },
  planTitle: {
    flex: 1,
    fontSize: size.large,
    fontFamily: family.inter_bold,
    color: colors.b4,
    lineHeight: size.large + 4,
  },
  pricePill: {
    flexShrink: 0,
    maxWidth: '42%',
    backgroundColor: colors.riskCardBg,
    borderWidth: 1,
    borderColor: colors.riskCardBorder,
    paddingVertical: HP(0.45),
    paddingHorizontal: WP(2.8),
    borderRadius: WP(10),
    alignSelf: 'flex-start',
  },
  pricePillMuted: {
    backgroundColor: colors.g13,
    borderColor: colors.g15,
  },
  pricePillSelected: {
    backgroundColor: colors.white,
    borderColor: colors.p1,
  },
  priceText: {
    fontSize: size.medium,
    fontFamily: family.inter_bold,
    color: colors.p1,
    textAlign: 'right',
  },
  unavailablePrice: {
    color: colors.g9,
    fontFamily: family.inter_medium,
    fontSize: size.xsmall,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: WP(2),
    marginTop: HP(0.85),
  },
  labelSolo: {
    marginTop: 0,
  },
  label: {
    color: colors.p1,
    fontFamily: family.inter_medium,
    fontSize: size.xtiny,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  badge: {
    backgroundColor: colors.gr1,
    paddingHorizontal: WP(2.2),
    paddingVertical: HP(0.32),
    borderRadius: WP(8),
  },
  badgeText: {
    color: colors.white,
    fontSize: size.xxtiny,
    fontFamily: family.inter_bold,
    letterSpacing: 0.5,
  },
  description: {
    marginTop: HP(0.65),
    color: colors.g3,
    fontSize: size.xsmall,
    fontFamily: family.inter_regular,
    lineHeight: size.xsmall + 5,
  },
  creditsRow: {
    marginTop: HP(0.8),
    flexDirection: 'row',
    alignItems: 'center',
    gap: WP(1.5),
  },
  creditsLabel: {
    color: colors.g9,
    fontSize: size.xtiny,
    fontFamily: family.inter_medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  creditsValue: {
    color: colors.p1,
    fontSize: size.small,
    fontFamily: family.inter_bold,
  },
  selectedFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WP(1.5),
    marginTop: HP(1),
    paddingTop: HP(0.85),
    borderTopWidth: 1,
    borderTopColor: colors.riskCardBorder,
  },
  selectedFooterText: {
    fontSize: size.xtiny,
    fontFamily: family.inter_bold,
    color: colors.p1,
  },
});

export default PlanCard;
