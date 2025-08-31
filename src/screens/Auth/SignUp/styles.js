import {StyleSheet, Dimensions} from 'react-native';
import {colors, HP, size} from '../../../utilities';

const {width} = Dimensions.get('window');

// Responsive style functions
const getResponsiveInner = screenWidth => ({
  paddingHorizontal: screenWidth < 400 ? 15 : 25,
  borderRadius: 20,
  marginHorizontal: screenWidth < 400 ? 5 : 10,
  paddingVertical: 20,
  alignItems: 'stretch',
});

const getResponsiveTitle = screenWidth => ({
  fontSize: screenWidth < 400 ? 24 : 28,
  fontWeight: '700',
  marginBottom: 5,
  color: '#000',
  textAlign: 'center',
});

const getResponsiveSubtitle = screenWidth => ({
  fontSize: screenWidth < 400 ? 14 : 15,
  color: '#777',
  marginBottom: 20,
  textAlign: 'center',
});

const getResponsiveRow = screenWidth => ({
  flexDirection: screenWidth < 400 ? 'column' : 'row',
  justifyContent: 'space-between',
  width: '100%',
  alignItems: 'center',
  marginBottom: 25,
});

const getResponsiveHalf = screenWidth => ({
  width: screenWidth < 400 ? '100%' : '48%',
  marginBottom: screenWidth < 400 ? 15 : 0,
});

const getResponsiveSignInBtn = screenWidth => ({
  backgroundColor: '#3b82f6',
  paddingVertical: 15,
  borderRadius: 15,
  alignItems: 'center',
  width: '100%',
  marginBottom: 25,
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  inner: {
    // Base styles - responsive styles added via function
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 15,
  },
  title: {
    // Base styles - responsive styles added via function
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
  },
  subtitle: {
    // Base styles - responsive styles added via function
    color: '#777',
    textAlign: 'center',
  },
  row: {
    // Base styles - responsive styles added via function
    width: '100%',
    alignItems: 'center',
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  forgotText: {
    color: colors.p1,
    fontWeight: '600',
    fontFamily: 'Inter-Medium',
    fontSize: size.medium,
  },
  signInBtn: {
    // Base styles - responsive styles added via function
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
    color: colors.g1,
  },
  linkText: {
    color: colors.p1,
    fontWeight: '600',
  },
  createRow: {
    flexDirection: 'row',
    marginTop: HP(4),
    alignSelf: 'center',
  },
  rememberMeText: {
    color: colors.g1,
    fontSize: size.small,
    fontFamily: 'Inter-Medium',
  },
  half: {},
});

// Export the style functions along with the StyleSheet
export default {
  ...styles,
  getResponsiveInner,
  getResponsiveTitle,
  getResponsiveSubtitle,
  getResponsiveRow,
  getResponsiveHalf,
  getResponsiveSignInBtn,
};
