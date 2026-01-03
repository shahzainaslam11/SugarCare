// src/screens/Home/styles.js

import {StyleSheet} from 'react-native';
import {colors, family, HP, size, WP} from '../../../utilities';
import {Fonts} from '../../../assets/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },

  scrollView: {
    flex: 1,
    paddingHorizontal: WP(4),
    paddingTop: HP(2),
  },

  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: HP(3),
  },
  actionButton: {
    alignItems: 'center',
    width: WP(28),
    borderWidth: 1,
    padding: WP(3),
    borderRadius: WP(3),
    borderColor: '#eee',
    // backgroundColor: '#fafafa',
  },
  actionIcon: {
    width: WP(8),
    height: WP(8),
    marginBottom: HP(1),
  },
  actionText: {
    fontSize: size.small,
    fontFamily: Fonts.interMedium,
    color: '#333',
    textAlign: 'center',
  },

  spikeCard: {
    backgroundColor: '#fff',
    borderRadius: WP(4),
    padding: WP(3.5),
    marginBottom: HP(1),
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  spikeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HP(1),
  },
  spikeTitle: {
    fontSize: size.medium,
    fontFamily: Fonts.interMedium,
    color: colors.b1,
    fontWeight: '600',
  },

  spikeDescription: {
    fontSize: size.small,
    fontFamily: Fonts.interRegular,
    color: '#555',
    lineHeight: HP(2.4),
    marginBottom: HP(1),
  },

  // AI Risk Forecasting Card
  riskCard: {
    backgroundColor: '#fff',
    borderRadius: WP(4),
    padding: WP(5),
    marginBottom: HP(1),
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HP(1),
  },
  cardTitle: {
    fontSize: size.medium,
    fontFamily: Fonts.interMedium,
    color: colors.b1,
    fontWeight: '600',
  },

  lastChecked: {
    fontSize: size.xsmall,
    fontFamily: Fonts.interRegular,
    color: '#777',
    marginBottom: HP(1.5),
  },
  riskLevelContainer: {
    // flexDirection changed to column for label and badge stacking
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: HP(1),
  },
  riskLabel: {
    fontSize: size.small,
    fontFamily: Fonts.interMedium,
    color: '#555',
    marginBottom: HP(1),
  },
  safeBadge: {
    backgroundColor: '#d4edda',
    alignSelf: 'flex-start',
    paddingHorizontal: WP(4),
    paddingVertical: HP(1),
    borderRadius: 30,
    marginBottom: HP(2),
  },
  safeText: {
    color: '#09511AFF',
    fontSize: size.small,
    fontFamily: Fonts.interMedium,
  },

  // Suggested Meal Card
  mealCard: {
    backgroundColor: '#fff',
    borderRadius: WP(4),
    padding: WP(5),
    marginBottom: HP(2),
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HP(2),
  },
  mealTitle: {
    fontSize: size.medium,
    fontFamily: Fonts.interMedium,
    color: colors.b1,
    fontWeight: '600',
  },
  viewAllText: {
    fontSize: size.medium,
    fontFamily: Fonts.interMedium,
    color: colors.p1,
    fontWeight: '600',
  },
  mealContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  mealImage: {
    width: WP(20),
    height: WP(20),
    borderRadius: WP(3),
    marginRight: WP(4),
  },
  mealDetails: {
    flex: 1,
  },
  mealName: {
    fontSize: size.normal,
    fontFamily: Fonts.interSemiBold,
    color: '#000',
    marginBottom: HP(0.8),
  },
  mealDesc: {
    fontSize: size.xsmall,
    fontFamily: Fonts.interRegular,
    color: '#555',
    lineHeight: HP(2.2),
    marginBottom: HP(1.5),
  },
  nutritionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: HP(0.5),
  },
  nutritionBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: WP(3),
    paddingVertical: HP(0.8),
    borderRadius: 30,
    marginRight: WP(2),
    marginBottom: HP(1),
  },
  nutritionBadgeProtein: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: WP(3),
    paddingVertical: HP(0.8),
    borderRadius: 30,
    marginRight: WP(2),
    marginBottom: HP(1),
  },
  nutritionBadgeFiber: {
    backgroundColor: '#D1FADF',
    paddingHorizontal: WP(3),
    paddingVertical: HP(0.8),
    borderRadius: 30,
    marginBottom: HP(1),
  },
  nutritionText: {
    fontSize: size.small,
    fontFamily: Fonts.interMedium,
    color: colors.p1,
    fontWeight: '600',
  },
  spikeIcon: {
    width: WP(6),
    height: WP(6),
  },

  sparklesIcon: {
    width: WP(6),
    height: WP(6),
  },

  arrowIcon: {
    width: WP(4),
    height: WP(3),
    marginLeft: WP(4),
  },

  // Button row with arrow
  seeSuggestionsButton: {
    flexDirection: 'row',
    // backgroundColor: '#e3f2fd',
    paddingVertical: HP(1),
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#e3f2fd',
  },
  seeSuggestionsText: {
    color: colors.p1,
    fontSize: size.normal,
    fontFamily: Fonts.interSemiBold,
  },

  seeDetailButton: {
    flexDirection: 'row',
    // backgroundColor: '#e3f2fd',
    paddingVertical: HP(1),
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#e3f2fd',
  },
  seeDetailText: {
    color: colors.p1,
    fontSize: size.normal,
    fontFamily: Fonts.interSemiBold,
  },
  iconButton: {
    padding: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    // backgroundColor: '#F5F5F5',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginLeft: 10,
  },
  icon: {
    fontSize: 20,
  },
});

export default styles;
