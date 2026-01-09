import {StyleSheet} from 'react-native';
import {colors, family, HP, size, WP} from '../../../utilities';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  searchContainer: {
    padding: WP(4),
    backgroundColor: colors.white,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: colors.g15,
    borderRadius: 8,
    paddingHorizontal: WP(3),
    fontSize: size.normal,
    fontFamily: family.inter_regular,
    color: colors.b1,
    backgroundColor: colors.white,
  },
  featuredSection: {
    padding: WP(4),
    backgroundColor: colors.white,
    marginTop: HP(1),
  },
  sectionTitle: {
    fontSize: size.large,
    fontWeight: '600',
    color: colors.b1,
    fontFamily: family.inter_medium,
    marginBottom: HP(1),
  },
  featuredCard: {
    backgroundColor: colors.g15,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featuredImage: {
    width: '100%',
    height: 200,
  },
  featuredText: {
    padding: WP(3),
  },
  featuredTitle: {
    fontSize: size.xlarge,
    fontWeight: '600',
    color: colors.b1,
    fontFamily: family.inter_bold,
    marginBottom: HP(0.5),
  },
  featuredDescription: {
    fontSize: size.normal,
    color: colors.g9,
    fontFamily: family.inter_regular,
  },
  readMore: {
    color: colors.p1,
    fontFamily: family.inter_medium,
  },
  exploreSection: {
    padding: WP(4),
    backgroundColor: colors.white,
  },
  exploreCard: {
    flexDirection: 'row',
    backgroundColor: colors.g15,
    borderRadius: 12,
    marginBottom: HP(1),
    padding: WP(2),
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  exploreImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: WP(2),
  },
  exploreText: {
    flex: 1,
  },
  exploreTitle: {
    fontSize: size.normal,
    color: colors.b1,
    fontFamily: family.inter_medium,
    marginBottom: HP(0.5),
  },
  exploreTime: {
    fontSize: size.small,
    color: colors.g9,
    fontFamily: family.inter_regular,
  },
});

export default styles;
