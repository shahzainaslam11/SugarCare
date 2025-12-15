import {StyleSheet} from 'react-native';
import {colors, family, HP, size, WP} from '../../../../utilities';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: WP(4),
  },
  scrollContent: {
    paddingBottom: HP(4),
  },
  formContainer: {
    borderRadius: 12,
    paddingVertical: HP(2.5),
    marginTop: HP(2),
    shadowColor: colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: HP(2),
  },
  pickerContainer: {
    flex: 1,
    marginRight: WP(2),
    width: '48%',
  },
  inputContainer: {
    marginBottom: HP(2),
  },
  label: {
    fontSize: size.medium,
    fontFamily: family.inter_bold,
    color: colors.b1,
    marginBottom: HP(0.5),
  },
  input: {
    fontSize: size.medium,
    fontFamily: family.inter_medium,
    color: colors.b1,
    borderWidth: 1,
    borderColor: colors.g14,
    borderRadius: 10,
    paddingVertical: HP(1.4),
    paddingHorizontal: WP(3),
    backgroundColor: colors.white,
  },
  notesInput: {
    height: HP(15),
    textAlignVertical: 'top',
  },
  buttonContainer: {
    paddingVertical: HP(2),
  },
});

export default styles;
