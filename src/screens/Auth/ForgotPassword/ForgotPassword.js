import React from 'react';
import {View, Text, TouchableOpacity, ImageBackground} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Formik} from 'formik';
import * as yup from 'yup';
import {AppButton, AppInput} from '../../../components';
import {
  appImages,
  auth,
  colors,
  firebaseErrorMessages,
  showError,
  showSuccess,
} from '../../../utilities';
import styles from './styles';
import {useNavigation} from '@react-navigation/native';

const forgotPasswordVS = yup.object().shape({
  email: yup
    .string()
    .email('Please provide a valid email address')
    .required('Email is required'),
});

const forgotPasswordInitialValues = {
  email: '',
};

export default function ForgotPassword() {
  const navigation = useNavigation();

  const sendResetEmail = async email => {
    try {
      await auth().sendPasswordResetEmail(email);
      return {success: true};
    } catch (error) {
      console.log('Full Firebase error:', error);
      const errorCode =
        error?.code || error?.message?.match(/\[([^\]]+)\]/)?.[1];
      console.log('Firebase error code:', errorCode);

      const friendlyMessage =
        firebaseErrorMessages[errorCode] ||
        'Something went wrong. Please try again.';
      return {error: friendlyMessage};
    }
  };

  return (
    <ImageBackground
      source={appImages.bgImage}
      style={styles.container}
      resizeMode="cover">
      <KeyboardAwareScrollView
        contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        keyboardShouldPersistTaps="handled">
        <Formik
          initialValues={forgotPasswordInitialValues}
          validationSchema={forgotPasswordVS}
          onSubmit={async values => {
            const {success, error} = await sendResetEmail(values.email);

            if (success) {
              showSuccess(
                'Password reset email sent! Please check your inbox.',
              );
              navigation.navigate('LogIn');
            } else {
              showError(error || 'Failed to send password reset email.');
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
                Enter your registered email below to reset your password.
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
                title="Continue"
                onPress={handleSubmit}
                containerStyle={styles.signInBtn}
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
