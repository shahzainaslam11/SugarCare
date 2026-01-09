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
  infoContainer: {
    backgroundColor: '#f0f9ff',
    padding: WP(4),
    borderRadius: 12,
    marginTop: HP(1),
    marginBottom: HP(2),
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  infoTitle: {
    fontSize: size.normal,
    fontWeight: '600',
    color: colors.p1,
    marginBottom: HP(0.5),
  },
  infoText: {
    fontSize: size.small,
    color: colors.g9,
    marginBottom: HP(0.3),
  },
  infoNote: {
    fontSize: size.xsmall,
    color: colors.g7,
    fontStyle: 'italic',
    marginTop: HP(0.5),
  },
});

export default styles;
