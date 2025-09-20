import {StyleSheet} from 'react-native';
import {HP} from '../../../utilities';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: HP(4),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F5F5F5',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginLeft: 10,
  },
  iconButton: {
    padding: 8,
  },
  icon: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  streak: {
    fontSize: 16,
    marginBottom: 16,
    color: '#000',
  },
  noFastText: {
    textAlign: 'center',
    marginVertical: 16,
    color: '#666',
    fontSize: 14,
  },
  trackerContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  timeItem: {
    alignItems: 'center',
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  separator: {
    width: 1,
    height: '100%',
    backgroundColor: '#e0e0e0',
  },
  separatorLine: {
    width: '100%',
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  progressWrapper: {
    alignItems: 'center',
    marginVertical: 16,
    justifyContent: 'center',
  },
  remaining: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    marginTop: 10,
  },
  endFastingButton: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4252FF',
    width: '100%',
  },
  endFastingText: {
    color: '#4252FF',
    textAlign: 'center',
    fontWeight: '500',
  },
  button: {
    padding: 12,
    backgroundColor: '#4252FF',
    borderRadius: 8,
    width: '100%',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
  },
  plusIcon: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default styles;
