import {StyleSheet} from 'react-native';
import {colors, family, HP, size, WP} from '../../../utilities';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    paddingBottom: HP(4),
  },
  searchContainer: {
    paddingHorizontal: WP(4),
    paddingTop: HP(2),
    paddingBottom: HP(1),
  },
  searchWrapper: {
    position: 'relative',
  },
  searchInput: {
    height: 52,
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: WP(4),
    fontSize: size.normal,
    fontFamily: family.inter_regular,
    color: colors.b1,
    borderWidth: 1.5,
    borderColor: colors.g15,
  },
  clearButton: {
    position: 'absolute',
    right: WP(4),
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
  clearButtonText: {
    fontSize: size.large,
    color: colors.g9,
    fontWeight: '300',
  },
  featuredSection: {
    paddingHorizontal: WP(4),
    paddingVertical: HP(2),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HP(2.5),
  },
  sectionTitle: {
    fontSize: size.xlarge,
    fontWeight: '700',
    color: colors.b1,
    fontFamily: family.inter_bold,
    letterSpacing: -0.3,
  },
  featuredBadge: {
    backgroundColor: colors.p1,
    paddingHorizontal: WP(3),
    paddingVertical: HP(0.6),
    borderRadius: 6,
  },
  featuredBadgeText: {
    color: colors.white,
    fontSize: size.xsmall,
    fontWeight: '700',
    fontFamily: family.inter_bold,
    letterSpacing: 0.5,
  },
  featuredCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.b1,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  featuredImageContainer: {
    position: 'relative',
    height: 200,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  featuredContent: {
    padding: WP(4),
  },
  featuredTitle: {
    fontSize: size.large,
    fontWeight: '700',
    color: colors.b1,
    fontFamily: family.inter_bold,
    marginBottom: HP(1),
    lineHeight: 24,
  },
  featuredDescription: {
    fontSize: size.normal,
    color: colors.g9,
    fontFamily: family.inter_regular,
    lineHeight: 22,
    marginBottom: HP(2),
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readMoreButton: {
    backgroundColor: colors.p1,
    paddingHorizontal: WP(4),
    paddingVertical: HP(1.2),
    borderRadius: 8,
  },
  readMoreButtonText: {
    color: colors.white,
    fontSize: size.normal,
    fontWeight: '600',
    fontFamily: family.inter_semibold,
  },
  readTime: {
    fontSize: size.small,
    color: colors.g9,
    fontFamily: family.inter_regular,
    backgroundColor: colors.g15,
    paddingHorizontal: WP(2),
    paddingVertical: HP(0.5),
    borderRadius: 4,
  },
  exploreSection: {
    paddingHorizontal: WP(4),
    paddingVertical: HP(2),
  },
  exploreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HP(2.5),
  },
  resultsCount: {
    fontSize: size.small,
    color: colors.g9,
    fontFamily: family.inter_regular,
  },
  exploreCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: HP(2),
    padding: WP(3),
    alignItems: 'stretch', // Changed from 'center' to 'stretch'
    shadowColor: colors.b1,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    minHeight: 100, // Added minimum height
  },
  exploreImageContainer: {
    width: 80, // Increased from 70
    height: 80, // Increased from 70
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: WP(3), // Changed from marginLeft to marginRight
  },
  exploreImage: {
    width: '100%',
    height: '100%',
  },
  exploreContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1, // Added to take available space
    marginBottom: HP(1), // Added spacing
  },
  exploreTitle: {
    fontSize: size.normal,
    fontWeight: '600',
    color: colors.b1,
    fontFamily: family.inter_semibold,
    lineHeight: 22, // Added line height for better text rendering
    // Removed marginBottom as it's now handled by titleContainer
  },
  exploreFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto', // Push to bottom
  },
  exploreTime: {
    fontSize: size.small,
    color: colors.g9,
    fontFamily: family.inter_regular,
    flexShrink: 1, // Allow text to shrink if needed
  },
  arrowContainer: {
    width: WP(10),
    height: HP(3.5),
    borderRadius: 6,
    backgroundColor: colors.g15,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0, // Prevent arrow from shrinking
    marginLeft: WP(2), // Added left margin
  },
  arrowImage: {
    width: WP(5),
    height: HP(2),
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: HP(6),
    backgroundColor: colors.g15,
    borderRadius: 12,
  },
  emptyStateTitle: {
    fontSize: size.large,
    fontWeight: '600',
    color: colors.b1,
    fontFamily: family.inter_semibold,
    marginBottom: HP(1),
  },
  emptyStateText: {
    fontSize: size.normal,
    color: colors.g9,
    fontFamily: family.inter_regular,
    textAlign: 'center',
    paddingHorizontal: WP(4),
  },
});

export default styles;
