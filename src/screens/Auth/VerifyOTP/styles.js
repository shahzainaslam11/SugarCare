import {StyleSheet} from 'react-native';
import {colors, family, HP, size} from '../../../utilities';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    marginHorizontal: 24,
    paddingHorizontal: 28,
    paddingTop: HP(2),
    paddingBottom: HP(4),
    alignItems: 'stretch',
  },
  title: {
    fontSize: 28,
    fontFamily: family.inter_bold,
    color: colors.black,
    textAlign: 'center',
    marginBottom: HP(1),
  },
  subtitle: {
    fontSize: size.medium || 15,
    fontFamily: family.inter_regular,
    color: colors.g1,
    textAlign: 'center',
    marginBottom: HP(2),
    lineHeight: 22,
  },
  emailPill: {
    alignSelf: 'center',
    backgroundColor: colors.g13 || 'rgba(0,0,0,0.06)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: HP(3.5),
  },
  email: {
    fontSize: 15,
    fontFamily: family.inter_medium,
    color: colors.black,
    textAlign: 'center',
  },
  otpWrapper: {
    marginVertical: HP(2.5),
    alignItems: 'center',
  },
  otpBox: {
    width: 50,
    height: 56,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.g4 || '#e5e7eb',
    backgroundColor: colors.white,
    fontSize: 22,
    fontFamily: family.inter_bold,
    color: colors.black,
  },
  resendRow: {
    alignItems: 'center',
    marginTop: HP(2),
    marginBottom: HP(3),
  },
  resendText: {
    fontSize: size.medium || 14,
    fontFamily: family.inter_regular,
    color: colors.g1,
    textAlign: 'center',
  },
  resendLink: {
    color: colors.p1,
    fontFamily: family.inter_bold,
  },
  disabledLink: {
    color: colors.g6,
  },
  timerBadge: {
    marginTop: HP(1.5),
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  timerText: {
    fontSize: 13,
    fontFamily: family.inter_medium,
    color: colors.red || '#ef4444',
  },
  verifyBtn: {
    backgroundColor: colors.p1,
    borderRadius: 14,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
  },
  backLink: {
    marginTop: HP(3),
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backText: {
    color: colors.p1,
    fontSize: size.medium || 15,
    fontFamily: family.inter_medium,
  },
});

export default styles;
