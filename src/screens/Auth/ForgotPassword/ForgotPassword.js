import React from 'react';
import {View, Text, TouchableOpacity, ImageBackground} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Formik} from 'formik';
import * as yup from 'yup';
import {AppInput, AppButton} from '../../../components';
import {
  appImages,
  normalizeEmail,
  showError,
  showSuccess,
} from '../../../utilities';
import styles from './styles';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {sendOtp} from '../../../redux/slices/authSlice'; // Changed from forgotPassword to sendOtp

const forgotPasswordVS = yup.object().shape({
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
});

export default function ForgotPassword() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {loading} = useSelector(state => state.auth);

  return (
    <ImageBackground
      source={appImages.bgImage}
      style={styles.container}
      resizeMode="cover">
      <KeyboardAwareScrollView
        contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}>
        <Formik
          initialValues={{email: ''}}
          validationSchema={forgotPasswordVS}
          onSubmit={async values => {
            const email = normalizeEmail(values.email);
            // Call sendOtp with purpose 'reset_pw' as per API documentation
            const res = await dispatch(
              sendOtp({
                email,
                purpose: 'reset_pw',
              }),
            );

            // ✅ Log full API response
            console.log('Send OTP API Response:', JSON.stringify(res));

            if (res.meta.requestStatus === 'fulfilled') {
              showSuccess(res.payload?.message || 'OTP sent to your email');

              navigation.navigate('VerifyOTP', {
                email: values.email,
                purpose: 'reset_pw',
              });
            } else {
              // Handle validation errors
              if (res.payload?.details?.validation_errors) {
                const validationErrors = res.payload.details.validation_errors;
                const messages = validationErrors
                  .map(
                    err => `${err.field.replace('body.', '')}: ${err.message}`,
                  )
                  .join('\n');
                showError(messages);
              } else {
                showError(
                  res.payload?.message ||
                    'Failed to send OTP. Please try again.',
                );
              }
            }
          }}>
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <View style={styles.inner}>
              <Text style={styles.title}>Forgot Password</Text>
              <Text style={styles.subtitle}>
                Enter your registered email below to receive OTP for password
                reset.
              </Text>

              <AppInput
                title="Your Email Address"
                placeholder="Enter your email"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                keyboardType="email-address"
                errorMessage={touched.email && errors.email ? errors.email : ''}
              />

              <AppButton
                title="Send OTP"
                onPress={handleSubmit}
                loading={loading}
              />

              <View style={styles.createRow}>
                <TouchableOpacity onPress={() => navigation.navigate('LogIn')}>
                  <Text style={styles.createText}>Go Back to Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Formik>
      </KeyboardAwareScrollView>
    </ImageBackground>
  );
}
