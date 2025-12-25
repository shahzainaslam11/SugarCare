import {StyleSheet} from 'react-native';
import {colors, HP, size} from '../../../utilities';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    paddingHorizontal: 25,
    borderRadius: 20,
    marginHorizontal: 10,
    paddingVertical: 20,
    alignItems: 'stretch', // makes children take full width
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 5,
    color: '#000',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#777',
    marginBottom: 20,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginBottom: 25,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  forgotText: {
    color: colors.p1,
    fontWeight: '600',
    ffontFamily: 'Inter-Medium',
    fontSize: size.medium,
  },
  signInBtn: {
    backgroundColor: '#3b82f6',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    width: '100%',
    marginBottom: 25,
  },
  signInText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
    color: colors.p1,
    fontWeight: '600',
    // ⭐ CORRECTION: Fix typo 'ffontFamily' to 'fontFamily'
    fontFamily: 'Inter-Medium',
    fontSize: size.medium,
    // Optional: Ensure text itself does not wrap (usually default, but good check)
    // textAlign: 'center',
  },
  createRow: {
    flexDirection: 'row',
    marginTop: HP(4),
    alignSelf: 'center',
    justifyContent: 'center',
  },

  staticText: {
    color: colors.g1,
    fontSize: size.medium,
    fontFamily: 'Inter-Medium',
  },
  rememberMeText: {
    color: colors.g1,
    fontSize: size.small,
    fontFamily: 'Inter-Medium',
  },
});
export default styles;
