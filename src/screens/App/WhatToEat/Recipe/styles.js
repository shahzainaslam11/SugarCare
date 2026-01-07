import {StyleSheet} from 'react-native';
import {colors, family, HP, size, WP} from '../../../../utilities';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: HP(4),
  },

  // Image Section
  imageContainer: {
    width: '100%',
    height: HP(30),
    position: 'relative',
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: HP(2),
    right: WP(4),
  },
  mealTypeBadge: {
    backgroundColor: colors.p1,
    color: colors.white,
    paddingHorizontal: WP(3),
    paddingVertical: HP(0.5),
    borderRadius: 15,
    fontSize: size.small,
    fontFamily: family.inter_medium,
    fontWeight: '600',
  },

  // Content
  content: {
    paddingHorizontal: WP(4),
    marginTop: HP(-2),
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: HP(3),
  },

  // Header Section - Updated: removed flexDirection and calories-related styles
  headerSection: {
    marginBottom: HP(2),
  },
  recipeTitle: {
    fontSize: size.xxlarge,
    fontWeight: '700',
    color: colors.b1,
    fontFamily: family.inter_bold,
    lineHeight: 32,
  },
  // REMOVED: caloriesBadge and caloriesText styles

  // Quick Info
  quickInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: WP(3),
    borderRadius: 16,
    marginBottom: HP(2),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickInfoItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickInfoValue: {
    fontSize: size.large,
    fontFamily: family.inter_bold,
    color: colors.p1,
    marginBottom: HP(0.3),
  },
  quickInfoLabel: {
    fontSize: size.small,
    color: colors.g9,
    fontFamily: family.inter_regular,
  },

  // Nutrition Card
  nutritionCardContainer: {
    marginBottom: HP(2.5),
  },

  // Personalized Info
  personalizedInfo: {
    backgroundColor: '#f0f9ff',
    padding: WP(4),
    borderRadius: 16,
    marginBottom: HP(2.5),
    borderLeftWidth: 4,
    borderLeftColor: colors.p1,
  },
  personalizedTitle: {
    fontSize: size.normal,
    fontWeight: '600',
    color: colors.b1,
    fontFamily: family.inter_bold,
    marginBottom: HP(0.5),
  },
  personalizedText: {
    fontSize: size.normal,
    color: colors.g9,
    fontFamily: family.inter_regular,
    marginBottom: HP(1),
  },
  giInfoContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: WP(3),
    paddingVertical: HP(1),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  giInfoText: {
    fontSize: size.small,
    color: colors.g9,
    fontFamily: family.inter_regular,
  },
  giInfoValue: {
    color: colors.p1,
    fontFamily: family.inter_bold,
    fontWeight: '600',
  },

  // Sections
  section: {
    backgroundColor: colors.white,
    padding: WP(4),
    borderRadius: 16,
    marginBottom: HP(2),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: size.large,
    fontWeight: '600',
    color: colors.b1,
    fontFamily: family.inter_medium,
    marginBottom: HP(1.5),
  },

  // Description
  description: {
    fontSize: size.normal,
    color: colors.g9,
    fontFamily: family.inter_regular,
    lineHeight: 24,
  },

  // Ingredients
  ingredientsList: {
    marginLeft: WP(1),
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: HP(1),
  },
  ingredientBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.p1,
    marginRight: WP(3),
  },
  ingredientText: {
    fontSize: size.normal,
    color: colors.g9,
    fontFamily: family.inter_regular,
    flex: 1,
  },

  // Instructions
  instructions: {
    fontSize: size.normal,
    color: colors.g9,
    fontFamily: family.inter_regular,
    lineHeight: 24,
  },

  // Benefits
  benefitsList: {
    marginLeft: WP(1),
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: HP(1),
  },
  benefitText: {
    fontSize: size.normal,
    color: colors.g9,
    fontFamily: family.inter_regular,
    lineHeight: 22,
    flex: 1,
  },

  // Serving Suggestions
  servingSuggestions: {
    fontSize: size.normal,
    color: colors.g9,
    fontFamily: family.inter_regular,
    lineHeight: 24,
  },
});

export default styles;
