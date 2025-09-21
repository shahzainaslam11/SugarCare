import {StyleSheet} from 'react-native';
import {colors, HP, WP} from '../../../utilities';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: WP(4),
    paddingTop: HP(2),
  },
  contentContainer: {
    paddingTop: HP(3),
    paddingBottom: HP(2),
  },
  header: {
    fontSize: WP(5.5),
    fontWeight: 'bold',
    marginBottom: HP(2.5),
    color: colors.p1,
  },
  forecastContainer: {
    marginBottom: HP(2.5),
  },
  timeText: {
    fontSize: WP(4),
    color: '#666',
    marginBottom: HP(0.6),
  },
  forecastTitle: {
    fontSize: WP(4.5),
    fontWeight: '600',
    marginBottom: HP(0.6),
    marginTop: HP(1),
  },
  readingText: {
    fontSize: WP(6),
    fontWeight: 'bold',
    marginBottom: HP(1.2),
    color: colors.p1,
  },
  trendText: {
    fontSize: WP(3.5),
    color: '#666',
    marginBottom: HP(2.5),
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
    marginBottom: HP(3.8),
  },
  sectionTitle: {
    fontSize: WP(5),
    fontWeight: 'bold',
    marginBottom: HP(1.9),
  },
  addButton: {
    marginBottom: HP(2.5),
    backgroundColor: colors.p1,
    marginHorizontal: WP(6), // Match the container padding
  },
  buttonContainer: {
    paddingHorizontal: WP(6), // For the button to match container padding
  },
});
