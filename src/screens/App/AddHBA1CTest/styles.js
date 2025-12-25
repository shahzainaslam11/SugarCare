import {StyleSheet} from 'react-native';
import {colors, family, HP, size, WP} from '../../../utilities';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgColor,
    paddingHorizontal: WP(4),
  },
  listContainer: {
    paddingVertical: HP(1.5),
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: HP(1.5),
    paddingVertical: HP(2),
    paddingHorizontal: WP(4),
    borderWidth: 1,
    borderColor: colors.g14,
    shadowColor: colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: WP(7),
    height: HP(3.5),
    marginRight: WP(2),
  },
  valueText: {
    fontFamily: family.inter_bold,
    fontSize: size.large,
    color: colors.black,
  },
  statusContainer: {
    paddingHorizontal: WP(3),
    paddingVertical: HP(0.5),
    borderRadius: 14,
  },
  statusText: {
    fontFamily: family.inter_medium,
    fontSize: size.xsmall,
    color: colors.white,
  },
  normalStatus: {
    backgroundColor: colors.gr1,
  },
  prediabetesStatus: {
    backgroundColor: colors.bw1,
  },
  type1Status: {
    backgroundColor: colors.r1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.g15,
    marginVertical: HP(1),
  },
  dateText: {
    fontFamily: family.inter_regular,
    fontSize: size.small,
    color: colors.g3,
    marginBottom: HP(0.5),
  },
  notesText: {
    fontFamily: family.inter_medium,
    fontSize: size.normal,
    color: colors.g2,
  },
  notesLabel: {
    fontFamily: family.inter_bold,
    color: colors.black,
  },
});

export default styles;
