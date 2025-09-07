import React, {useState} from 'react';
import {
  View,
  Dimensions,
  ImageBackground,
  Text,
  TouchableOpacity,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Formik} from 'formik';
import {AppButton, AppInput, CustomDropdown} from '../../../components';
import {
  appImages,
  auth,
  firebaseErrorMessages,
  showError,
  showSuccess,
  signUpFormFields,
  signUpVS,
} from '../../../utilities';
import styles from './styles';
import {useNavigation} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

export default function SignUp() {
  const navigation = useNavigation();
  const [screenWidth, setScreenWidth] = useState(
    Dimensions.get('window').width,
  );

  // Handle screen rotation/resize
  Dimensions.addEventListener('change', ({window}) => {
    setScreenWidth(window.width);
  });

  // Dropdown states
  const [genderOpen, setGenderOpen] = useState(false);
  const [genderValue, setGenderValue] = useState(null);

  const [genderItems, setGenderItems] = useState([
    {label: 'Male', value: 'male'},
    {label: 'Female', value: 'female'},
  ]);

  const signUpWithEmail = async (email, password, extraData) => {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );

      const {uid} = userCredential.user;

      // Save extra data in Firestore
      await firestore().collection('users').doc(uid).set({
        email,
        gender: extraData.gender,
        age: extraData.age,
        height: extraData.height,
        weight: extraData.weight,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      return {user: userCredential.user};
    } catch (error) {
      console.log('Full Firebase error:', error);
      const errorCode =
        error?.code || error?.message?.match(/\[([^\]]+)\]/)?.[1];
      console.log('Firebase error code:', errorCode);

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
        contentContainerStyle={styles.scrollContainer}
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
              {
                gender: values.gender,
                age: values.age,
                height: values.height,
                weight: values.weight,
              },
            );

            if (user) {
              showSuccess('Signup successful! Please login.');
              navigation.navigate('LogIn');
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
            setFieldValue,
          }) => (
            <View
              style={[styles.inner, styles.getResponsiveInner(screenWidth)]}>
              <Text
                style={[styles.title, styles.getResponsiveTitle(screenWidth)]}>
                Create an Account
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  styles.getResponsiveSubtitle(screenWidth),
                ]}>
                Sign Up to track your health
              </Text>

              {/* Email */}
              <AppInput
                title="Your Email Address"
                placeholder="Enter your email"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                keyboardType="email-address"
                errorMessage={touched.email && errors.email ? errors.email : ''}
              />

              {/* Password */}
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
                    ? errors.confirmPassword
                    : ''
                }
              />

              {/* Row 1: Gender + Age */}
              <View style={[styles.row, styles.getResponsiveRow(screenWidth)]}>
                <View
                  style={[
                    styles.half,
                    styles.getResponsiveHalf(screenWidth),
                    {zIndex: 2000},
                  ]}>
                  <CustomDropdown
                    title="Select Gender"
                    open={genderOpen}
                    setOpen={setGenderOpen}
                    value={genderValue}
                    setValue={val => {
                      setGenderValue(val);
                      setFieldValue('gender', val);
                    }}
                    items={genderItems}
                    setItems={setGenderItems}
                    placeholder="Select Gender"
                    errorMessage={
                      touched.gender && errors.gender ? errors.gender : ''
                    }
                  />
                </View>
                <View
                  style={[styles.half, styles.getResponsiveHalf(screenWidth)]}>
                  <AppInput
                    title="Age"
                    placeholder="Enter your age"
                    value={values.age}
                    onChangeText={handleChange('age')}
                    onBlur={handleBlur('age')}
                    keyboardType="numeric"
                    errorMessage={touched.age && errors.age ? errors.age : ''}
                  />
                </View>
              </View>

              {/* Row 2: Height + Weight */}
              <View style={[styles.row, styles.getResponsiveRow(screenWidth)]}>
                <View
                  style={[styles.half, styles.getResponsiveHalf(screenWidth)]}>
                  <AppInput
                    title="Height (cm)"
                    placeholder="Enter height"
                    value={values.height}
                    onChangeText={handleChange('height')}
                    onBlur={handleBlur('height')}
                    keyboardType="numeric"
                    errorMessage={
                      touched.height && errors.height ? errors.height : ''
                    }
                  />
                </View>
                <View
                  style={[styles.half, styles.getResponsiveHalf(screenWidth)]}>
                  <AppInput
                    title="Weight (kg)"
                    placeholder="Enter weight"
                    value={values.weight}
                    onChangeText={handleChange('weight')}
                    onBlur={handleBlur('weight')}
                    keyboardType="numeric"
                    errorMessage={
                      touched.weight && errors.weight ? errors.weight : ''
                    }
                  />
                </View>
              </View>

              {/* Submit Button */}
              <AppButton
                title="Sign Up"
                onPress={handleSubmit}
                containerStyle={[
                  styles.signInBtn,
                  styles.getResponsiveSignInBtn(screenWidth),
                ]}
              />

              {/* Footer */}
              <View style={styles.createRow}>
                <Text style={styles.createText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('LogIn')}>
                  <Text style={styles.linkText}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Formik>
      </KeyboardAwareScrollView>
    </ImageBackground>
  );
}
