import {StyleSheet} from 'react-native';
import {colors, HP, WP} from '../../../utilities';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: WP(4),
    paddingTop: HP(4),
  },
  contentContainer: {
    paddingTop: HP(2),
    paddingBottom: HP(4),
  },
  section: {
    marginBottom: HP(3),
  },
  sectionTitle: {
    fontSize: WP(5),
    fontWeight: 'bold',
    marginBottom: HP(2),
    color: colors.black,
  },
  sectionLabel: {
    fontSize: WP(4),
    fontWeight: '600',
    color: colors.black,
    marginBottom: HP(1),
  },
  pickersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: HP(2),
  },
  pickerContainer: {
    flex: 1,
    marginHorizontal: WP(1),
  },
  divider: {
    height: 1,
    backgroundColor: colors.grayLight,
    marginVertical: HP(2),
  },
  // ✅ Blood Sugar Input
  bloodSugarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: HP(1),
    borderBottomWidth: 2,
    borderBottomColor: colors.p1,
    paddingBottom: HP(0.5),
  },
  bloodSugarInput: {
    fontSize: WP(8),
    fontWeight: 'bold',
    color: colors.black,
    minWidth: WP(20),
    textAlign: 'center',
    marginRight: WP(2),
  },
  unitText: {
    fontSize: WP(4),
    color: colors.gray,
    fontWeight: '600',
  },
  unitNote: {
    fontSize: WP(3.5),
    color: colors.gray,
    fontStyle: 'italic',
    marginTop: HP(0.5),
  },
  // ✅ Tags
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: HP(1),
  },
  tagButton: {
    backgroundColor: colors.grayLight,
    paddingVertical: HP(1.5),
    paddingHorizontal: WP(3),
    borderRadius: WP(2),
    marginRight: WP(2),
    marginBottom: HP(1),
    borderWidth: 1,
    borderColor: colors.grayLight,
  },
  tagButtonSelected: {
    backgroundColor: colors.p1,
    borderColor: colors.p1,
  },
  tagContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagText: {
    fontSize: WP(4),
    color: colors.gray,
    fontWeight: '600',
  },
  tagTextSelected: {
    color: colors.white,
    fontWeight: 'bold',
  },
  // ✅ Notes
  notesInput: {
    borderWidth: 1,
    borderColor: colors.grayLight,
    borderRadius: WP(2),
    padding: WP(3),
    minHeight: HP(10),
    fontSize: WP(4),
    textAlignVertical: 'top',
    marginBottom: HP(1),
  },
  notesCounter: {
    fontSize: WP(3.5),
    color: colors.gray,
    textAlign: 'right',
  },
  // ✅ Save Button
  buttonContainer: {
    paddingHorizontal: WP(6),
    paddingBottom: HP(3),
    backgroundColor: colors.white,
  },
  saveButton: {
    backgroundColor: colors.p1,
    paddingVertical: HP(2),
    borderRadius: WP(3),
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.white,
    fontSize: WP(4.5),
    fontWeight: 'bold',
  },
  iconStyle: {
    width: WP(5),
    height: HP(3),
    marginRight: WP(1),
  },
});
