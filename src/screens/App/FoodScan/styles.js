import {Platform, StyleSheet} from 'react-native';
import {colors, family, HP, size, WP} from '../../../utilities';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.g13,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: WP(5),
    paddingTop: HP(2),
    paddingBottom: HP(14),
    alignItems: 'center',
  },
  heroSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: HP(2),
  },
  illustrationCard: {
    width: WP(85),
    aspectRatio: 1.1,
    backgroundColor: colors.white,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    padding: WP(4),
    ...Platform.select({
      ios: {
        shadowColor: colors.p1,
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  scannerImage: {
    width: '100%',
    height: '100%',
  },
  loadingPlaceholder: {
    width: WP(85),
    aspectRatio: 1.1,
    backgroundColor: colors.white,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  loadingText: {
    marginTop: HP(1.5),
    fontSize: size.small,
    fontFamily: family.inter_medium,
    color: colors.g3,
  },
  imagePreviewWrapper: {
    width: WP(85),
    position: 'relative',
  },
  capturedImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: colors.p1,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.p1,
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  clearImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: WP(10),
    height: WP(10),
    borderRadius: WP(5),
    backgroundColor: colors.r2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  clearImageButtonPressed: {
    opacity: 0.9,
  },
  clearImageText: {
    color: colors.white,
    fontSize: size.h4,
    fontFamily: family.inter_bold,
    lineHeight: size.h4,
  },
  title: {
    fontSize: size.h3,
    fontFamily: family.inter_bold,
    color: colors.b4,
    textAlign: 'center',
    marginBottom: HP(0.8),
  },
  subtitle: {
    fontSize: size.small,
    fontFamily: family.inter_regular,
    color: colors.g3,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: HP(4),
  },
  buttonContainer: {
    width: '100%',
    marginBottom: HP(2),
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.p1,
    paddingVertical: HP(1.8),
    paddingHorizontal: WP(4),
    borderRadius: 16,
    marginBottom: HP(1.2),
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    paddingVertical: HP(1.8),
    paddingHorizontal: WP(4),
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.p1,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonIcon: {
    width: WP(5),
    height: WP(5),
    marginRight: WP(2),
    tintColor: colors.white,
  },
  buttonIconSecondary: {
    tintColor: colors.p1,
  },
  primaryButtonText: {
    fontSize: size.medium,
    fontFamily: family.inter_bold,
    color: colors.white,
  },
  secondaryButtonText: {
    fontSize: size.medium,
    fontFamily: family.inter_bold,
    color: colors.p1,
  },
  scanButton: {
    backgroundColor: colors.p1,
    paddingVertical: HP(1.8),
    paddingHorizontal: WP(10),
    borderRadius: 16,
    alignSelf: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.p1,
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  scanButtonPressed: {
    opacity: 0.92,
  },
  scanButtonText: {
    color: colors.white,
    fontSize: size.medium,
    fontFamily: family.inter_bold,
  },
  scanningOverlay: {
    marginTop: HP(2),
    alignItems: 'center',
  },
  scanningText: {
    marginTop: HP(1),
    fontSize: size.small,
    fontFamily: family.inter_medium,
    color: colors.g3,
  },
});

export default styles;
