import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, ImageBackground} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Formik} from 'formik';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch, useSelector} from 'react-redux';

import {AppButton, AppInput} from '../../../components';
import {
  appImages,
  colors,
  loginFormFields,
  loginVS,
  normalizeEmail,
  showError,
  showSuccess,
} from '../../../utilities';
import styles from './styles';
import {useNavigation} from '@react-navigation/native';
import {loginUser, clearAuthError} from '../../../redux/slices/authSlice';
import {clearSugarForecastError} from '../../../redux/slices/sugarForecastSlice';

export default function LogIn() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {loading, error, user} = useSelector(state => state.auth);

  const [initialValues, setInitialValues] = useState({
    ...loginFormFields,
    rememberMe: false,
  });
  const [loadingCredentials, setLoadingCredentials] = useState(true);

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
          setInitialValues({
            ...loginFormFields,
            rememberMe: false,
          });
        }
      } catch (e) {
        // Error loading saved credentials - silently fail
      }
      setLoadingCredentials(false);
    })();
  }, []);

  const handleRememberMe = async (email, password, rememberMe) => {
    if (rememberMe) {
      await AsyncStorage.setItem('rememberMe', 'true');
      await AsyncStorage.setItem('savedEmail', email);
      await AsyncStorage.setItem('savedPassword', password);
    } else {
      await AsyncStorage.setItem('rememberMe', 'false');
      await AsyncStorage.removeItem('savedEmail');
      await AsyncStorage.removeItem('savedPassword');
    }
  };

  if (loadingCredentials) return null;

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
            const email = normalizeEmail(values.email);

            await handleRememberMe(email, values.password, values.rememberMe);

            // ✅ Dispatch login and log full API response
            const res = await dispatch(
              loginUser({
                email: email,
                password: values.password,
              }),
            );
            console.log('Login API Response:', JSON.stringify(res));
            if (res.meta.requestStatus === 'fulfilled') {
              showSuccess(`Welcome ${res.payload?.data?.name || 'User'}`);
              navigation.reset({
                index: 0,
                routes: [{name: 'BottomTabs'}],
              });
            } else {
              showError(res.payload?.message || 'Login failed');
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
                loading={loading}
                onPress={handleSubmit}
                // containerStyle={styles.signInBtn}
              />

              <View style={styles.createRow}>
                <Text style={styles.staticText}>Don’t have an account? </Text>
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
