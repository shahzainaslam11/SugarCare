import {StyleSheet} from 'react-native';
import {colors, family, HP, size} from '../../../utilities';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 20,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: size.h1,
    fontFamily: family.inter_bold,
    textAlign: 'center',
    color: '#000',
    marginBottom: HP(1),
  },
  subtitle: {
    fontSize: size.small,
    fontFamily: family.inter_bold,
    textAlign: 'center',
    marginBottom: HP(3),
    color: '#777',
    // lineHeight: 10,
  },
  form: {
    width: '100%',
  },
  confirmBtn: {
    backgroundColor: '#2563eb',
    marginTop: 10,
    borderRadius: 30,
    paddingVertical: 16,
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  backLink: {
    marginTop: 30,
    alignSelf: 'center',
    color: colors.p1,
    fontWeight: '600',
    fontSize: size.medium,
    fontFamily: family.inter_bold,
  },
  backText: {
    color: colors.p1,
    fontWeight: '600',
    fontSize: size.medium,
    fontFamily: family.inter_bold,
  },
});

export default styles;
