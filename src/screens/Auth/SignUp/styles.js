import {StyleSheet} from 'react-native';
import {colors, family, HP, size, WP} from '../../../utilities';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContainer: {
    flexGrow: 1,
    paddingVertical: HP(1.2),
    paddingHorizontal: WP(5),
    paddingTop: HP(5),
  },

  inner: {
    borderRadius: 0,
    paddingHorizontal: 0,
    marginHorizontal: 0,
    paddingVertical: HP(2.1),
    alignItems: 'stretch',
    backgroundColor: 'transparent',
    borderWidth: 0,
  },

  title: {
    fontSize: size.h1,
    fontFamily: family.inter_bold,
    color: colors.black,
    textAlign: 'center',
    marginBottom: HP(0.5),
    letterSpacing: 0.3,
  },

  subtitle: {
    fontSize: size.small,
    fontFamily: family.inter_regular,
    color: colors.g3,
    textAlign: 'center',
    marginBottom: HP(1.8),
  },

  inputWrapper: {
    marginBottom: HP(2),
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: HP(0.6),
  },

  half: {
    width: '48%',
  },

  rowSmall: {
    flexDirection: 'column',
  },

  halfSmall: {
    width: '100%',
    marginBottom: HP(1.1),
  },

  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: HP(1.1),
    paddingHorizontal: HP(0.5),
  },

  checkboxLabel: {
    fontSize: size.medium,
    fontFamily: family.inter_medium,
    color: colors.g1,
  },

  signInBtn: {
    backgroundColor: '#4257FF',
    minHeight: HP(6.2),
    paddingVertical: HP(1.2),
    borderRadius: WP(3.8),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: HP(0.4),
    shadowColor: '#4257FF',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },

  signInText: {
    color: colors.white,
    fontSize: size.medium,
    fontFamily: family.inter_bold,
    lineHeight: size.medium + 2,
  },

  createRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: HP(1.7),
  },

  createText: {
    fontSize: size.medium,
    color: colors.g1,
    fontFamily: family.inter_regular,
  },

  linkText: {
    fontSize: size.medium,
    color: '#4257FF',
    fontFamily: family.inter_bold,
  },
});

export default styles;
