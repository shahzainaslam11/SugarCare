import {StyleSheet} from 'react-native';
import {colors, family, HP, size, WP} from '../../../../utilities';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  scrollContent: {
    paddingHorizontal: WP(5),
    paddingTop: HP(3),
    paddingBottom: HP(12), // space for fixed button
  },

  label: {
    fontSize: size.normal,
    fontFamily: family.semiBold,
    color: '#000',
    marginBottom: HP(1),
  },

  footer: {
    paddingHorizontal: WP(5),
    paddingBottom: HP(3),
    paddingTop: HP(2),
    backgroundColor: '#fff',
  },
  formSection: {
    marginBottom: HP(0),
  },
});

export default styles;
