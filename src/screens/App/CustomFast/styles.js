import {StyleSheet} from 'react-native';
import {family, size, WP} from '../../../utilities';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: WP('6'),
    paddingTop: WP('2'),
    paddingBottom: WP('10'),
  },
  pickerContainer: {
    marginBottom: WP('4'),
  },
  inputGroup: {
    marginBottom: WP('4'),
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#212529',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  durationText: {
    fontSize: 16,
    color: '#212529',
  },
  notesInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: WP('4'),
  },
  timeInput: {
    flex: 1,
    // marginRight: WP('2'),
  },
  infoBox: {
    backgroundColor: '#e7f5ff',
    borderRadius: 8,
    padding: 16,
    marginBottom: WP('4'),
  },
  infoText: {
    color: '#0a58ca',
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: WP('6'),
    paddingBottom: WP('4'),
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  saveButton: {
    backgroundColor: '#0d6efd',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: size.medium,
    fontFamily: family.inter_bold,
  },
});

export default styles;
