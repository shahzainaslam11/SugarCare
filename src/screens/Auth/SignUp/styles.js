import {StyleSheet} from 'react-native';
import {colors, family, HP, size} from '../../../utilities';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContainer: {
    flexGrow: 1,
    paddingVertical: HP(4),
  },

  inner: {
    borderRadius: 20,
    paddingHorizontal: HP(3),
    paddingVertical: HP(3),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },

  title: {
    fontSize: size.h2,
    fontFamily: family.inter_bold,
    color: colors.black,
    textAlign: 'center',
    marginBottom: HP(0.5),
  },

  subtitle: {
    fontSize: size.medium,
    fontFamily: family.inter_regular,
    color: colors.g1,
    textAlign: 'center',
    marginBottom: HP(3),
  },

  inputWrapper: {
    marginBottom: HP(2),
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  half: {
    width: '48%',
  },

  rowSmall: {
    flexDirection: 'column',
  },

  halfSmall: {
    width: '100%',
    marginBottom: HP(2),
  },

  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: HP(2),
    paddingHorizontal: HP(0.5),
  },

  checkboxLabel: {
    fontSize: size.medium,
    fontFamily: family.inter_medium,
    color: colors.g1,
  },

  signInBtn: {
    backgroundColor: colors.p1,
    paddingVertical: HP(2.2),
    borderRadius: 15,
    alignItems: 'center',
    marginTop: HP(2),
    shadowColor: colors.p1,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },

  signInText: {
    color: colors.white,
    fontSize: size.large,
    fontFamily: family.inter_bold,
  },

  createRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: HP(3),
  },

  createText: {
    fontSize: size.medium,
    color: colors.g1,
    fontFamily: family.inter_regular,
  },

  linkText: {
    fontSize: size.medium,
    color: colors.p1,
    fontFamily: family.inter_bold,
  },
});

export default styles;
