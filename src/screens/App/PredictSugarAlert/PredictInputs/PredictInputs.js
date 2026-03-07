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
     Prepare readings for prediction
  ===================================================== */
  const prepareReadingsForPrediction = () => {
    if (!recentReadings || recentReadings.length === 0) {
      return [];
    }

    // Take last 4 unique readings (most recent)
    const uniqueReadings = [];
    const seenDates = new Set();

    for (const reading of recentReadings) {
      if (!seenDates.has(reading.timestamp)) {
        seenDates.add(reading.timestamp);
        uniqueReadings.push(reading);
        if (uniqueReadings.length >= 4) break;
      }
    }

    // Sort ascending (oldest to newest) for API
    return uniqueReadings.sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
    );
  };

  /* =====================================================
     SUBMIT HANDLER
  ===================================================== */
  const handleFormSubmit = async values => {
    const ok = await gateAIAction();
    if (!ok) return;

    try {
      // Get prepared recent readings
      const recentReadingsForAPI = prepareReadingsForPrediction();

      // Format current date
      const today = new Date().toISOString().split('T')[0];

      // Add today's reading to the list
      const allReadings = [
        ...recentReadingsForAPI,
        {
          timestamp: today,
          value: Number(values.recentReading),
        },
      ];

      console.log('Sending readings:', JSON.stringify(allReadings));

      // Dispatch the prediction
      const result = await dispatch(
        predictSugarAlert({
          token: accessToken,
          user_id: user.id,
          activity_level: values.activityLevel,
          meal_info: values.lastMeal,
          recent_readings: allReadings,
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

                {/* Recent readings info */}
                <View style={styles.infoContainer}>
                  <Text style={styles.infoTitle}>Recent Readings Status</Text>
                  {recentReadings && recentReadings.length > 0 ? (
                    <>
                      <Text style={styles.infoText}>
                        Available: {recentReadings.length} readings
                      </Text>
                      <Text style={styles.infoText}>
                        Using last {Math.min(4, recentReadings.length)} readings
                        for prediction
                      </Text>
                      <Text style={styles.infoNote}>
                        Latest reading: {recentReadings[0]?.value} mg/dL on{' '}
                        {recentReadings[0]?.timestamp}
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.infoText}>
                      No recent readings found. Only current reading will be
                      used.
                    </Text>
                  )}
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
