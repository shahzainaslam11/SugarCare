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
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: WP(90),
    borderRadius: 20,
    padding: WP(6),
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: size.xlarge,
    fontFamily: family.bold,
    textAlign: 'center',
    marginBottom: HP(3),
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: HP(2),
    marginBottom: HP(2),
    fontSize: size.normal,
  },
  label: {
    fontSize: size.normal,
    fontFamily: family.semiBold,
    marginBottom: HP(1),
    color: '#333',
  },
  mealTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: HP(2),
  },
  smallMealButton: {
    paddingHorizontal: WP(5),
    paddingVertical: HP(1.2),
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: HP(1),
    width: '48%',
    alignItems: 'center',
  },
  smallActiveButton: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  smallMealText: {
    color: '#333',
    fontSize: size.normal,
    fontFamily: family.semiBold,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: HP(3),
  },
  cancelButton: {
    flex: 1,
    paddingVertical: HP(1),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    marginRight: WP(3),
  },
  cancelText: {
    color: '#666',
    fontSize: size.normal,
    fontFamily: family.semiBold,
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: HP(1),
    borderRadius: 10,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: size.normal,
    fontFamily: family.semiBold,
  },
});

export default styles;
