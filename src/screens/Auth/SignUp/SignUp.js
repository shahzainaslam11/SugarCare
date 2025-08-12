import React from 'react';
import {View, Text, TouchableOpacity, ImageBackground} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Formik} from 'formik';
import {AppButton, AppInput} from '../../../components';
import {
  appImages,
  auth,
  colors,
  firebaseErrorMessages,
  showError,
  showSuccess,
  signUpFormFields,
  signUpVS,
} from '../../../utilities';
import styles from './styles';
import {useNavigation} from '@react-navigation/native';

export default function SignUp() {
  const navigation = useNavigation();

  const signUpWithEmail = async (email, password) => {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );
      return {user: userCredential.user};
    } catch (error) {
      console.log('Full Firebase error:', error);
      const errorCode =
        error?.code || error?.message?.match(/\[([^\]]+)\]/)?.[1];
      console.log('Firebase error code:', errorCode);

      // Specific handling for email-already-in-use
      if (errorCode === 'auth/email-already-in-use') {
        return {
          error:
            'This email address is already registered. Please try logging in or use another email.',
        };
      }

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
          initialValues={signUpFormFields}
          validationSchema={signUpVS}
          onSubmit={async values => {
            const {user, error} = await signUpWithEmail(
              values.email,
              values.password,
            );

            if (user) {
              showSuccess('Signup successful! Please login.');
              navigation.navigate('LogIn'); // Or your desired screen after signup
            } else if (error) {
              showError(error);
            } else {
              showError('Sign Up failed. Please try again.');
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
              <Text style={styles.title}>Create an Account</Text>
              <Text style={styles.subtitle}>Sign Up to track your health</Text>

              <AppInput
                title="Your Email Address"
                placeholder="Enter your email"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                keyboardType="email-address"
                errorMessage={touched.email && errors.email ? errors.email : ''}
              />

              <AppInput
                title="Password"
                placeholder="Enter your password"
                value={values.password}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                secureTextEntry
                errorMessage={
                  touched.password && errors.password ? errors.password : ''
                }
              />

              <AppInput
                title="Confirm Password"
                placeholder="Confirm your password"
                value={values.confirmPassword}
                onChangeText={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
                secureTextEntry
                errorMessage={
                  touched.confirmPassword && errors.confirmPassword
                    ? errors.confirmPassword
                    : ''
                }
              />

              <AppButton
                title="Sign Up"
                onPress={handleSubmit}
                containerStyle={styles.signInBtn}
              />

              <View style={styles.createRow}>
                <Text style={{color: colors.g1}}>
                  Already have an account?{' '}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('LogIn')}>
                  <Text style={styles.createText}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Formik>
      </KeyboardAwareScrollView>
    </ImageBackground>
  );
}
