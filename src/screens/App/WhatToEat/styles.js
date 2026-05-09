import {Platform, StyleSheet} from 'react-native';
import {colors, family, HP, size, WP} from '../../../utilities';

const cardShadow = Platform.select({
  ios: {
    shadowColor: colors.drakBlack,
    shadowOffset: {width: 0, height: HP(0.3)},
    shadowOpacity: 0.08,
    shadowRadius: WP(2.5),
  },
  android: {elevation: 3},
});

const cardBorder = {
  borderWidth: 1,
  borderColor: colors.g15,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    paddingBottom: HP(2),
    paddingHorizontal: WP(2),
  },
  mealTypeScroll: {
    marginHorizontal: WP(2),
    marginBottom: HP(0.5),
  },
  mealTypeScrollContent: {
    flexDirection: 'row',
    paddingVertical: HP(0.5),
    paddingHorizontal: WP(1),
    paddingRight: WP(8),
    alignItems: 'center',
    gap: WP(1.5),
  },
  mealTypeButton: {
    paddingVertical: HP(1),
    paddingHorizontal: WP(3.5),
    borderRadius: WP(4),
    backgroundColor: colors.g15,
    flexShrink: 0,
    minWidth: WP(20),
    minHeight: HP(4),
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: colors.p1,
  },
  mealTypeText: {
    color: colors.b1,
    fontSize: size.small,
    fontFamily: family.inter_medium,
    lineHeight: size.small + 2,
    textAlign: 'center',
  },
  mealTypeTextActive: {
    color: colors.white,
    fontSize: size.small,
    fontFamily: family.inter_medium,
    lineHeight: size.small + 2,
    textAlign: 'center',
  },
  suggestedMealSection: {
    paddingVertical: HP(1.5),
    paddingHorizontal: WP(4),
    backgroundColor: colors.white,
    marginTop: HP(0.5),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: HP(1),
  },
  sectionAccent: {
    width: WP(1),
    height: HP(2),
    backgroundColor: colors.p1,
    borderRadius: 2,
    marginRight: WP(1.5),
  },
  sectionTitle: {
    fontSize: size.medium,
    fontFamily: family.inter_medium,
    color: colors.b4,
  },
  mealCard: {
    backgroundColor: colors.white,
    borderRadius: WP(4),
    overflow: 'hidden',
    ...cardShadow,
    ...cardBorder,
  },
  mealImageContainer: {
    width: '100%',
    height: HP(22),
    position: 'relative',
  },
  mealImage: {
    width: '100%',
    height: '100%',
  },
  mealImageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  mealBadge: {
    position: 'absolute',
    top: HP(1),
    right: WP(3),
    backgroundColor: colors.p1,
    paddingVertical: HP(0.35),
    paddingHorizontal: WP(2.5),
    borderRadius: WP(3),
  },
  mealBadgeText: {
    fontSize: size.xtiny,
    fontFamily: family.inter_medium,
    color: colors.white,
  },
  mealCardContent: {
    paddingVertical: HP(1.2),
    paddingHorizontal: WP(3.5),
  },
  mealName: {
    fontSize: size.medium,
    fontFamily: family.inter_bold,
    color: colors.b4,
    marginBottom: HP(0.35),
  },
  mealDescription: {
    fontSize: size.xtiny,
    fontFamily: family.inter_medium,
    color: colors.g9,
    lineHeight: size.small * 1.3,
  },
  alternativesSection: {
    paddingVertical: HP(1.2),
    paddingHorizontal: WP(4),
    backgroundColor: colors.white,
  },
  alternativeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: WP(3.5),
    marginBottom: HP(1.2),
    paddingVertical: HP(1.2),
    paddingHorizontal: WP(3),
    paddingLeft: WP(3.8),
    overflow: 'hidden',
    position: 'relative',
    ...cardShadow,
    ...cardBorder,
  },
  alternativeAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: WP(1),
    backgroundColor: colors.p1,
  },
  alternativeImage: {
    width: WP(14),
    height: WP(14),
    borderRadius: WP(2.5),
    marginRight: WP(3),
    borderWidth: 1,
    borderColor: colors.p6,
  },
  alternativeText: {
    flex: 1,
  },
  alternativeName: {
    fontSize: size.small,
    fontFamily: family.inter_bold,
    color: colors.b4,
    marginBottom: HP(0.15),
  },
  alternativeHint: {
    fontSize: size.tiny,
    fontFamily: family.inter_medium,
    color: colors.g9,
  },
  alternativeChevron: {
    fontSize: size.xxlarge,
    fontFamily: family.inter_medium,
    color: colors.g11,
  },
  personalizeContainer: {
    paddingHorizontal: WP(4),
    marginVertical: HP(1.2),
  },
  personalizeButton: {
    backgroundColor: colors.p1,
    paddingVertical: HP(1.2),
    borderRadius: WP(3),
    alignItems: 'center',
  },
  personalizeText: {
    color: colors.white,
    fontSize: size.small,
    fontFamily: family.inter_medium,
  },

  // react-native-modal (bottom sheet) — keep margin: 0 for full-width sheet
  personalizeRnModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: WP(5),
    borderTopRightRadius: WP(5),
    padding: WP(4),
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HP(1.5),
  },
  modalTitle: {
    fontSize: size.medium,
    fontFamily: family.inter_medium,
    color: colors.b1,
  },
  closeButton: {
    width: WP(8),
    height: WP(8),
    borderRadius: WP(4),
    backgroundColor: colors.g13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: size.medium,
    fontFamily: family.inter_medium,
    color: colors.b1,
    lineHeight: WP(8),
  },
  formContainer: {
    maxHeight: HP(58),
  },
  formScrollContent: {
    flexGrow: 1,
    paddingBottom: HP(2),
  },
  inputContainer: {
    marginBottom: HP(1.5),
  },
  inputTitle: {
    fontSize: size.small,
    fontFamily: family.inter_medium,
    color: colors.b1,
    marginBottom: HP(0.6),
  },
  dropdownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dropdownOption: {
    flex: 1,
    paddingVertical: HP(1),
    paddingHorizontal: WP(1.5),
    borderRadius: WP(2),
    backgroundColor: colors.g13,
    marginHorizontal: WP(0.5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownOptionSelected: {
    backgroundColor: colors.p1,
  },
  dropdownOptionText: {
    fontSize: size.small,
    fontFamily: family.inter_medium,
    color: colors.g5,
    textAlign: 'center',
  },
  dropdownOptionTextSelected: {
    color: colors.white,
    fontSize: size.small,
    fontFamily: family.inter_medium,
    textAlign: 'center',
  },
  errorTextSmall: {
    color: colors.red,
    fontSize: size.small,
    fontFamily: family.inter_medium,
    marginTop: HP(0.35),
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: HP(2),
  },
  cancelButton: {
    flex: 1,
    paddingVertical: HP(1.2),
    backgroundColor: colors.g13,
    borderRadius: WP(2),
    marginRight: WP(1.5),
    alignItems: 'center',
  },
  submitButton: {
    flex: 1,
    paddingVertical: HP(1.2),
    backgroundColor: colors.p1,
    borderRadius: WP(2),
    marginLeft: WP(1.5),
    alignItems: 'center',
  },
  cancelText: {
    fontSize: size.small,
    fontFamily: family.inter_medium,
    color: colors.g5,
  },
  submitText: {
    fontSize: size.small,
    fontFamily: family.inter_medium,
    color: colors.white,
  },
  buttonDisabled: {
    opacity: 0.5,
  },

  // Loading and Error States
  loader: {
    marginTop: HP(3),
  },
  errorText: {
    color: colors.red,
    fontSize: size.small,
    fontFamily: family.inter_medium,
    textAlign: 'center',
    marginTop: HP(3),
  },
  noMealContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: HP(5),
    paddingHorizontal: WP(4),
  },
  noMealText: {
    fontSize: size.small,
    fontFamily: family.inter_medium,
    color: colors.b1,
    textAlign: 'center',
    marginBottom: HP(0.6),
  },
  noMealSubtext: {
    fontSize: size.xtiny,
    fontFamily: family.inter_regular,
    color: colors.g5,
    textAlign: 'center',
  },

  // Navigation buttons for meal cycling
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: HP(2.5),
    paddingHorizontal: WP(5),
  },
  navButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: HP(1.2),
    paddingHorizontal: WP(5),
    borderRadius: WP(2),
  },
  navButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  navButtonText: {
    fontSize: size.medium,
    fontFamily: family.inter_medium,
    color: '#FFF',
  },
  navigationText: {
    fontSize: size.medium,
    fontFamily: family.inter_medium,
    color: '#333',
  },

  // Nutrition Container (optional - if you want to show nutrition in WhatToEat)
  nutritionContainer: {
    marginTop: HP(2),
    paddingVertical: HP(2),
    paddingHorizontal: WP(4),
    backgroundColor: '#F5F5F5',
    borderRadius: WP(2.5),
  },
  nutritionTitle: {
    fontSize: size.medium,
    fontFamily: family.inter_medium,
    marginBottom: HP(1.2),
    color: '#333',
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    width: '48%',
    fontSize: size.medium,
    fontFamily: family.inter_medium,
    marginBottom: HP(1),
    color: '#666',
  },
  disclaimerContainer: {
    paddingHorizontal: WP(4),
    paddingTop: HP(1),
    paddingBottom: HP(2),
  },
  fullScreenLoaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 15, 30, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
  },
  fullScreenLoaderCard: {
    backgroundColor: colors.white,
    borderRadius: WP(5),
    borderWidth: 1,
    borderColor: '#E7EBFF',
    minWidth: WP(72),
    maxWidth: WP(84),
    paddingVertical: HP(2.4),
    paddingHorizontal: WP(6.5),
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.p1,
        shadowOffset: {width: 0, height: 8},
        shadowOpacity: 0.24,
        shadowRadius: WP(4.5),
      },
      android: {
        elevation: 10,
      },
    }),
  },
  loaderAccentDot: {
    width: WP(2.2),
    height: WP(2.2),
    borderRadius: WP(1.1),
    backgroundColor: colors.p1,
    marginBottom: HP(1),
  },
  fullScreenLoaderText: {
    marginTop: HP(1),
    fontSize: size.small,
    fontFamily: family.inter_bold,
    color: colors.b4,
    textAlign: 'center',
    lineHeight: size.small + 4,
  },
  fullScreenLoaderSubText: {
    marginTop: HP(0.6),
    fontSize: size.xtiny,
    fontFamily: family.inter_regular,
    color: colors.g3,
    textAlign: 'center',
    lineHeight: size.xtiny + 5,
  },
});

export default styles;
