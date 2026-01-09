import {StyleSheet} from 'react-native';
import {colors, family, HP, size, WP} from '../../../utilities';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  mealTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: HP(0.7),
    backgroundColor: colors.g15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginHorizontal: WP(2),
    borderRadius: 30,
  },
  mealTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  activeButton: {
    backgroundColor: colors.p1,
  },
  mealTypeText: {
    color: colors.b1,
    fontSize: size.medium,
    fontFamily: family.inter_medium,
  },
  mealTypeTextActive: {
    color: colors.white,
    fontSize: size.medium,
    fontFamily: family.inter_medium,
  },
  suggestedMealSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: size.medium,
    fontFamily: family.inter_medium,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
  },
  mealCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mealImage: {
    width: '100%',
    height: 200,
  },
  mealName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    padding: 10,
  },
  mealDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  alternativesSection: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  alternativeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 10,
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  alternativeImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  alternativeText: {
    flex: 1,
  },
  alternativeName: {
    fontSize: 16,
    color: '#2c3e50',
  },
  personalizeContainer: {
    paddingHorizontal: WP(5),
    marginVertical: HP(2),
  },
  personalizeButton: {
    backgroundColor: '#2563eb',
    paddingVertical: HP(1),
    borderRadius: 10,
    alignItems: 'center',
  },
  personalizeText: {
    color: '#fff',
    fontSize: size.medium,
    fontFamily: family.semiBold,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: WP(5),
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HP(2),
  },
  modalTitle: {
    fontSize: size.large,
    fontFamily: family.inter_medium,
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#333',
    lineHeight: 30,
  },
  formContainer: {
    maxHeight: HP(60),
  },
  inputContainer: {
    marginBottom: HP(2),
  },
  inputTitle: {
    fontSize: size.normal,
    fontFamily: family.inter_medium,
    color: '#333',
    marginBottom: HP(1),
  },
  dropdownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dropdownOption: {
    flex: 1,
    paddingVertical: HP(1.2),
    paddingHorizontal: WP(2),
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginHorizontal: WP(0.5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownOptionSelected: {
    backgroundColor: '#2563eb',
  },
  dropdownOptionText: {
    fontSize: size.tiny,
    fontFamily: family.inter_medium,
    color: '#666',
    textAlign: 'center',
  },
  dropdownOptionTextSelected: {
    color: '#fff',
    fontSize: size.tiny,
    fontFamily: family.inter_medium,
    textAlign: 'center',
  },
  errorTextSmall: {
    color: 'red',
    fontSize: size.small,
    fontFamily: family.inter_medium,
    marginTop: HP(0.5),
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: HP(3),
  },
  cancelButton: {
    flex: 1,
    paddingVertical: HP(1.5),
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginRight: WP(2),
    alignItems: 'center',
  },
  submitButton: {
    flex: 1,
    paddingVertical: HP(1.5),
    backgroundColor: '#2563eb',
    borderRadius: 8,
    marginLeft: WP(2),
    alignItems: 'center',
  },
  cancelText: {
    fontSize: size.normal,
    fontFamily: family.inter_medium,
    color: '#666',
  },
  submitText: {
    fontSize: size.normal,
    fontFamily: family.medium,
    color: '#fff',
  },
  buttonDisabled: {
    opacity: 0.5,
  },

  // Loading and Error States
  loader: {
    marginTop: HP(5),
  },
  errorText: {
    color: 'red',
    fontSize: size.normal,
    fontFamily: family.inter_medium,
    textAlign: 'center',
    marginTop: HP(5),
  },
  noMealContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: HP(10),
    paddingHorizontal: WP(5),
  },
  noMealText: {
    fontSize: size.large,
    fontFamily: family.inter_medium,

    color: '#333',
    textAlign: 'center',
    marginBottom: HP(1),
  },
  noMealSubtext: {
    fontSize: size.normal,

    fontFamily: family.inter_medium,
    color: '#666',
    textAlign: 'center',
  },

  // Navigation buttons for meal cycling
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  navButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  navButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  navButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  navigationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  // Nutrition Container (optional - if you want to show nutrition in WhatToEat)
  nutritionContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
  },
  nutritionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    width: '48%',
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
  },
});

export default styles;
