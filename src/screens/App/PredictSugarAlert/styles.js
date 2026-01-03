import {StyleSheet} from 'react-native';
import {colors, family, HP, size, WP} from '../../../utilities';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingHorizontal: WP('4'),
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },

  alertCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HP('3'),
  },
  alertTitle: {
    fontSize: size.medium,
    fontFamily: family.inter_medium,
    color: colors.b1,
  },
  confidenceBadge: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  confidenceText: {
    color: '#0369a1',
    fontSize: size.tiny,
    fontFamily: family.inter_medium,
    fontWeight: '600',
  },

  readingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: HP('4'),
  },
  readingBox: {
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 100,
  },
  readingLabel: {
    fontSize: size.tiny,
    fontFamily: family.inter_medium,
    color: '#666',
    marginBottom: 4,
  },
  readingValue: {
    fontSize: size.tiny,
    fontFamily: family.inter_medium,
    fontWeight: 'bold',
    color: colors.b1,
  },
  readingValuePredicted: {
    fontSize: size.tiny,
    fontFamily: family.inter_medium,
    fontWeight: 'bold',
    color: colors.b1,
  },
  dottedLineContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  dottedLine: {
    width: 40,
    borderBottomWidth: 2,
    borderStyle: 'dotted',
    borderColor: '#ccc',
    marginTop: 8,
  },
  timeLabel: {
    fontSize: size.tiny,
    fontFamily: family.inter_medium,
    fontWeight: 'bold',
    color: '#666',
  },

  chartContainer: {
    flexDirection: 'row',
    height: HP('22'),
    marginBottom: HP('3'),
  },

  description: {
    fontSize: size.tiny,
    fontFamily: family.inter_medium,
    color: '#444',
    lineHeight: 20,
    textAlign: 'center',
  },

  suggestionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 100,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  suggestionHeader: {
    backgroundColor: '#e0f2fe',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: HP('1'),
    borderRadius: 20,
    marginBottom: HP('2'),
  },
  suggestionTitle: {
    color: '#0369a1',
    fontSize: size.small,
    fontFamily: family.inter_medium,
    fontWeight: '600',
  },
  suggestionText: {
    fontSize: size.small,
    fontFamily: family.inter_medium,
    color: '#333',
    lineHeight: 22,
    marginBottom: HP('2'),
  },
  remindButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: HP('1.5'),
    borderRadius: 30,
  },
  bellIcon: {
    width: WP('5'),
    height: HP('2'),
    marginRight: 8,
  },
  remindText: {
    color: colors.p1,
    fontSize: size.small,
    fontFamily: family.inter_medium,
    fontWeight: '600',
  },

  bottomButtonContainer: {
    position: 'absolute',
    bottom: HP('4'),
    left: 20,
    right: 20,
  },
  doneButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  doneText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default styles;
