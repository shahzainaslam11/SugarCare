import React, {memo, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import Modal from 'react-native-modal';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {useDispatch, useSelector} from 'react-redux';
import {AppInput} from '../../../components';
import styles from './styles';
import {generateMealRecommendations} from '../../../redux/slices/mealRecommendationsSlice';

const MEAL_FORM_INITIAL_VALUES = {
  currentGlucose: '',
  diabetesControlLevel: 'Moderately controlled',
  mealDescription: '',
  portionSize: 'Medium',
};

const mealPersonalizationValidationSchema = Yup.object().shape({
  currentGlucose: Yup.number()
    .typeError('Must be a valid number')
    .positive('Glucose must be positive')
    .min(50, 'Value too low')
    .max(400, 'Value too high')
    .required('Current glucose is required'),

  diabetesControlLevel: Yup.string()
    .trim()
    .required('Diabetes control level is required')
    .oneOf(
      ['Well controlled', 'Moderately controlled', 'Poorly controlled'],
      'Must be: Well controlled, Moderately controlled, or Poorly controlled',
    ),

  mealDescription: Yup.string()
    .trim()
    .required('Meal description is required')
    .min(5, 'Please enter at least 5 characters for meal description.')
    .max(100, 'Description too long (max 100 characters)'),

  portionSize: Yup.string()
    .trim()
    .required('Portion size is required')
    .oneOf(['Light', 'Medium', 'Large'], 'Must be Light, Medium, or Large'),
});

const PersonalizeMealModal = memo(function PersonalizeMealModal({
  isVisible,
  onClose,
  onBeginSubmit,
  onFinishSubmit,
  onSuccess,
}) {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const accessToken = useSelector(state => state.auth.accessToken);

  const handleFormSubmit = useCallback(
    async (values, {resetForm}) => {
      if (!user?.id) {
        Alert.alert('Error', 'User information not available');
        return;
      }

      onBeginSubmit();

      const payload = {
        current_glucose: Number(values.currentGlucose),
        diabetes_control_level: values.diabetesControlLevel,
        meal_description: values.mealDescription.trim(),
        portion_size: values.portionSize.trim(),
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
        user_id: user.id,
      };

      try {
        const result = await dispatch(
          generateMealRecommendations({
            payload,
            token: accessToken,
          }),
        ).unwrap();

        if (result) {
          resetForm();
          onSuccess(result);
          Alert.alert(
            'Success',
            'Meal recommendations generated successfully!',
          );
        }
      } catch (err) {
        console.error('API error:', err);

        let errorMessage = 'Failed to generate meal recommendations';

        if (err?.message) {
          errorMessage = err.message;
        } else if (typeof err === 'string') {
          errorMessage = err;
        }

        Alert.alert('Error', errorMessage);
      } finally {
        onFinishSubmit();
      }
    },
    [accessToken, dispatch, onBeginSubmit, onFinishSubmit, onSuccess, user?.id],
  );

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      avoidKeyboard={Platform.OS === 'ios'}
      useNativeDriver={false}
      useNativeDriverForBackdrop={false}
      propagateSwipe
      backdropTransitionOutTiming={0}
      animationInTiming={280}
      animationOutTiming={200}
      style={styles.personalizeRnModal}
      hideModalContentWhileAnimating>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Personalize Your Meal</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        <Formik
          initialValues={MEAL_FORM_INITIAL_VALUES}
          validationSchema={mealPersonalizationValidationSchema}
          validateOnChange={true}
          validateOnBlur={true}
          enableReinitialize={false}
          onSubmit={handleFormSubmit}>
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            isValid,
            dirty,
            setFieldValue,
          }) => (
            <ScrollView
              style={styles.formContainer}
              contentContainerStyle={styles.formScrollContent}
              keyboardShouldPersistTaps="always"
              showsVerticalScrollIndicator={false}
              keyboardDismissMode="none"
              nestedScrollEnabled
              removeClippedSubviews={false}
              automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}>
              <AppInput
                title="Glucose"
                placeholder="Enter glucose (e.g. 140)"
                keyboardType="numeric"
                value={values.currentGlucose}
                onChangeText={handleChange('currentGlucose')}
                onBlur={handleBlur('currentGlucose')}
                errorMessage={
                  (touched.currentGlucose || values.currentGlucose?.length > 0) &&
                  errors.currentGlucose
                    ? errors.currentGlucose
                    : ''
                }
              />

              <View style={styles.inputContainer}>
                <Text style={styles.inputTitle}>Diabetes Control Level *</Text>
                <View style={styles.dropdownContainer}>
                  {[
                    'Well controlled',
                    'Moderately controlled',
                    'Poorly controlled',
                  ].map(option => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.dropdownOption,
                        values.diabetesControlLevel === option &&
                          styles.dropdownOptionSelected,
                      ]}
                      onPress={() =>
                        setFieldValue('diabetesControlLevel', option)
                      }>
                      <Text
                        style={[
                          styles.dropdownOptionText,
                          values.diabetesControlLevel === option &&
                            styles.dropdownOptionTextSelected,
                        ]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {touched.diabetesControlLevel &&
                  errors.diabetesControlLevel && (
                    <Text style={styles.errorTextSmall}>
                      {errors.diabetesControlLevel}
                    </Text>
                  )}
              </View>

              <AppInput
                title="Meal Description"
                placeholder="Enter meal description"
                value={values.mealDescription}
                onChangeText={handleChange('mealDescription')}
                onBlur={handleBlur('mealDescription')}
                errorMessage={
                  (touched.mealDescription || values.mealDescription?.length > 0) &&
                  errors.mealDescription
                    ? errors.mealDescription
                    : ''
                }
              />

              <View style={styles.inputContainer}>
                <Text style={styles.inputTitle}>Portion Size *</Text>
                <View style={styles.dropdownContainer}>
                  {['Light', 'Medium', 'Large'].map(option => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.dropdownOption,
                        values.portionSize === option &&
                          styles.dropdownOptionSelected,
                      ]}
                      onPress={() => setFieldValue('portionSize', option)}>
                      <Text
                        style={[
                          styles.dropdownOptionText,
                          values.portionSize === option &&
                            styles.dropdownOptionTextSelected,
                        ]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {touched.portionSize && errors.portionSize && (
                  <Text style={styles.errorTextSmall}>
                    {errors.portionSize}
                  </Text>
                )}
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onClose}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    (!isValid || !dirty) && styles.buttonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={!isValid || !dirty}>
                  <Text style={styles.submitText}>Get Suggestion</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </Formik>
      </View>
    </Modal>
  );
});

export default PersonalizeMealModal;
