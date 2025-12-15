// styles.js
import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {flex: 1},
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
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#777',
    textAlign: 'center',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  otpBox: {
    width: 50,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  resendRow: {
    alignItems: 'center',
    marginBottom: 30,
  },
  resendText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  resendLink: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  disabledLink: {
    color: '#aaa',
  },
  timerText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
    marginTop: 8,
  },
  verifyBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 30,
    paddingVertical: 16,
  },
  backLink: {
    marginTop: 30,
    alignSelf: 'center',
  },
  backText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default styles;
