import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  Header,
  AppInput,
  AppButton,
  CustomDropdown,
} from '../../../../components';
import {useNavigation} from '@react-navigation/native';
import {Formik} from 'formik';
import * as Yup from 'yup';
import styles from './styles';

const PredictInputs = () => {
  const navigation = useNavigation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const diabetesControlItems = [
    {label: 'Well controlled', value: 'Well controlled'},
    {label: 'Moderately controlled', value: 'Moderately controlled'},
    {label: 'Poorly controlled', value: 'Poorly controlled'},
  ];

  const validationSchema = Yup.object().shape({
    recentReading: Yup.number()
      .typeError('Must be a number')
      .positive('Must be positive')
      .min(50, 'Too low')
      .max(400, 'Too high')
      .required('Last blood sugar reading is required'),

    lastMeal: Yup.string()
      .trim()
      .min(3, 'Too short')
      .required('Last meal is required'),

    diabetesControlLevel: Yup.string().required(
      'Diabetes control level is required',
    ),
  });

  const handleFormSubmit = values => {
    navigation.navigate('PredictSugarAlert', values);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Predictive Sugar Alert"
        onPress={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Formik
          initialValues={{
            recentReading: '',
            lastMeal: '',
            diabetesControlLevel: '',
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
          }) => (
            <>
              <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled">
                <Text style={styles.label}>Last Blood Sugar Reading</Text>
                <AppInput
                  placeholder="140 mg/dL"
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

                <Text style={styles.label}>Last Meal</Text>
                <AppInput
                  placeholder="e.g. Oatmeal with Berries"
                  value={values.lastMeal}
                  onChangeText={handleChange('lastMeal')}
                  onBlur={handleBlur('lastMeal')}
                  errorMessage={
                    touched.lastMeal && errors.lastMeal ? errors.lastMeal : ''
                  }
                />

                <Text style={styles.label}>Diabetes Control Level</Text>
                <CustomDropdown
                  open={dropdownOpen}
                  setOpen={setDropdownOpen}
                  value={values.diabetesControlLevel}
                  setValue={v => {
                    setFieldValue('diabetesControlLevel', v);
                    setFieldTouched('diabetesControlLevel', true);
                  }}
                  items={diabetesControlItems}
                  placeholder="Select control level"
                  errorMessage={
                    touched.diabetesControlLevel && errors.diabetesControlLevel
                      ? errors.diabetesControlLevel
                      : ''
                  }
                />
              </ScrollView>

              {/* Fixed Footer Button */}
              <View style={styles.footer}>
                <AppButton title="Predict with AI" onPress={handleSubmit} />
              </View>
            </>
          )}
        </Formik>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PredictInputs;
