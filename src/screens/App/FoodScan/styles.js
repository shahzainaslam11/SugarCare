import {Platform, StyleSheet} from 'react-native';
import {colors, family, HP, size, WP} from '../../../utilities';

const cardShadow = Platform.select({
  ios: {
    shadowColor: colors.drakBlack,
    shadowOffset: {width: 0, height: HP(0.2)},
    shadowOpacity: 0.06,
    shadowRadius: WP(2.5),
  },
  android: {elevation: 3},
});

const primaryShadow = Platform.select({
  ios: {
    shadowColor: colors.p1,
    shadowOffset: {width: 0, height: HP(0.25)},
    shadowOpacity: 0.15,
    shadowRadius: WP(2),
  },
  android: {elevation: 4},
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.g13,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: WP(3.5),
    paddingTop: HP(1),
    paddingBottom: HP(4),
    alignItems: 'center',
  },
  scrollContentWithBottomScan: {
    paddingBottom: HP(16),
  },

  // Hero: illustration or image preview
  heroSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: HP(1.2),
  },
  sectionLabel: {
    fontSize: size.xtiny,
    fontFamily: family.inter_medium,
    color: colors.g9,
    marginBottom: HP(0.5),
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    alignSelf: 'flex-start',
    marginLeft: WP(0.5),
  },
  illustrationCard: {
    width: '100%',
    maxWidth: WP(88),
    aspectRatio: 1.15,
    backgroundColor: colors.white,
    borderRadius: WP(4),
    justifyContent: 'center',
    alignItems: 'center',
    padding: WP(3),
    borderWidth: 1,
    borderColor: colors.g15,
    ...cardShadow,
  },
  scannerImage: {
    width: '65%',
    height: '65%',
  },
  illustrationHint: {
    marginTop: HP(0.5),
    fontSize: size.xtiny,
    fontFamily: family.inter_regular,
    color: colors.g9,
    textAlign: 'center',
    paddingHorizontal: WP(1),
  },
  loadingPlaceholder: {
    width: '100%',
    maxWidth: WP(88),
    aspectRatio: 1.15,
    backgroundColor: colors.white,
    borderRadius: WP(4),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.g15,
    ...cardShadow,
  },
  loadingText: {
    marginTop: HP(0.8),
    fontSize: size.xtiny,
    fontFamily: family.inter_medium,
    color: colors.g3,
  },
  imagePreviewWrapper: {
    width: '100%',
    maxWidth: WP(88),
    position: 'relative',
  },
  capturedImage: {
    width: '100%',
    aspectRatio: 0.92,
    borderRadius: WP(3.5),
    borderWidth: 2,
    borderColor: colors.p1,
    overflow: 'hidden',
    ...primaryShadow,
  },
  clearImageButton: {
    position: 'absolute',
    top: -WP(1.2),
    right: -WP(1.2),
    width: WP(8),
    height: WP(8),
    borderRadius: WP(4),
    backgroundColor: colors.r2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
    ...Platform.select({
      ios: {
        shadowColor: colors.drakBlack,
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.2,
        shadowRadius: WP(1),
      },
      android: {elevation: 3},
    }),
  },
  clearImageButtonPressed: {
    opacity: 0.9,
  },
  clearImageText: {
    color: colors.white,
    fontSize: size.medium,
    fontFamily: family.inter_bold,
    lineHeight: size.medium,
  },

  // Copy
  title: {
    fontSize: size.large,
    fontFamily: family.inter_bold,
    color: colors.b4,
    textAlign: 'center',
    marginBottom: HP(0.3),
  },
  subtitle: {
    fontSize: size.xtiny,
    fontFamily: family.inter_regular,
    color: colors.g3,
    textAlign: 'center',
    lineHeight: size.small + 2,
    marginBottom: HP(1.5),
    paddingHorizontal: WP(1),
  },

  // Step / actions section
  actionsSection: {
    width: '100%',
    marginBottom: HP(1.2),
  },
  stepLabel: {
    fontSize: size.xtiny,
    fontFamily: family.inter_medium,
    color: colors.g9,
    marginBottom: HP(0.5),
    marginLeft: WP(0.5),
  },
  buttonContainer: {
    width: '100%',
    gap: HP(0.8),
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.p1,
    paddingVertical: HP(1.2),
    paddingHorizontal: WP(3.5),
    borderRadius: WP(3.5),
    ...primaryShadow,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    paddingVertical: HP(1.2),
    paddingHorizontal: WP(3.5),
    borderRadius: WP(3.5),
    borderWidth: 2,
    borderColor: colors.p1,
    ...cardShadow,
  },
  buttonPressed: {
    opacity: 0.88,
  },
  buttonIcon: {
    width: WP(4.5),
    height: WP(4.5),
    marginRight: WP(1.5),
    tintColor: colors.white,
  },
  buttonIconSecondary: {
    tintColor: colors.p1,
  },
  primaryButtonText: {
    fontSize: size.small,
    fontFamily: family.inter_bold,
    color: colors.white,
  },
  secondaryButtonText: {
    fontSize: size.small,
    fontFamily: family.inter_bold,
    color: colors.p1,
  },

  // Scan CTA (when image is set)
  scanSection: {
    width: '100%',
    marginTop: HP(0.3),
    marginBottom: HP(0.5),
  },
  bottomScanSection: {
    position: 'absolute',
    left: WP(3.5),
    right: WP(3.5),
    bottom: HP(9.8),
    zIndex: 10,
  },
  scanButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.p1,
    paddingVertical: HP(1.4),
    paddingHorizontal: WP(3.5),
    borderRadius: WP(3.5),
    ...primaryShadow,
  },
  scanButtonPressed: {
    opacity: 0.9,
  },
  scanButtonText: {
    color: colors.white,
    fontSize: size.small,
    fontFamily: family.inter_bold,
  },
  scanButtonIcon: {
    width: WP(4.5),
    height: WP(4.5),
    marginRight: WP(1.5),
    tintColor: colors.white,
  },
  scanHint: {
    marginTop: HP(0.4),
    fontSize: size.xtiny,
    fontFamily: family.inter_regular,
    color: colors.g9,
    textAlign: 'center',
  },

  // Loading state
  scanningOverlay: {
    marginTop: HP(1),
    alignItems: 'center',
    paddingVertical: HP(1.2),
  },
  scanningText: {
    marginTop: HP(0.6),
    fontSize: size.xtiny,
    fontFamily: family.inter_medium,
    color: colors.g3,
  },
  fullScreenLoaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.32)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  fullScreenLoaderCard: {
    backgroundColor: colors.white,
    borderRadius: WP(4),
    paddingVertical: HP(2),
    paddingHorizontal: WP(6),
    alignItems: 'center',
    justifyContent: 'center',
    ...cardShadow,
  },
  fullScreenLoaderText: {
    marginTop: HP(0.8),
    fontSize: size.small,
    fontFamily: family.inter_medium,
    color: colors.g3,
  },
});

export default styles;
