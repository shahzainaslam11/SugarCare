import {StyleSheet} from 'react-native';
import {colors, family, HP, size, WP} from '../../../../utilities';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: WP(4),
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    margin: WP(2),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  insightImage: {
    width: '100%',
    height: 300,
  },
  content: {
    // padding: WP(4),
    paddingVertical: HP(2),
  },
  insightTitle: {
    fontSize: size.xlarge,
    fontWeight: '600',
    color: colors.b1,
    fontFamily: family.inter_bold,
    marginBottom: HP(1),
  },
  description: {
    fontSize: size.normal,
    color: colors.g9,
    fontFamily: family.inter_regular,
    lineHeight: 22,
  },
});

export default styles;
