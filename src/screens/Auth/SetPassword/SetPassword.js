import React from 'react';
import {View, Text, TouchableOpacity, ImageBackground} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Formik} from 'formik';
import * as yup from 'yup';
import {AppInput, AppButton} from '../../../components';
import {appImages, showError, showSuccess} from '../../../utilities';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {resetPassword} from '../../../redux/slices/authSlice';
import styles from './styles';

const setPasswordVS = yup.object().shape({
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

export default function SetNewPassword() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const {loading} = useSelector(state => state.auth);

  // Get email from route params (passed from VerifyOTP screen)
  const {email, setShow} = route.params || {};

  return (
    <ImageBackground
      source={appImages.bgImage}
      style={styles.container}
      resizeMode="cover">
      <KeyboardAwareScrollView
        contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}
        showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.title}>Set New Password</Text>
          <Text style={styles.subtitle}>
            Your new password must be different from previous password
          </Text>

          <Formik
            initialValues={{password: '', confirmPassword: ''}}
            validationSchema={setPasswordVS}
            onSubmit={async (values, {setSubmitting}) => {
              if (!email) {
                showError('Email is required. Please go back and try again.');
                setSubmitting(false);
                return;
              }

              console.log('Resetting password for:', email);

              const res = await dispatch(
                resetPassword({
                  email: email,
                  new_password: values.password,
                  confirm_password: values.confirmPassword,
                }),
              );

              console.log('Reset Password Response:', res);

              if (res.meta.requestStatus === 'fulfilled') {
                showSuccess('Password changed successfully!');
                // Navigate to login with success message
                navigation.replace('LogIn', {
                  email: email,
                  message:
                    'Password reset successful! Please login with your new password.',
                });
              } else {
                // Handle validation errors
                if (res.payload?.details?.validation_errors) {
                  const validationErrors =
                    res.payload.details.validation_errors;
                  const messages = validationErrors
                    .map(
                      err =>
                        `${err.field.replace('body.', '')}: ${err.message}`,
                    )
                    .join('\n');
                  showError(messages);
                } else {
                  showError(
                    res.payload?.message || 'Failed to set new password',
                  );
                }
              }
              setSubmitting(false);
            }}>
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              isSubmitting,
            }) => (
              <View style={styles.form}>
                <AppInput
                  title="New Password"
                  placeholder="Enter new password"
                  secureTextEntry
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  errorMessage={
                    touched.password && errors.password ? errors.password : ''
                  }
                />

                <AppInput
                  title="Confirm New Password"
                  placeholder="Confirm new password"
                  secureTextEntry
                  value={values.confirmPassword}
                  onChangeText={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  errorMessage={
                    touched.confirmPassword && errors.confirmPassword
                      ? errors.confirmPassword
                      : ''
                  }
                />

                <AppButton
                  title="Reset Password"
                  onPress={handleSubmit}
                  loading={loading || isSubmitting}
                  // style={styles.confirmBtn}
                  // textStyle={styles.confirmBtnText}
                  disabled={!email}
                />
                {setShow ? null : (
                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      onPress={() => navigation.goBack()}
                      style={styles.backLink}>
                      <Text style={styles.backText}>← Go Back</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => navigation.replace('LogIn')}
                      style={styles.backLink}>
                      <Text style={styles.backText}>Back to Login</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </Formik>
        </View>
      </KeyboardAwareScrollView>
    </ImageBackground>
  );
}
