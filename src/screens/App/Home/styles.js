import {StyleSheet, Platform} from 'react-native';
import {colors, family, HP, WP, size} from '../../../utilities';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.g13,
  },
  headerWrapper: {
    width: '100%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: WP(4),
    paddingTop: HP(1.5),
    paddingBottom: HP(2.5),
    // minHeight: HP(5),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    // flex: 1,
    // minWidth: 0,
  },
  iconButton: {
    padding: WP(1),
    flexShrink: 0,
  },
  menuIconWrap: {
    width: WP(10),
    height: HP(5),
    borderRadius: WP(5),
    backgroundColor: colors.p1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIconWrap: {
    width: WP(10),
    height: HP(5),
    borderRadius: WP(5),
    backgroundColor: colors.p1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: -HP(0.5),
    right: -WP(1),
    minWidth: WP(4),
    height: HP(2),
    borderRadius: WP(2),
    backgroundColor: colors.red,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: WP(1),
  },
  bellBadgeText: {
    color: colors.white,
    fontSize: size.xtiny,
    fontFamily: family.inter_medium,
    fontWeight: 'bold',
  },
  bellIcon: {
    width: WP(5),
    height: HP(5),
    tintColor: colors.white,
  },
  greetingBlock: {
    marginLeft: WP(3),
    // flex: 1,
    justifyContent: 'center',
    // minWidth: 0,
  },
  greeting: {
    fontSize: size.small,
    fontFamily: family.inter_regular,
    color: colors.g1,
    marginBottom: HP(0.25),
    lineHeight: size.normal,
  },
  title: {
    fontSize: size.xlarge,
    fontFamily: family.inter_bold,
    color: colors.b1,
    letterSpacing: -0.3,
    lineHeight: size.h3,
    paddingTop: HP(0.25),
  },
  sectionLabel: {
    fontSize: size.xtiny,
    fontFamily: family.inter_medium,
    color: colors.g9,
    marginTop: HP(2.5),
    marginBottom: HP(1),
    marginLeft: WP(0.5),
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionLabelFirst: {
    marginTop: HP(1),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: WP(2),
    paddingTop: HP(1.5),
    paddingBottom: HP(6),
  },

  // Action buttons
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: HP(2),
    paddingHorizontal: WP(0.5),
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: HP(1.6),
    paddingHorizontal: WP(1.5),
    borderRadius: WP(3.5),
    backgroundColor: colors.white,
    minWidth: 0,
    marginHorizontal: WP(1.2),
    borderWidth: 1,
    borderColor: colors.g15,
    ...Platform.select({
      ios: {
        shadowColor: colors.drakBlack,
        shadowOffset: {width: 0, height: HP(0.12)},
        shadowOpacity: 0.04,
        shadowRadius: WP(1.5),
      },
      android: {elevation: 2},
    }),
  },
  actionIconWrap: {
    width: WP(11),
    height: HP(5.5),
    borderRadius: WP(5.5),
    backgroundColor: colors.p6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: HP(0.8),
  },
  actionIcon: {
    width: WP(6),
    height: WP(6),
    tintColor: colors.p1,
  },
  actionText: {
    fontSize: size.tiny,
    fontFamily: family.inter_medium,
    color: colors.b4,
    textAlign: 'center',
  },

  // Spike card
  spikeCard: {
    backgroundColor: colors.spikeCardBg,
    borderRadius: WP(4),
    marginBottom: HP(1.2),
    overflow: 'hidden',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.spikeCardBorder,
    ...Platform.select({
      ios: {
        shadowColor: colors.drakBlack,
        shadowOffset: {width: 0, height: HP(0.25)},
        shadowOpacity: 0.05,
        shadowRadius: WP(1.5),
      },
      android: {elevation: 3},
    }),
  },
  spikeAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: WP(1),
    backgroundColor: colors.warning,
    borderTopLeftRadius: WP(3.5),
    borderBottomLeftRadius: WP(3.5),
  },
  spikeContent: {
    flex: 1,
    paddingVertical: HP(1.2),
    paddingHorizontal: WP(3),
    paddingLeft: WP(3.8),
  },
  spikeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: HP(0.5),
  },
  spikeIcon: {
    width: WP(5),
    height: WP(5),
    marginRight: WP(1.5),
    tintColor: colors.warning,
  },
  spikeTitle: {
    fontSize: size.small,
    fontFamily: family.inter_bold,
    color: colors.b1,
  },
  spikeDescription: {
    fontSize: size.xtiny,
    fontFamily: family.inter_regular,
    color: colors.g3,
    lineHeight: size.large,
    marginBottom: HP(0.6),
  },
  spikeCta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spikeCtaText: {
    fontSize: size.xtiny,
    fontFamily: family.inter_medium,
    color: colors.p1,
  },
  ctaChevron: {
    marginLeft: WP(1),
  },

  // Risk card
  riskCard: {
    backgroundColor: colors.riskCardBg,
    borderRadius: WP(4),
    marginBottom: HP(1.2),
    overflow: 'hidden',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.riskCardBorder,
    ...Platform.select({
      ios: {
        shadowColor: colors.drakBlack,
        shadowOffset: {width: 0, height: HP(0.25)},
        shadowOpacity: 0.05,
        shadowRadius: WP(1.5),
      },
      android: {elevation: 3},
    }),
  },
  riskAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: WP(1.2),
    borderTopLeftRadius: WP(4),
    borderBottomLeftRadius: WP(4),
  },
  riskContent: {
    flex: 1,
    paddingVertical: HP(1.2),
    paddingHorizontal: WP(3),
    paddingLeft: WP(3.8),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HP(0.5),
  },
  cardTitle: {
    fontSize: size.medium,
    fontFamily: family.inter_bold,
    color: colors.b1,
  },
  sparklesIcon: {
    width: WP(5),
    height: WP(5),
  },
  riskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: HP(0.8),
  },
  lastChecked: {
    fontSize: size.xtiny,
    fontFamily: family.inter_regular,
    color: colors.g9,
  },
  safeBadge: {
    backgroundColor: colors.safeBadgeBg,
    paddingHorizontal: WP(3),
    paddingVertical: HP(0.5),
    borderRadius: WP(5),
    borderWidth: 1,
    borderColor: colors.safeBadgeBorder,
  },
  safeText: {
    color: colors.safeBadgeText,
    fontSize: size.xtiny,
    fontFamily: family.inter_bold,
    letterSpacing: 0.3,
  },

  // Meal card
  mealCard: {
    backgroundColor: colors.mealCardBg,
    borderRadius: WP(4),
    marginBottom: HP(2),
    overflow: 'hidden',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.mealCardBorder,
    ...Platform.select({
      ios: {
        shadowColor: colors.drakBlack,
        shadowOffset: {width: 0, height: HP(0.25)},
        shadowOpacity: 0.05,
        shadowRadius: WP(1.5),
      },
      android: {elevation: 3},
    }),
  },
  mealAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: WP(1.2),
    borderTopLeftRadius: WP(4),
    borderBottomLeftRadius: WP(4),
  },
  mealContent: {
    flex: 1,
    paddingVertical: HP(1.2),
    paddingHorizontal: WP(3),
    paddingLeft: WP(3.8),
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HP(1),
  },
  mealTitle: {
    fontSize: size.small,
    fontFamily: family.inter_bold,
    color: colors.b1,
  },
  viewAllText: {
    fontSize: size.xtiny,
    fontFamily: family.inter_medium,
    color: colors.p1,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  mealImage: {
    width: WP(20),
    height: WP(20),
    borderRadius: WP(3),
    marginRight: WP(3),
    backgroundColor: colors.white,
    ...Platform.select({
      ios: {
        shadowColor: colors.drakBlack,
        shadowOffset: {width: 0, height: HP(0.25)},
        shadowOpacity: 0.06,
        shadowRadius: WP(1.5),
      },
      android: {elevation: 2},
    }),
  },
  mealDetails: {
    flex: 1,
  },
  mealName: {
    fontSize: size.small,
    fontFamily: family.inter_medium,
    color: colors.b1,
    marginBottom: HP(0.4),
  },
  mealDesc: {
    fontSize: size.xtiny,
    fontFamily: family.inter_regular,
    color: colors.g3,
    marginBottom: HP(0.8),
  },
  nutritionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  nutritionBadge: {
    paddingHorizontal: WP(2.2),
    paddingVertical: HP(0.4),
    borderRadius: WP(2.5),
    marginRight: WP(1.5),
    marginBottom: HP(0.5),
  },
  nutritionBadgeCarbs: {
    backgroundColor: colors.nutritionCarbsBg,
  },
  nutritionBadgeProtein: {
    backgroundColor: colors.nutritionProteinBg,
  },
  nutritionBadgeFiber: {
    backgroundColor: colors.nutritionFiberBg,
  },
  nutritionText: {
    fontSize: size.xtiny,
    fontFamily: family.inter_medium,
    color: colors.b4,
  },
});

export default styles;
