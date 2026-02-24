import {StyleSheet} from 'react-native';
import {colors, family, HP, size, WP} from '../../../utilities';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.g13,
    paddingHorizontal: WP(4),
    paddingTop: HP(1.5),
    paddingBottom: 0,
  },
  scrollContent: {
    paddingTop: HP(2),
    paddingBottom: HP(14),
  },
  header: {
    fontSize: size.h5,
    fontFamily: family.inter_bold,
    marginBottom: HP(2),
    color: colors.p1,
  },
  forecastContainer: {
    marginBottom: HP(2),
  },
  timeText: {
    fontSize: size.medium,
    fontFamily: family.inter_bold,
    color: colors.g3,
    marginBottom: HP(0.5),
  },
  noFastText: {
    fontSize: size.medium,
    fontFamily: family.inter_bold,
    color: colors.g3,
    marginBottom: HP(0.5),
  },
  emptyText: {
    fontSize: size.small,
    fontFamily: family.inter_medium,
    color: colors.g3,
    alignSelf: 'center',
    marginVertical: HP(4),
  },
  forecastTitle: {
    fontSize: size.large,
    fontFamily: family.inter_bold,
    color: colors.b4,
    marginBottom: HP(1.2),
  },
  readingText: {
    fontSize: size.h2,
    fontFamily: family.inter_bold,
    marginBottom: HP(1),
    color: colors.p1,
  },
  trendText: {
    fontSize: size.small,
    fontFamily: family.inter_regular,
    color: colors.g3,
    marginBottom: HP(2),
  },
  chartContainer: {
    flexDirection: 'row',
    height: HP(25),
    marginBottom: HP(2.5),
  },
  chartYAxis: {
    justifyContent: 'space-between',
    marginRight: WP(2.5),
    paddingVertical: HP(1.2),
  },
  chartLabel: {
    fontSize: WP(3),
    color: '#666',
  },
  chart: {
    flex: 1,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  actualChart: {
    marginVertical: HP(1),
  },
  timeRangeContainer: {
    marginTop: HP(1.2),
  },
  timeRangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: HP(1.2),
  },
  timeRangeText: {
    fontSize: WP(3),
    color: '#666',
  },
  timeRangeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeOption: {
    paddingVertical: HP(0.6),
    backgroundColor: '#f0f0f0',
    borderRadius: WP(3.8),
  },
  rangeOptionSelected: {
    backgroundColor: colors.p1,
  },
  rangeText: {
    fontSize: WP(3),
    color: '#333',
  },
  rangeTextSelected: {
    color: '#fff',
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: HP(2.5),
  },
  recordsContainer: {
    marginBottom: HP(2),
    marginTop: HP(1.5),
  },
  sectionTitle: {
    fontSize: size.medium,
    fontFamily: family.inter_bold,
    color: colors.b4,
    marginBottom: HP(1.5),
  },
  streakText: {
    fontSize: size.small,
    fontFamily: family.inter_medium,
    color: colors.p1,
    marginBottom: HP(1.5),
  },
  addButton: {
    marginBottom: HP(2),
    backgroundColor: colors.p1,
  },
  buttonContainer: {
    paddingTop: HP(2),
    paddingBottom: HP(2),
  },
});
