import {Platform, StyleSheet} from 'react-native';
import {colors, family, HP, size, WP} from '../../../../utilities';

const shadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  android: {elevation: 3},
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.g13,
  },
  scrollContentContainer: {
    paddingBottom: HP(12),
  },
  scrollContent: {
    marginTop: -HP(1.2),
    paddingTop: HP(1.2),
    paddingHorizontal: WP(4),
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...shadow,
  },

  heroSection: {
    paddingVertical: HP(2),
    paddingHorizontal: WP(4),
    backgroundColor: colors.p1,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
  },
  avatarWrapper: {
    alignItems: 'center',
    position: 'relative',
  },
  avatarRing: {
    width: WP(28),
    height: WP(28),
    borderRadius: WP(14),
    overflow: 'hidden',
    backgroundColor: colors.white,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 9999,
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.p1,
    padding: WP(2),
    borderRadius: WP(4),
    borderWidth: 2,
    borderColor: colors.white,
    ...shadow,
  },
  cameraIcon: {
    width: WP(4),
    height: WP(4),
    tintColor: colors.white,
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    color: colors.white,
    fontSize: size.xsmall,
    fontFamily: family.inter_medium,
    marginTop: HP(0.25),
  },

  // Photo actions – compact pill row
  avatarActions: {
    flexDirection: 'row',
    gap: WP(2),
    marginBottom: HP(0.6),
  },
  changePhotoBtn: {
    flex: 1,
    paddingVertical: HP(0.6),
    paddingHorizontal: WP(3),
    borderRadius: 10,
    backgroundColor: colors.p1,
    alignItems: 'center',
  },
  changePhotoText: {
    color: colors.white,
    fontSize: size.xsmall,
    fontFamily: family.inter_medium,
  },
  removePhotoBtn: {
    flex: 1,
    paddingVertical: HP(0.6),
    paddingHorizontal: WP(3),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.g4,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  removePhotoText: {
    color: colors.g5,
    fontSize: size.xsmall,
    fontFamily: family.inter_medium,
  },

  // Form – compact sections
  formCard: {
    paddingBottom: HP(0.5),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: HP(0.5),
    marginBottom: HP(0.3),
  },
  sectionDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.p1,
    marginRight: WP(1.5),
  },
  cardTitle: {
    fontSize: size.xsmall,
    fontFamily: family.inter_bold,
    color: colors.g5,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: colors.g13,
    marginVertical: HP(0.4),
  },
  row: {
    flexDirection: 'row',
    gap: WP(2),
  },
  half: {
    flex: 1,
  },

  dropdownPlaceholder: {
    marginVertical: HP('0.5'),
  },
  dropdownPlaceholderLabel: {
    color: colors.g1,
    fontFamily: family.inter_medium,
    fontSize: size.medium,
    marginBottom: HP('0.5'),
  },
  dropdownPlaceholderBox: {
    minHeight: HP('5'),
    justifyContent: 'center',
    paddingHorizontal: WP('1.5'),
  },
  dropdownPlaceholderText: {
    color: colors.g5,
    fontFamily: family.inter_medium,
    fontSize: size.normal,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#E3E3E3',
    borderRadius: 12,
    backgroundColor: colors.white,
  },

  // Insulin toggle – compact
  insulinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: HP(0.6),
    paddingHorizontal: WP(3),
    marginTop: HP(0.3),
    borderRadius: 10,
    backgroundColor: colors.g13,
  },
  insulinText: {
    fontSize: size.small,
    fontFamily: family.inter_medium,
    color: colors.b1,
  },

  // Save – prominent
  saveBtn: {
    marginHorizontal: WP(4),
    marginBottom: HP(2),
    paddingTop: HP(0.5),
  },
});

export default styles;
