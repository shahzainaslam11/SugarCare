import {Platform, StyleSheet} from 'react-native';
import {colors, family, HP, size, WP} from '../utilities';

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
  safeArea: {
    flex: 1,
    backgroundColor: colors.g13,
  },
  headerWrap: {
    paddingHorizontal: WP(1),
    backgroundColor: colors.g13,
  },
  content: {
    paddingHorizontal: WP(3.5),
    paddingBottom: HP(4),
  },
  heroCard: {
    marginTop: HP(0.5),
    borderRadius: WP(4),
    paddingVertical: HP(2),
    paddingHorizontal: WP(4),
    ...primaryShadow,
  },
  title: {
    fontSize: size.h5,
    fontFamily: family.inter_bold,
    color: colors.white,
    lineHeight: size.h5 + 4,
    alignSelf: 'center',
  },
  subtitle: {
    marginTop: HP(0.5),
    fontSize: size.small,
    fontFamily: family.inter_regular,
    color: 'rgba(255,255,255,0.88)',
    lineHeight: size.small + 4,
  },
  creditPill: {
    marginTop: HP(1.2),
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: WP(3),
    paddingHorizontal: WP(3),
    paddingVertical: HP(0.9),
    alignSelf: 'flex-start',
  },
  creditPillLabel: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: size.xtiny,
    fontFamily: family.inter_medium,
  },
  creditPillValue: {
    marginTop: HP(0.2),
    color: colors.white,
    fontSize: size.xxlarge,
    fontFamily: family.inter_bold,
    lineHeight: size.xxlarge + 2,
  },
  plansList: {
    marginTop: HP(1.2),
  },
  loaderContainer: {
    marginTop: HP(2),
    alignItems: 'center',
  },
  loaderText: {
    marginTop: HP(0.6),
    fontSize: size.xtiny,
    fontFamily: family.inter_medium,
    color: colors.g3,
  },
  buyButton: {
    marginTop: HP(1.5),
    borderRadius: WP(3.5),
    backgroundColor: colors.p1,
    paddingVertical: HP(1.2),
    paddingHorizontal: WP(3.5),
    alignItems: 'center',
    ...primaryShadow,
  },
  buyButtonDisabled: {
    opacity: 0.65,
  },
  buyButtonText: {
    color: colors.white,
    fontFamily: family.inter_bold,
    fontSize: size.small,
  },
  restoreButton: {
    marginTop: HP(1),
    borderRadius: WP(3.5),
    borderColor: colors.p1,
    borderWidth: 2,
    paddingVertical: HP(1.1),
    paddingHorizontal: WP(3.5),
    alignItems: 'center',
    backgroundColor: colors.white,
    ...cardShadow,
  },
  restoreButtonDisabled: {
    opacity: 0.65,
  },
  restoreText: {
    color: colors.p1,
    fontFamily: family.inter_bold,
    fontSize: size.small,
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
