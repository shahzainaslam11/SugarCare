import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, ImageBackground} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Formik} from 'formik';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppButton, AppInput} from '../../../components';
import {
  appImages,
  auth,
  colors,
  firebaseErrorMessages,
  loginFormFields,
  loginVS,
  showError,
  showSuccess,
} from '../../../utilities';
import styles from './styles';
import {useNavigation} from '@react-navigation/native';

export default function LogIn() {
  const navigation = useNavigation();
  const [initialValues, setInitialValues] = useState({
    ...loginFormFields,
    rememberMe: false,
  });
  const [loading, setLoading] = useState(true);

  // ✅ Load Remember Me + credentials on screen mount
  useEffect(() => {
    (async () => {
      try {
        const remember = await AsyncStorage.getItem('rememberMe');
        const savedEmail = await AsyncStorage.getItem('savedEmail');
        const savedPassword = await AsyncStorage.getItem('savedPassword');

        if (remember === 'true') {
          setInitialValues({
            email: savedEmail || '',
            password: savedPassword || '',
            rememberMe: true,
          });
        } else {
          await auth().signOut();
          setInitialValues({
            ...loginFormFields,
            rememberMe: false,
          });
        }
      } catch (e) {
        console.log('Error loading saved credentials', e);
      }
      setLoading(false);
    })();
  }, []);

  // ✅ Sign in & save/remove credentials
  const signInWithEmail = async (email, password, rememberMe) => {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(
        email,
        password,
      );

      if (rememberMe) {
        await AsyncStorage.setItem('rememberMe', 'true');
        await AsyncStorage.setItem('savedEmail', email);
        await AsyncStorage.setItem('savedPassword', password); // ❗ For security use SecureStore or Keychain
      } else {
        await AsyncStorage.setItem('rememberMe', 'false');
        await AsyncStorage.removeItem('savedEmail');
        await AsyncStorage.removeItem('savedPassword');
      }

      return {user: userCredential.user};
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

  if (loading) return null; // prevent Formik render before credentials are loaded

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
          initialValues={initialValues}
          validationSchema={loginVS}
          enableReinitialize
          onSubmit={async values => {
            const {user, error} = await signInWithEmail(
              values.email,
              values.password,
              values.rememberMe,
            );

            if (user) {
              showSuccess(`Welcome ${user.email}`);
              navigation.reset({
                index: 0,
                routes: [{name: 'BottomTabs'}], // defined in MainAppNav
              });
              // navigation.replace('Home');
            } else {
              showError(error || 'Login failed');
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
            <View style={styles.inner}>
              <Text style={styles.title}>Welcome Back!</Text>
              <Text style={styles.subtitle}>Sign in to track your health</Text>

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

              <View style={styles.row}>
                <View style={styles.rememberMe}>
                  <View style={{transform: [{scale: 0.8}]}}>
                    <CheckBox
                      value={values.rememberMe}
                      onValueChange={val => setFieldValue('rememberMe', val)}
                      style={{marginRight: 10}}
                      boxType="square"
                      tintColors={{true: colors.p1, false: colors.g3}}
                      onCheckColor={colors.white}
                      onTintColor={colors.white}
                      onFillColor={colors.p1}
                    />
                  </View>
                  <Text style={styles.rememberMeText}>Remember Me</Text>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              <AppButton
                title="Sign In"
                onPress={handleSubmit}
                containerStyle={styles.signInBtn}
              />
              {/* <View style={styles.dividerRow}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.divider} />
              </View>

              <View style={styles.socialRow}>
                <TouchableOpacity style={styles.socialBtn}>
                  <Image
                    source={{
                      uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg',
                    }}
                    style={styles.socialIcon}
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialBtn}>
                  <Image
                    source={{
                      uri: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
                    }}
                    style={styles.socialIcon}
                  />
                </TouchableOpacity>
              </View> */}
              <View style={styles.createRow}>
                <Text style={{color: colors.g1}}>Don’t have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                  <Text style={styles.createText}>Create One</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Formik>
      </KeyboardAwareScrollView>
    </ImageBackground>
  );
}
