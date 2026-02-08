import React, {useState} from 'react';
import {
  View,
  ImageBackground,
  Text,
  TouchableOpacity,
  Switch,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Formik} from 'formik';
import {useDispatch, useSelector} from 'react-redux';
import {AppButton, AppInput, CustomDropdown} from '../../../components';
import {
  appImages,
  showError,
  showSuccess,
  signUpVS,
  colors,
  normalizeEmail,
} from '../../../utilities';
import styles from './styles';
import {useNavigation} from '@react-navigation/native';
import {registerUser} from '../../../redux/slices/authSlice';

export default function SignUp() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {loading} = useSelector(state => state.auth);
  const {width} = Dimensions.get('window');
  const isSmall = width < 400;

  const [genderOpen, setGenderOpen] = useState(false);
  const [genderValue, setGenderValue] = useState(null);
  const [diabetesOpen, setDiabetesOpen] = useState(false);
  const [diabetesValue, setDiabetesValue] = useState(null);
  const [usingInsulin, setUsingInsulin] = useState(false);

  const genderItems = [
    {label: 'Male', value: 'male'},
    {label: 'Female', value: 'female'},
    {label: 'Other', value: 'other'},
  ];

  const diabetesItems = [
    {label: 'Type 1', value: 'Type 1'},
    {label: 'Type 2', value: 'Type 2'},
    {label: 'Prediabetes', value: 'Prediabetes'},
    {label: 'Gestational', value: 'Gestational'},
    {label: 'None', value: 'None'},
  ];

  const initialValues = {
    email: '',
    name: '',
    gender: '',
    age: '',
    height: '',
    weight: '',
    diabetesType: '',
    cholesterol: '',
    hba1c: '',
    usingInsulin: false,
    password: '',
    confirmPassword: '',
  };

  return (
    <ImageBackground
      source={appImages.bgImage}
      style={styles.container}
      resizeMode="cover">
      <View style={{flex: 1}}>
        <KeyboardAwareScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          enableOnAndroid
          keyboardShouldPersistTaps="handled">
          <Formik
            initialValues={initialValues}
            validationSchema={signUpVS}
            onSubmit={async (values, {setSubmitting}) => {
              const email = normalizeEmail(values.email);

              // Prepare payload matching backend API
              const payload = {
                email,
                password: values.password,
                confirm_password: values.confirmPassword,
                full_name: values.name,
                gender: values.gender,
                age: Number(values.age),
                height_cm: Number(values.height),
                weight_kg: Number(values.weight),
                diabetes_type: values.diabetesType,
                cholesterol_mg_dl: Number(values.cholesterol),
                hba1c_percent: Number(values.hba1c),
                using_insulin: values.usingInsulin,
              };

              try {
                const res = await dispatch(registerUser(payload));

                if (res.meta.requestStatus === 'fulfilled') {
                  showSuccess('Signup successful! Please login.');
                  navigation.navigate('LogIn', {email: values.email});
                } else if (res.payload?.error) {
                  // Show the exact backend error message from the "error" field
                  showError(res.payload.error);
                } else if (res.payload?.details?.validation_errors) {
                  // Extract and display backend validation errors
                  const validationErrors =
                    res.payload.details.validation_errors;
                  const messages = validationErrors
                    .map(
                      err =>
                        `${err.field.replace('body.', '')}: ${err.message}`,
                    )
                    .join('\n');
                  showError(messages);
                } else if (res.payload?.message) {
                  // Use the general message field
                  showError(res.payload.message);
                } else {
                  // Fallback message
                  showError('Sign up failed. Please try again.');
                }
              } catch (e) {
                showError('Something went wrong. Please try again.');
              } finally {
                setSubmitting(false);
              }
            }}>
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              setFieldValue,
              isSubmitting,
            }) => (
              <View style={styles.inner}>
                <Text style={styles.title}>Create an Account</Text>
                <Text style={styles.subtitle}>
                  Sign up to track your health progress
                </Text>

                {/* Email */}
                <AppInput
                  title="Email Address"
                  placeholder="Enter your email"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  errorMessage={touched.email && errors.email}
                />

                {/* Full Name */}
                <AppInput
                  title="Full Name"
                  placeholder="Enter your full name"
                  value={values.name}
                  onChangeText={handleChange('name')}
                  onBlur={handleBlur('name')}
                  errorMessage={touched.name && errors.name}
                />

                {/* Gender + Age */}
                <View style={[styles.row, isSmall && styles.rowSmall]}>
                  <View style={[styles.half, isSmall && styles.halfSmall]}>
                    <CustomDropdown
                      title="Select Gender"
                      open={genderOpen}
                      setOpen={setGenderOpen}
                      value={genderValue}
                      setValue={v => {
                        setGenderValue(v);
                        setFieldValue('gender', v);
                      }}
                      items={genderItems}
                      placeholder="Select Gender"
                      errorMessage={touched.gender && errors.gender}
                    />
                  </View>
                  <View style={[styles.half, isSmall && styles.halfSmall]}>
                    <AppInput
                      title="Age"
                      placeholder="Enter your age"
                      value={values.age}
                      onChangeText={handleChange('age')}
                      onBlur={handleBlur('age')}
                      keyboardType="numeric"
                      errorMessage={touched.age && errors.age}
                    />
                  </View>
                </View>

                {/* Height + Weight */}
                <View style={[styles.row, isSmall && styles.rowSmall]}>
                  <View style={[styles.half, isSmall && styles.halfSmall]}>
                    <AppInput
                      title="Height (cm)"
                      placeholder="e.g., 170"
                      value={values.height}
                      onChangeText={handleChange('height')}
                      onBlur={handleBlur('height')}
                      keyboardType="numeric"
                      errorMessage={touched.height && errors.height}
                    />
                  </View>
                  <View style={[styles.half, isSmall && styles.halfSmall]}>
                    <AppInput
                      title="Weight (kg)"
                      placeholder="e.g., 70"
                      value={values.weight}
                      onChangeText={handleChange('weight')}
                      onBlur={handleBlur('weight')}
                      keyboardType="numeric"
                      errorMessage={touched.weight && errors.weight}
                    />
                  </View>
                </View>
                {/* Cholesterol + HbA1c Row */}
                <View style={[styles.row, isSmall && styles.rowSmall]}>
                  <View style={[styles.half, isSmall && styles.halfSmall]}>
                    <AppInput
                      title="Cholesterol (mg/dL)"
                      placeholder="e.g., 100"
                      value={values.cholesterol}
                      onChangeText={handleChange('cholesterol')}
                      onBlur={handleBlur('cholesterol')}
                      keyboardType="numeric"
                      errorMessage={touched.cholesterol && errors.cholesterol}
                    />
                  </View>
                  <View style={[styles.half, isSmall && styles.halfSmall]}>
                    <AppInput
                      title="HbA1c (%)"
                      placeholder="e.g., 5.7"
                      value={values.hba1c}
                      onChangeText={handleChange('hba1c')}
                      onBlur={handleBlur('hba1c')}
                      keyboardType="numeric"
                      errorMessage={touched.hba1c && errors.hba1c}
                    />
                  </View>
                </View>

                {/* Diabetes Type */}
                <CustomDropdown
                  title="Your Diabetes Type"
                  open={diabetesOpen}
                  setOpen={setDiabetesOpen}
                  value={diabetesValue}
                  setValue={v => {
                    setDiabetesValue(v);
                    setFieldValue('diabetesType', v);
                  }}
                  items={diabetesItems}
                  placeholder="Select"
                  errorMessage={touched.diabetesType && errors.diabetesType}
                />

                {/* Using Insulin */}
                <View style={styles.checkboxContainer}>
                  <Text style={styles.checkboxLabel}>Using Insulin?</Text>
                  <Switch
                    value={usingInsulin}
                    onValueChange={v => {
                      setUsingInsulin(v);
                      setFieldValue('usingInsulin', v);
                    }}
                    trackColor={{false: colors.g2, true: colors.p1}}
                    thumbColor={usingInsulin ? colors.white : colors.g3}
                  />
                </View>

                {/* Password */}
                <AppInput
                  title="Password"
                  placeholder="Enter your password"
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  secureTextEntry
                  errorMessage={touched.password && errors.password}
                />

                {/* Confirm Password */}
                <AppInput
                  title="Confirm Password"
                  placeholder="Confirm your password"
                  value={values.confirmPassword}
                  onChangeText={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  secureTextEntry
                  errorMessage={
                    touched.confirmPassword && errors.confirmPassword
                  }
                />

                <AppButton
                  title="Sign Up"
                  loading={loading}
                  onPress={handleSubmit}
                  disabled={isSubmitting || loading}
                  // containerStyle={styles.signInBtn}
                />
                {/* Footer */}
                <View style={styles.createRow}>
                  <Text style={styles.createText}>
                    Already have an account?{' '}
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('LogIn')}>
                    <Text style={styles.linkText}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Formik>
        </KeyboardAwareScrollView>
      </View>
    </ImageBackground>
  );
}
