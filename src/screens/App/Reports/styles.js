import {StyleSheet} from 'react-native';
import {colors, family, HP, size, WP} from '../../../utilities';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: WP(4),
    paddingBottom: 0, // Remove bottom padding to avoid pushing up tab bar
  },
  statusBar: {
    height: 44,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    // padding: 16,
  },
  title: {
    fontSize: size.large,
    fontFamily: family.inter_medium,
    fontWeight: 'bold',
    marginBottom: HP(2),
    color: '#1a1a1a',
  },

  /* ===== REPORT TABS (Sugar/Fasting) ===== */
  reportTabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    marginBottom: HP(2),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportTab: {
    flex: 1,
    paddingVertical: HP(1.5),
    alignItems: 'center',
    borderRadius: 10,
    marginHorizontal: 2,
  },
  activeReportTab: {
    backgroundColor: '#4b66ea',
  },
  reportTabText: {
    color: '#666',
    fontWeight: '600',
    fontSize: size.small,
    fontFamily: family.inter_medium,
  },
  activeReportTabText: {
    color: '#fff',
    fontSize: size.small,
    fontFamily: family.inter_medium,
  },

  /* ===== RANGE TABS (Today/1W/1M/Custom) ===== */
  rangeTabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rangeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeRangeTab: {
    backgroundColor: '#4b66ea',
  },
  rangeTabText: {
    color: '#666',
    fontWeight: '600',
    fontSize: size.small,
    fontFamily: family.inter_medium,
  },
  activeRangeTabText: {
    color: '#fff',
    fontSize: size.small,
    fontFamily: family.inter_medium,
  },

  customTabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  /* ===== CARDS ===== */
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  halfCard: {
    width: '48%',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: HP(2),
  },
  cardTitle: {
    fontSize: size.small,
    fontFamily: family.inter_medium,
    // fontWeight: 'bold',
    color: colors.b1,
    marginBottom: HP(0.5),
  },
  value: {
    fontSize: size.small,
    fontFamily: family.inter_medium,
    // fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  change: {
    fontSize: size.small,
    fontFamily: family.inter_medium,
    color: '#4caf50',
    marginBottom: 16,
  },
  statValue: {
    fontSize: size.large,
    fontFamily: family.inter_medium,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },

  /* ===== DOWNLOAD BUTTON ===== */
  downloadButton: {
    backgroundColor: '#4b66ea',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: HP(2),
    left: WP(4),
    right: WP(4),
  },
  downloadIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
    tintColor: '#fff',
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: size.small,
    fontFamily: family.inter_medium,
    fontWeight: 'bold',
  },

  /* ===== MODAL ===== */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    minHeight: '40%',
  },
  modalTitle: {
    fontSize: size.small,
    fontFamily: family.inter_medium,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  pickerContainer: {
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  applyButton: {
    backgroundColor: '#4b66ea',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
    paddingHorizontal: WP(4),
  },
  cancelButtonText: {
    color: colors.b1,
    fontWeight: 'bold',
    fontSize: size.medium,
    fontFamily: family.inter_medium,
    paddingHorizontal: WP(4),
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: size.small,
    fontFamily: family.inter_medium,
  },
  // Add to your styles.js
  selectDatesContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginVertical: 16,
    padding: 20,
  },
  selectDatesText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: '#e9ecef',
  },
  disabledIcon: {
    tintColor: '#adb5bd',
  },
  disabledButtonText: {
    color: '#adb5bd',
  },
  customTabModalOpen: {
    backgroundColor: '#e7f5ff',
  },
  customTabModalOpenText: {
    color: '#0d6efd',
  },
});

export default styles;
