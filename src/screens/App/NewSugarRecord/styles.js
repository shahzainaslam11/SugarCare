import {StyleSheet, Platform} from 'react-native';

import {family, HP, size, WP} from '../../../utilities';
import {Fonts} from '../../../assets/fonts';

const SPACING_HORIZONTAL = WP('4');
const BLUE = '#4A4CFF';
const GRAY_TEXT = '#8C8C8C';
const LIGHT_GRAY_BG = '#F0F0F0';
const BORDER_COLOR = '#E0E0E0';
const BLACK = '#333333';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  contentContainer: {
    paddingHorizontal: SPACING_HORIZONTAL,
    paddingVertical: 15,
  },

  sectionTitle: {
    // Used for Date, Time, Blood Sugar Value
    fontSize: size.medium,
    fonrtfamily: family.inter_medium,
    color: BLACK,
    marginBottom: 8,
    fontWeight: '500',
  },
  sectionLabel: {
    // Used for 'Tag' and 'Notes'
    fontSize: 16,
    fontWeight: '600',
    color: BLACK,
    marginBottom: 10,
  },
  // --- Date/Time Pickers Row ---
  pickersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pickerContainer: {
    width: '48%',
  },
  // --- Blood Sugar Input ---
  bloodSugarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // backgroundColor: LIGHT_GRAY_BG,
    borderRadius: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    height: WP('14'), // Dynamic height using WP for better responsiveness
  },
  bloodSugarInput: {
    flex: 1,
    fontSize: size.medium,
    fontWeight: 'bold',
    color: BLACK,
    paddingVertical: 0,
    textAlign: 'left',
  },
  unitText: {
    fontSize: 16,
    fontWeight: '500',
    color: BLACK,
    paddingLeft: 10,
  },
  unitNote: {
    fontSize: size.small,
    fontFamily: family.inter_regular,
    color: GRAY_TEXT,
    marginVertical: HP(0.5),
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: WP(3),
    marginVertical: HP(1),
  },
  tagButton: {
    backgroundColor: LIGHT_GRAY_BG,
    borderRadius: 8,
    paddingHorizontal: WP(4),
    paddingVertical: WP(2),
  },
  tagButtonSelected: {
    backgroundColor: BLUE,
  },
  tagContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconStyle: {
    width: WP(3),
    height: HP(2),
    tintColor: '#FFFFFF',
    marginRight: WP(1),
  },
  tagText: {
    fontSize: size.medium,
    fontFamily: family.inter_medium,
    color: BLACK,
  },
  tagTextSelected: {
    color: '#FFFFFF',
    fontSize: size.medium,
    fontFamily: family.inter_medium,
  },
  // --- Notes ---
  notesInput: {
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingTop: 15,
    fontSize: 16,
    color: BLACK,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    height: HP('13'),
  },
  notesCounter: {
    fontSize: size.small,
    fontFamily: family.inter_medium,
    color: GRAY_TEXT,
    textAlign: 'right',
    marginTop: HP(0.5),
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING_HORIZONTAL,
    paddingVertical: WP('5'),
    backgroundColor: '#FFFFFF',
    shadowColor: BLACK,
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  saveButton: {
    backgroundColor: BLUE,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: size.medium,
    fontFamily: family.inter_bold,
  },
});
