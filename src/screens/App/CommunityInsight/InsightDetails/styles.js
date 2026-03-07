import {StyleSheet} from 'react-native';
import {colors, family, HP, size, WP} from '../../../../utilities';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: HP(6),
    flexGrow: 1,
  },
  heroWrap: {
    width: '100%',
    height: 280,
    backgroundColor: colors.g15,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  headerSafe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: WP(4),
    paddingTop: HP(0.5),
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: colors.b1,
  },
  contentCard: {
    marginTop: -24,
    marginHorizontal: WP(4),
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingHorizontal: WP(5),
    paddingTop: HP(2.5),
    paddingBottom: HP(4),
    shadowColor: colors.b1,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: HP(1.5),
    gap: 8,
  },
  readTimeChip: {
    backgroundColor: colors.p12,
    paddingHorizontal: WP(3),
    paddingVertical: HP(0.6),
    borderRadius: 8,
  },
  readTimeText: {
    fontSize: size.small,
    fontFamily: family.inter_bold,
    color: colors.p2,
  },
  insightBadge: {
    backgroundColor: colors.g15,
    paddingHorizontal: WP(3),
    paddingVertical: HP(0.6),
    borderRadius: 8,
  },
  insightBadgeText: {
    fontSize: size.small,
    fontFamily: family.inter_medium,
    color: colors.g1,
  },
  insightTitle: {
    fontSize: 22,
    fontFamily: family.inter_bold,
    fontWeight: '700',
    color: colors.b1,
    lineHeight: 30,
    letterSpacing: -0.3,
    marginBottom: HP(2),
  },
  divider: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.p1,
    marginBottom: HP(2.5),
    opacity: 0.9,
  },
  description: {
    fontSize: size.normal,
    fontFamily: family.inter_regular,
    color: colors.g1,
    lineHeight: 26,
    letterSpacing: 0.1,
  },
});

export default styles;
