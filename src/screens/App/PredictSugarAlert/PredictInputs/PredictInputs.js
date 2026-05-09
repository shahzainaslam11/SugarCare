import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  Header,
  AppInput,
  AppButton,
  CustomDropdown,
  MedicalDisclaimer,
  AIConsentModal,
} from '../../../../components';
import {useNavigation} from '@react-navigation/native';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {useDispatch, useSelector} from 'react-redux';
import styles from './styles';
import {
  fetchRecentSugarReadings,
  predictSugarAlert,
  setUserInput,
} from '../../../../redux/slices/sugarAlertSlice';
import {useAIConsentGate} from '../../../../hooks/useAIConsentGate';

const PredictInputs = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {gateAIAction, showModal, handleAccept, handleDecline} = useAIConsentGate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const {accessToken, user} = useSelector(state => state.auth);
  const {recentReadings, loading, error} = useSelector(
    state => state.sugarAlert,
  );

  useEffect(() => {
    if (accessToken && user?.id) {
      dispatch(
        fetchRecentSugarReadings({
          token: accessToken,
          user_id: user.id,
          limit: 30,
        }),
      );
    }
  }, [accessToken, user?.id, dispatch]);

  useEffect(() => {
    if (error) {
      const message =
        typeof error === 'string'
          ? error
          : error?.message || 'Failed to get prediction. Please try again.';
      Alert.alert('Prediction Error', message, [{text: 'OK'}]);
    }
  }, [error]);

  const activityLevelItems = [
    {label: 'Sedentary', value: 'sedentary'},
    {label: 'Light', value: 'light'},
    {label: 'Moderate', value: 'moderate'},
    {label: 'Active', value: 'active'},
  ];

  const validationSchema = Yup.object().shape({
    recentReading: Yup.number()
      .typeError('Must be a number')
      .min(50, 'Value too low (minimum 50 mg/dL)')
      .max(400, 'Value too high (maximum 400 mg/dL)')
      .required('Blood sugar reading is required'),

    lastMeal: Yup.string()
      .min(3, 'Meal description too short')
      .max(100, 'Meal description too long')
      .required('Last meal description is required'),

    activityLevel: Yup.string().required('Select activity level'),
  });

  /* =====================================================
     SUBMIT HANDLER
  ===================================================== */
  const handleFormSubmit = async values => {
    const ok = await gateAIAction();
    if (!ok) return;

    try {
      const recentReadingString = String(values.recentReading).trim();
      console.log('Sending recent_readings:', recentReadingString);

      // Dispatch the prediction
      const result = await dispatch(
        predictSugarAlert({
          token: accessToken,
          user_id: user.id,
          activity_level: values.activityLevel,
          meal_info: values.lastMeal,
          recent_readings: recentReadingString,
        }),
      ).unwrap();
      console.log('Sending Real:', JSON.stringify(result));

      if (result?.success) {
        const userInputData = {
          recentReading: values.recentReading,
          lastMeal: values.lastMeal,
          activityLevel: values.activityLevel,
        };
        dispatch(setUserInput(userInputData));
        navigation.navigate('PredictSugarAlert', {
          predictionResult: result.data,
          userInput: userInputData,
        });
      } else {
        Alert.alert(
          'Prediction Failed',
          result?.message || 'Unable to get prediction. Please try again.',
          [{text: 'OK'}],
        );
      }
    } catch (error) {
      console.error('Error in prediction:', error);
      // Error is already handled by the slice and useEffect
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Predict Sugar Levels"
        onPress={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Formik
          initialValues={{
            recentReading: '',
            lastMeal: '',
            activityLevel: 'moderate', // Default value
          }}
          validationSchema={validationSchema}
          onSubmit={handleFormSubmit}>
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            setFieldValue,
            setFieldTouched,
            isValid,
            dirty,
          }) => (
            <>
              <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>
                <View style={styles.formSection}>
                  <Text style={styles.label}>Current Blood Sugar (mg/dL)</Text>
                  <AppInput
                    placeholder="Enter reading (e.g., 140)"
                    keyboardType="numeric"
                    value={values.recentReading}
                    onChangeText={handleChange('recentReading')}
                    onBlur={handleBlur('recentReading')}
                    errorMessage={
                      touched.recentReading && errors.recentReading
                        ? errors.recentReading
                        : ''
                    }
                  />
                </View>

                <View style={styles.formSection}>
                  <Text style={styles.label}>Recent Meal</Text>
                  <AppInput
                    placeholder="Describe your last meal (e.g., Rice and curry)"
                    value={values.lastMeal}
                    onChangeText={handleChange('lastMeal')}
                    onBlur={handleBlur('lastMeal')}
                    multiline
                    numberOfLines={2}
                    errorMessage={
                      touched.lastMeal && errors.lastMeal ? errors.lastMeal : ''
                    }
                  />
                </View>

                <View style={styles.formSection}>
                  <Text style={styles.label}>Activity Level</Text>
                  <CustomDropdown
                    open={dropdownOpen}
                    setOpen={setDropdownOpen}
                    value={values.activityLevel}
                    setValue={v => {
                      setFieldValue('activityLevel', v);
                      setFieldTouched('activityLevel', true);
                    }}
                    items={activityLevelItems}
                    placeholder="Select your activity level"
                    errorMessage={
                      touched.activityLevel && errors.activityLevel
                        ? errors.activityLevel
                        : ''
                    }
                  />
                </View>

                {/* Recent reading info */}
                <View style={styles.infoContainer}>
                  <Text style={styles.infoTitle}>Current Reading</Text>
                  <Text style={styles.infoText}>
                    We will send your current reading as a single value.
                  </Text>
                  {recentReadings && recentReadings.length > 0 ? (
                    <Text style={styles.infoNote}>
                      Last saved reading: {recentReadings[0]?.value} mg/dL on{' '}
                      {recentReadings[0]?.timestamp}
                    </Text>
                  ) : null}
                </View>

                <MedicalDisclaimer />
              </ScrollView>

              <View style={styles.footer}>
                <AppButton
                  title={loading ? 'Analyzing...' : 'Predict Sugar Levels'}
                  onPress={handleSubmit}
                  disabled={loading || !isValid || !dirty}
                  loading={loading}
                />
              </View>
            </>
          )}
        </Formik>
      </KeyboardAvoidingView>

      <AIConsentModal
        visible={showModal}
        onAccept={handleAccept}
        onDecline={handleDecline}
      />
    </SafeAreaView>
  );
};

export default PredictInputs;
