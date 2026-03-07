import {StyleSheet, Platform} from 'react-native';
import {colors, family, HP, size, WP} from '../../../utilities';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },

  contentContainer: {
    paddingHorizontal: WP(4),
    paddingTop: HP(1.5),
    paddingBottom: HP(14),
  },

  section: {
    marginBottom: HP(2),
  },

  sectionTitle: {
    fontSize: size.small,
    fontFamily: family.inter_medium,
    color: colors.b1,
    marginBottom: HP(0.8),
  },

  sectionLabel: {
    fontSize: size.small,
    fontFamily: family.inter_medium,
    color: colors.b1,
    marginBottom: HP(0.8),
  },

  pickersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: HP(2),
    gap: WP(2),
  },

  pickerContainer: {
    flex: 1,
    minWidth: 0,
  },

  bloodSugarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: WP(3),
    paddingHorizontal: WP(4),
    borderWidth: 1,
    borderColor: colors.g15,
    backgroundColor: colors.g13,
    height: HP(6.5),
  },

  bloodSugarInput: {
    flex: 1,
    fontSize: size.large,
    fontFamily: family.inter_bold,
    color: colors.b1,
    paddingVertical: 0,
    textAlign: 'left',
    paddingRight: WP(2),
  },

  unitText: {
    fontSize: size.small,
    fontFamily: family.inter_medium,
    color: colors.g9,
  },

  unitNote: {
    fontSize: size.xtiny,
    fontFamily: family.inter_regular,
    color: colors.g9,
    marginTop: HP(0.5),
  },

  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: WP(2),
  },

  tagButton: {
    backgroundColor: colors.g13,
    borderRadius: WP(2.5),
    paddingHorizontal: WP(4),
    paddingVertical: HP(1.2),
    borderWidth: 1,
    borderColor: colors.g15,
  },

  tagButtonSelected: {
    backgroundColor: colors.p1,
    borderColor: colors.p1,
  },

  tagContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconStyle: {
    width: WP(3),
    height: HP(1.5),
    tintColor: colors.white,
    marginRight: WP(1),
  },

  tagText: {
    fontSize: size.small,
    fontFamily: family.inter_medium,
    color: colors.b1,
  },

  tagTextSelected: {
    color: colors.white,
    fontSize: size.small,
    fontFamily: family.inter_medium,
  },

  notesInput: {
    borderRadius: WP(3),
    paddingHorizontal: WP(4),
    paddingTop: HP(1.5),
    paddingBottom: HP(1.5),
    fontSize: size.small,
    fontFamily: family.inter_regular,
    color: colors.b1,
    borderWidth: 1,
    borderColor: colors.g15,
    backgroundColor: colors.g13,
    minHeight: HP(12),
    maxHeight: HP(18),
  },

  notesCounter: {
    fontSize: size.xtiny,
    fontFamily: family.inter_medium,
    color: colors.g9,
    textAlign: 'right',
    marginTop: HP(0.4),
  },

  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: WP(4),
    paddingTop: HP(1.5),
    paddingBottom: HP(3),
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.g15,
    ...Platform.select({
      ios: {
        shadowColor: colors.drakBlack,
        shadowOffset: {width: 0, height: HP(-0.15)},
        shadowOpacity: 0.06,
        shadowRadius: WP(2),
      },
      android: {elevation: 4},
    }),
  },

  saveButton: {
    backgroundColor: colors.p1,
    borderRadius: WP(4),
    paddingVertical: HP(1.8),
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveButtonText: {
    color: colors.white,
    fontSize: size.medium,
    fontFamily: family.inter_bold,
  },

  saveButtonDisabled: {
    opacity: 0.7,
  },
});

export {styles};
