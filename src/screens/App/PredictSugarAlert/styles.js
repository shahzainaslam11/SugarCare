import {StyleSheet} from 'react-native';
import {colors, family, HP, size, WP} from '../../../utilities';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingHorizontal: WP('3'),
    paddingTop: HP('1'),
    paddingBottom: HP('12'),
  },

  // Alert Card
  alertCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: WP('3'),
    marginBottom: HP('2'),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
  },
  alertHeader: {
    marginBottom: HP('1.5'),
  },
  alertTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: size.medium,
    fontFamily: family.inter_semibold,
    color: colors.b1,
    flex: 1,
  },
  confidenceBadge: {
    backgroundColor: '#f0f9ff',
    paddingHorizontal: WP('2.5'),
    paddingVertical: HP('0.3'),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  confidenceText: {
    color: '#0369a1',
    fontSize: size.xsmall,
    fontFamily: family.inter_semibold,
  },

  // Readings Comparison
  readingsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: WP('3'),
    marginBottom: HP('1'),
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  readingColumn: {
    alignItems: 'center',
    flex: 1,
  },
  readingLabel: {
    fontSize: size.xsmall,
    fontFamily: family.inter_medium,
    color: '#64748b',
    marginBottom: HP('0.3'),
  },
  readingValue: {
    fontSize: size.xlarge,
    fontFamily: family.inter_bold,
    color: colors.b1,
    lineHeight: 30,
  },
  readingUnit: {
    fontSize: size.small,
    fontFamily: family.inter_regular,
    color: '#64748b',
  },
  currentStatus: {
    fontSize: size.xsmall,
    fontFamily: family.inter_semibold,
    color: '#64748b',
    marginTop: HP('0.3'),
    backgroundColor: '#f1f5f9',
    paddingHorizontal: WP('2'),
    paddingVertical: HP('0.2'),
    borderRadius: 8,
  },
  predictedStatus: {
    fontSize: size.xsmall,
    fontFamily: family.inter_semibold,
    color: '#64748b',
    marginTop: HP('0.3'),
    backgroundColor: '#f1f5f9',
    paddingHorizontal: WP('2'),
    paddingVertical: HP('0.2'),
    borderRadius: 8,
  },
  arrowContainer: {
    alignItems: 'center',
    paddingHorizontal: WP('2'),
  },
  arrowLine: {
    width: 1,
    height: HP('1'),
    backgroundColor: '#cbd5e1',
  },
  arrowText: {
    fontSize: size.large,
    fontFamily: family.inter_bold,
    marginVertical: HP('0.3'),
  },
  timeText: {
    fontSize: size.xsmall,
    fontFamily: family.inter_medium,
    color: '#64748b',
    marginTop: HP('0.3'),
  },

  // Trend Indicator
  trendContainer: {
    alignItems: 'center',
    marginBottom: HP('1.5'),
  },
  trendText: {
    fontSize: size.small,
    fontFamily: family.inter_semibold,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: WP('3'),
    paddingVertical: HP('0.5'),
    borderRadius: 12,
  },

  // Chart
  chartContainer: {
    flexDirection: 'row',
    height: HP('16'),
    marginBottom: HP('1.5'),
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: WP('2'),
  },
  chartWrapper: {
    flex: 1,
    marginLeft: WP('1'),
  },
  chart: {
    flex: 1,
  },

  // Explanation
  explanationContainer: {
    backgroundColor: '#f1f5f9',
    padding: WP('3'),
    borderRadius: 8,
    marginBottom: HP('1.5'),
  },
  explanationText: {
    fontSize: size.small,
    fontFamily: family.inter_regular,
    color: '#475569',
    lineHeight: 18,
    textAlign: 'center',
  },

  // Prediction Detail
  predictionDetail: {
    backgroundColor: '#f8f9fa',
    padding: WP('3'),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  predictionText: {
    fontSize: size.small,
    color: colors.g9,
    fontFamily: family.inter_regular,
    lineHeight: 18,
  },
  predictionLabel: {
    fontWeight: '600',
    color: colors.b1,
    fontFamily: family.inter_semibold,
  },

  // Suggestion Card
  suggestionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: WP('3'),
    marginBottom: HP('2'),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: HP('1'),
  },
  suggestionIcon: {
    width: WP('4'),
    height: WP('4'),
    marginRight: WP('2'),
    tintColor: '#0369a1',
  },
  suggestionTitle: {
    color: '#0369a1',
    fontSize: size.small,
    fontFamily: family.inter_semibold,
    flex: 1,
  },
  suggestionText: {
    fontSize: size.small,
    fontFamily: family.inter_regular,
    color: '#334155',
    lineHeight: 20,
    marginBottom: HP('1.5'),
  },

  // Input Summary
  inputSummary: {
    backgroundColor: '#f0f9ff',
    padding: WP('3'),
    borderRadius: 8,
    marginBottom: HP('1.5'),
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  summaryTitle: {
    fontSize: size.small,
    fontWeight: '600',
    color: colors.p1,
    marginBottom: HP('1'),
    fontFamily: family.inter_semibold,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: size.xsmall,
    color: colors.g9,
    fontFamily: family.inter_medium,
    marginBottom: HP('0.3'),
  },
  summaryValue: {
    fontSize: size.small,
    color: colors.b1,
    fontFamily: family.inter_semibold,
  },
  summaryDivider: {
    width: 1,
    height: HP('2'),
    backgroundColor: '#cbd5e1',
  },

  // Ranges Card
  rangesCard: {
    backgroundColor: '#fff',
    padding: WP('3'),
    borderRadius: 10,
    marginBottom: HP('2'),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  rangesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HP('1'),
  },
  rangesTitle: {
    fontSize: size.small,
    fontWeight: '600',
    color: colors.b1,
    fontFamily: family.inter_semibold,
  },
  currentIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicatorDot: {
    width: WP('2'),
    height: WP('2'),
    borderRadius: WP('1'),
    marginRight: WP('1'),
  },
  indicatorText: {
    fontSize: size.xsmall,
    color: '#64748b',
    fontFamily: family.inter_medium,
  },
  rangesGrid: {
    flexDirection: 'column',
  },
  rangeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: HP('0.8'),
    paddingHorizontal: WP('2'),
    borderRadius: 6,
    marginBottom: HP('0.5'),
    justifyContent: 'space-between',
  },
  rangeNormal: {
    backgroundColor: '#f0fdf4',
  },
  rangePrediabetes: {
    backgroundColor: '#fffbeb',
  },
  rangeDiabetes: {
    backgroundColor: '#fef2f2',
  },
  rangeColor: {
    width: WP('2.5'),
    height: WP('2.5'),
    borderRadius: 4,
    marginRight: WP('2'),
  },
  rangeText: {
    fontSize: size.xsmall,
    color: colors.g9,
    fontFamily: family.inter_regular,
    flex: 1,
  },
  rangeCurrent: {
    fontSize: size.xsmall,
    color: '#0369a1',
    fontFamily: family.inter_semibold,
  },
  predictedIndicator: {
    marginTop: HP('1'),
    paddingTop: HP('0.5'),
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  predictedIndicatorText: {
    fontSize: size.xsmall,
    color: colors.p1,
    fontFamily: family.inter_semibold,
    textAlign: 'center',
  },

  // Remind Button
  remindButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.p1,
    paddingVertical: HP('1'),
    borderRadius: 20,
    backgroundColor: '#f8fafc',
  },
  bellIcon: {
    width: WP('4'),
    height: WP('4'),
    marginRight: WP('2'),
    tintColor: colors.p1,
  },
  remindText: {
    color: colors.p1,
    fontSize: size.small,
    fontFamily: family.inter_semibold,
  },

  // Bottom Button
  bottomButtonContainer: {
    position: 'absolute',
    bottom: HP('1.5'),
    left: WP('3'),
    right: WP('3'),
    backgroundColor: '#f8fafc',
    paddingTop: HP('1'),
    paddingBottom: HP('2'),
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  doneButton: {
    width: '100%',
  },

  // No Data State
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: HP('10'),
  },
  noDataIcon: {
    width: WP('20'),
    height: WP('20'),
    marginBottom: HP('2'),
    tintColor: '#94a3b8',
  },
  noDataTitle: {
    fontSize: size.medium,
    fontFamily: family.inter_semibold,
    color: colors.b1,
    marginBottom: HP('1'),
  },
  noDataText: {
    fontSize: size.small,
    fontFamily: family.inter_regular,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: WP('10'),
  },
});

export default styles;
