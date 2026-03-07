import {StyleSheet, Platform} from 'react-native';
import {colors, family, HP, size, WP} from '../../../utilities';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  wrapper: {
    flex: 1,
    paddingHorizontal: WP(2),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: HP(1),
    paddingBottom: HP(14),
  },
  buttonContainer: {
    paddingHorizontal: WP(4),
    paddingTop: HP(1.5),
    paddingBottom: HP(2),
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: colors.g15,
  },
  title: {
    fontSize: size.xlarge,
    fontFamily: family.inter_bold,
    color: colors.b1,
    marginTop: HP(1),
    marginBottom: HP(2),
    paddingHorizontal: WP(0.5),
  },

  /* ===== REPORT TABS (Sugar/Fasting) ===== */
  reportTabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 4,
    marginBottom: HP(1.5),
    borderWidth: 1,
    borderColor: colors.g15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {elevation: 2},
    }),
  },
  reportTab: {
    flex: 1,
    paddingVertical: HP(1.2),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginHorizontal: 3,
  },
  activeReportTab: {
    backgroundColor: colors.p1,
  },
  reportTabText: {
    color: colors.g9,
    fontSize: size.small,
    fontFamily: family.inter_medium,
  },
  activeReportTabText: {
    color: colors.white,
    fontSize: size.small,
    fontFamily: family.inter_bold,
  },
  sectionLabel: {
    fontSize: size.xtiny,
    fontFamily: family.inter_medium,
    color: colors.g9,
    marginTop: HP(2),
    marginBottom: HP(1),
    marginLeft: WP(0.5),
    textTransform: 'uppercase',
    letterSpacing: 0.8,
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
    backgroundColor: colors.p1,
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

  /* ===== STATS CARDS ===== */
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: HP(2),
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingVertical: HP(1.2),
    paddingHorizontal: WP(3),
    paddingLeft: WP(3.5),
    marginHorizontal: WP(0.5),
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.g15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {elevation: 2},
    }),
  },
  statCardLeft: {
    marginRight: WP(1),
  },
  statCardRight: {
    marginLeft: WP(1),
  },
  statAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.p1,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  statLabel: {
    fontSize: size.xtiny,
    fontFamily: family.inter_regular,
    color: colors.g9,
    marginBottom: HP(0.3),
  },
  statValue: {
    fontSize: size.medium,
    fontFamily: family.inter_bold,
    color: colors.b1,
  },

  /* ===== DOWNLOAD BUTTON ===== */
  downloadButton: {
    backgroundColor: colors.p1,
    borderRadius: 14,
    paddingVertical: HP(1.5),
    paddingHorizontal: WP(4),
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.p1,
    ...Platform.select({
      ios: {
        shadowColor: colors.p1,
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {elevation: 4},
    }),
  },
  downloadIcon: {
    width: 20,
    height: 20,
    marginRight: WP(2),
    tintColor: colors.white,
  },
  downloadButtonText: {
    color: colors.white,
    fontSize: size.small,
    fontFamily: family.inter_bold,
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
    backgroundColor: colors.p1,
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
    backgroundColor: colors.g13,
    borderRadius: 12,
    marginVertical: 16,
    padding: 20,
  },
  selectDatesText: {
    fontSize: size.small,
    color: colors.g9,
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
