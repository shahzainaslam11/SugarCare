import {StyleSheet} from 'react-native';
import {colors, family, size, WP, HP} from '../../../../utilities';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    paddingBottom: HP('2%'),
  },

  // --- Header/Image Section ---
  imageContainer: {
    width: '100%',
    height: HP('40%'),
  },
  foodImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: HP('5%'),
    left: WP('5%'),
  },
  backIcon: {
    width: WP('5%'),
    height: WP('5%'),
    tintColor: colors.darkGray,
  },

  // --- Main Content ---
  content: {
    paddingHorizontal: WP('5%'),
    paddingTop: HP('2%'),
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: HP('1%'),
    marginBottom: HP('1%'),
  },
  foodName: {
    fontSize: size.large,
    fontWeight: '700',
    color: colors.b1,
    flex: 1,
    marginRight: WP('2%'),
  },
  caloriesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fireIcon: {
    width: WP('3%'),
    height: WP('3%'),
    tintColor: '#FE6C00',
    marginRight: WP('1%'),
  },
  calories: {
    fontSize: size.medium,
    color: colors.darkGray,
    fontWeight: '500',
  },

  // --- Predicted Impact ---
  predictedImpact: {
    backgroundColor: '#F5F5F5',
    padding: WP('4%'),
    borderRadius: WP('3%'),
    marginBottom: HP('2%'),
  },
  impactMessage: {
    fontSize: size.normal,
    fontFamily: family.inter_medium,
    fontWeight: '600',
    color: colors.b1,
    marginBottom: HP('0.5%'),
  },
  impactNote: {
    fontSize: size.small,
    fontFamily: family.inter_medium,
    fontWeight: '400',
    color: colors.p1,
  },

  // --- Suggestion Box ---
  suggestionBox: {
    backgroundColor: '#E0F7FA',
    padding: WP('4%'),
    borderRadius: WP('3%'),
    marginTop: HP('2%'),
  },
  suggestionText: {
    fontSize: size.normal,
    fontFamily: family.inter_medium,
    color: colors.b1,
    fontWeight: '500',
    lineHeight: HP('2.5%'),
  },
  // If you want a simpler design, you can use this instead:
  confidenceBox: {
    backgroundColor: '#F5F29F',
    padding: WP('3%'),
    borderRadius: WP('2%'),
    marginVertical: HP('2%'),
  },
  confidenceText: {
    fontSize: size.normal,
    fontFamily: family.inter_medium,
    fontWeight: '600',
    color: colors.b1,
    textAlign: 'center',
  },
});

export default styles;
