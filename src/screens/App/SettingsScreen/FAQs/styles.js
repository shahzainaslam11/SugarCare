import {StyleSheet, Platform} from 'react-native';
import {colors, family, HP, size, WP} from '../../../../utilities';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerWrapper: {
    backgroundColor: colors.white,
    paddingHorizontal: WP(4),
    paddingBottom: HP(0.8),
    borderBottomWidth: 1,
    borderBottomColor: colors.g15,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: HP(2),
    paddingHorizontal: WP(4),
  },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.p6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: HP(1),
  },
  heroTitle: {
    fontSize: size.medium,
    fontFamily: family.inter_bold,
    color: colors.b1,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: size.xtiny,
    fontFamily: family.inter_regular,
    color: colors.g9,
    marginTop: HP(0.4),
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: WP(2),
    paddingBottom: HP(6),
  },
  faqCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    marginBottom: HP(1.2),
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.g15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {elevation: 3},
    }),
  },
  faqAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: HP(1.3),
    paddingHorizontal: WP(3),
    paddingLeft: WP(4),
  },
  questionNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.p6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: WP(2.5),
  },
  questionNumText: {
    fontSize: size.xtiny,
    fontFamily: family.inter_bold,
    color: colors.p1,
  },
  questionText: {
    flex: 1,
    fontSize: size.small,
    fontFamily: family.inter_medium,
    color: colors.b1,
    lineHeight: 20,
  },
  expandIcon: {
    marginLeft: WP(1),
  },
  answerContainer: {
    marginHorizontal: WP(3),
    marginBottom: HP(1.2),
    marginLeft: WP(4),
    paddingVertical: HP(1),
    paddingHorizontal: WP(2),
    paddingLeft: WP(3.5),
    backgroundColor: '#F0F7FF',
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: colors.p1,
  },
  answer: {
    fontSize: size.xtiny,
    fontFamily: family.inter_regular,
    color: colors.g3,
    lineHeight: 20,
  },
});

export default styles;
