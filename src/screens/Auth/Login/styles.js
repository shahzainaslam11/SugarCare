import {Platform, StyleSheet} from 'react-native';
import {colors, family, HP, size, WP} from '../../../utilities';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: HP(1.2),
    paddingHorizontal: WP(5),
  },
  inner: {
    paddingHorizontal: 0,
    borderRadius: 0,
    marginHorizontal: 0,
    paddingVertical: HP(2.1),
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    alignItems: 'stretch',
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 15,
  },
  logo: {
    width: WP(20),
    height: WP(20),
    alignSelf: 'center',
    marginBottom: HP(1.2),
  },
  title: {
    fontSize: size.h1,
    fontWeight: '800',
    marginBottom: HP(0.25),
    color: colors.black,
    textAlign: 'center',
    fontFamily: family.inter_bold,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: size.small,
    color: colors.g3,
    marginBottom: HP(1.8),
    textAlign: 'center',
    fontFamily: family.inter_regular,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginBottom: HP(1.7),
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  forgotText: {
    color: colors.p1,
    fontWeight: '600',
    fontFamily: family.inter_medium,
    fontSize: size.small,
  },
  signInBtn: {
    backgroundColor: '#4257FF',
    minHeight: HP(6.2),
    paddingVertical: HP(1.2),
    borderRadius: WP(3.8),
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: HP(0.2),
    marginBottom: HP(1.1),
    borderWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#4257FF',
        shadowOffset: {width: 0, height: 6},
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {elevation: 6},
    }),
  },
  signInText: {
    color: colors.white,
    fontSize: size.medium,
    fontWeight: '700',
    fontFamily: family.inter_bold,
    lineHeight: size.medium + 2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#777',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 15,
    justifyContent: 'center',
  },
  socialBtn: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  socialIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  createText: {
    color: '#4257FF',
    fontWeight: '600',
    fontFamily: family.inter_medium,
    fontSize: size.small,
  },
  createRow: {
    flexDirection: 'row',
    marginTop: HP(1.7),
    alignSelf: 'center',
    justifyContent: 'center',
  },

  staticText: {
    color: colors.g1,
    fontSize: size.small,
    fontFamily: family.inter_medium,
  },
  rememberMeText: {
    color: colors.g1,
    fontSize: size.small,
    fontFamily: family.inter_medium,
  },
});
export default styles;
