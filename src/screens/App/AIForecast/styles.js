// src/screens/RiskForecast/styles.js

import {StyleSheet} from 'react-native';
import {colors, family, HP, size, WP} from '../../../utilities';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: WP(5),
    paddingVertical: HP(2),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: size.xlarge,
    fontFamily: family.inter_bold,
    color: '#000',
  },
  iconSmall: {
    width: WP(6),
    height: WP(6),
    resizeMode: 'contain',
  },

  scrollView: {
    flex: 1,
    paddingHorizontal: WP(5),
    paddingTop: HP(2),
  },

  infoCard: {
    backgroundColor: '#F6F9FF',
    borderRadius: WP(4),
    padding: WP(5),
    marginBottom: HP(2.5),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#C2D3FF',
  },
  sectionTitle: {
    fontSize: size.large,
    fontFamily: family.inter_bold,
    color: '#000',
    // marginBottom: HP(1.5),
  },
  infoText: {
    fontSize: size.small,
    fontFamily: family.inter_regular,
    color: '#555',
    lineHeight: HP(2.4),
    marginBottom: HP(1),
  },
  infoTextBold: {
    fontSize: size.small,
    fontFamily: family.inter_bold,
    color: '#d32f2f',
    lineHeight: HP(2.4),
  },

  riskStatusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: WP(4),
    padding: WP(3),
    marginBottom: HP(2),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  safeBadge: {
    backgroundColor: '#d4edda',
    paddingHorizontal: WP(3),
    paddingVertical: HP(0.4),
    borderRadius: 20,
  },
  safeText: {
    color: '#155724',
    fontFamily: family.inter_medium,
    fontSize: size.medium,
  },

  sectionHeader: {
    fontSize: size.large,
    fontFamily: family.inter_bold,
    color: '#000',
    marginBottom: HP(1),
  },
  subtitle: {
    fontSize: size.small,
    fontFamily: family.inter_regular,
    color: '#777',
    marginBottom: HP(2),
  },

  // Risk Card Styles
  riskCard: {
    backgroundColor: '#fff',
    borderRadius: WP(4),
    padding: WP(5),
    marginBottom: HP(2),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HP(1.5),
  },
  riskTitle: {
    fontSize: size.normal,
    fontFamily: family.inter_bold,
    color: '#000',
    flex: 1,
  },
  riskIcon: {
    width: WP(7),
    height: WP(7),
    resizeMode: 'contain',
  },
  iconContainer: {
    padding: WP(1.5),
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#C2D3FF',
    width: WP(10),
    height: WP(10),
    alignItems: 'center',
    justifyContent: 'center',
  },

  riskLevelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: HP(1.5),
  },
  arrowIcon: {
    width: WP(4),
    height: WP(4),
    resizeMode: 'contain',
    marginLeft: WP(1.5),
  },

  riskLevelAverage: {
    fontSize: size.normal,
    fontFamily: family.inter_medium,
    color: '#666',
  },
  riskLevelModerate: {
    fontSize: size.normal,
    fontFamily: family.inter_bold,
    color: '#FF8C00',
  },
  riskLevelHigh: {
    fontSize: size.normal,
    fontFamily: family.inter_bold,
    color: '#DC143C',
  },
  riskLevelSafe: {
    fontSize: size.normal,
    fontFamily: family.inter_bold,
    color: '#28A745',
  },

  causeLabel: {
    fontFamily: family.inter_bold,
    color: '#000',
    marginBottom: HP(0.5),
  },
  causeText: {
    fontSize: size.small,
    fontFamily: family.inter_regular,
    color: '#555',
    lineHeight: HP(2.4),
    marginBottom: HP(1.5),
  },
  tipLabel: {
    fontFamily: family.inter_bold,
    color: '#000',
    marginBottom: HP(1),
  },

  tipBadgeAverage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e2e8f0',
    paddingHorizontal: WP(2),
    paddingVertical: HP(0.5),
    borderRadius: 20,
  },
  tipBadgeModerate: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff3cd',
    paddingHorizontal: WP(2),
    paddingVertical: HP(0.5),
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  tipBadgeHigh: {
    alignSelf: 'flex-start',
    backgroundColor: '#f8d7da',
    paddingHorizontal: WP(2),
    paddingVertical: HP(0.5),
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f5c6cb',
  },
  tipBadgeSafe: {
    alignSelf: 'flex-start',
    backgroundColor: '#d4edda',
    paddingHorizontal: WP(2),
    paddingVertical: HP(0.5),
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#c3e6cb',
  },

  tipText: {
    color: '#2d3748',
    fontSize: size.small,
    fontFamily: family.inter_medium,
  },
  tipTextHigh: {
    color: '#721c24',
    fontSize: size.small,
    fontFamily: family.inter_bold,
  },
  tipTextSafe: {
    color: '#155724',
    fontSize: size.small,
    fontFamily: family.inter_bold,
  },

  tipsContainer: {
    backgroundColor: '#F6F9FF',
    borderRadius: WP(4),
    padding: WP(5),
    marginTop: HP(1),
    marginBottom: HP(3),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#C2D3FF',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: HP(2),
  },
  tipIcon: {
    width: WP(5.5),
    height: WP(5.5),
    resizeMode: 'contain',
    marginTop: HP(0.3),
  },
  tipItemText: {
    flex: 1,
    marginLeft: WP(3.5),
    fontSize: size.small,
    fontFamily: family.inter_regular,
    color: '#616161',
    lineHeight: HP(2.4),
  },
  errorCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: WP(4),
    padding: WP(4),
    marginBottom: HP(2),
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  errorCardText: {
    fontSize: size.small,
    fontFamily: family.inter_medium,
    color: '#E65100',
    lineHeight: HP(2.2),
    textAlign: 'center',
  },

  noDataText: {
    textAlign: 'center',
    marginVertical: HP(2),
    fontSize: size.normal,
    color: colors.white,
    fontFamily: family.inter_medium,
    backgroundColor: colors.p1,
    padding: 10,
    borderRadius: 10,
  },
});

export default styles;
