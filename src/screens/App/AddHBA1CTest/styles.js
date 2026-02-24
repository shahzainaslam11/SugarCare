import {Platform, StyleSheet} from 'react-native';
import {colors, family, HP, size, WP} from '../../../utilities';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.g13,
    paddingHorizontal: WP(4),
  },
  listContainer: {
    paddingVertical: HP(1.5),
    paddingBottom: HP(12),
  },
  cardWrapper: {
    marginBottom: HP(1),
    borderRadius: 16,
  },
  cardPressed: {
    opacity: 0.92,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    ...Platform.select({
      ios: {
        shadowColor: '#4252FF',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  cardContent: {
    flex: 1,
    paddingVertical: HP(1.5),
    paddingHorizontal: WP(4),
    paddingLeft: WP(4.5),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: WP(11),
    height: WP(11),
    borderRadius: WP(5.5),
    backgroundColor: colors.p6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: WP(2.5),
  },
  icon: {
    width: WP(5),
    height: HP(2.5),
    tintColor: colors.p1,
  },
  valueText: {
    fontFamily: family.inter_bold,
    fontSize: size.h5,
    color: colors.b4,
    letterSpacing: -0.5,
  },
  valueLabel: {
    fontFamily: family.inter_medium,
    fontSize: size.xxsmall,
    color: colors.g3,
    marginTop: 1,
  },
  statusPill: {
    paddingHorizontal: WP(2.5),
    paddingVertical: HP(0.5),
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.15,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statusText: {
    fontFamily: family.inter_bold,
    fontSize: size.xsmall,
    color: colors.white,
    letterSpacing: 0.3,
  },
  normalStatus: {
    backgroundColor: colors.gr1,
  },
  prediabetesStatus: {
    backgroundColor: colors.bw1,
  },
  type1Status: {
    backgroundColor: colors.r2,
  },
  type2Status: {
    backgroundColor: colors.r2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.g15,
    marginVertical: HP(0.8),
  },
  dateText: {
    fontFamily: family.inter_regular,
    fontSize: size.small,
    color: colors.g3,
    marginBottom: HP(0.2),
  },
  notesLabel: {
    fontFamily: family.inter_bold,
    fontSize: size.small,
    color: colors.b1,
  },
  notesText: {
    fontFamily: family.inter_regular,
    fontSize: size.small,
    color: colors.g2,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: HP(8),
    paddingHorizontal: WP(6),
  },
  emptyIconBg: {
    width: WP(20),
    height: WP(20),
    borderRadius: WP(10),
    backgroundColor: colors.p6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: HP(2),
  },
  emptyIcon: {
    width: WP(10),
    height: HP(5),
    tintColor: colors.p1,
  },
  emptyTitle: {
    fontFamily: family.inter_bold,
    fontSize: size.large,
    color: colors.b1,
    marginBottom: HP(0.5),
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: family.inter_regular,
    fontSize: size.small,
    color: colors.g3,
    textAlign: 'center',
  },
});

export default styles;
