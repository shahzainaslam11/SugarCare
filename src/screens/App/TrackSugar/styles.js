import {StyleSheet} from 'react-native';
import {colors, family, HP, size, WP} from '../../../utilities';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.g13 || '#F5F5F5',
  },
  wrapper: {
    flex: 1,
    paddingHorizontal: WP(2),
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: HP(1.5),
    paddingBottom: HP(14),
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
    paddingHorizontal: WP(2),
    marginBottom: HP(2),
  },
  sectionTitle: {
    fontSize: size.large,
    fontFamily: family.inter_bold,
    color: colors.b1,
    marginBottom: HP(1.5),
    marginTop: HP(0.5),
  },
  buttonContainer: {
    paddingHorizontal: WP(4),
    paddingTop: HP(1.5),
    paddingBottom: HP(2),
    backgroundColor: colors.g13,
    borderTopWidth: 1,
    borderTopColor: colors.g15,
  },
});
