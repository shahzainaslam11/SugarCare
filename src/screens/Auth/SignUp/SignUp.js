// src/screens/Auth/SignUp/index.js
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
import {AppButton, AppInput, CustomDropdown} from '../../../components';
import {
  appImages,
  firebaseErrorMessages,
  showError,
  showSuccess,
  signUpVS,
  colors,
  firestore,
  auth,
} from '../../../utilities';
import styles from './styles';
import {useNavigation} from '@react-navigation/native';

// ✅ Updated Firebase modular imports
import {createUserWithEmailAndPassword} from '@react-native-firebase/auth';
import {doc, setDoc, serverTimestamp} from '@react-native-firebase/firestore';

export default function SignUp() {
  const navigation = useNavigation();
  const {width} = Dimensions.get('window');
  const isSmall = width < 400;

  // Dropdown States
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
    {label: 'Type 1', value: 'type1'},
    {label: 'Type 2', value: 'type2'},
    {label: 'Prediabetes', value: 'prediabetes'},
    {label: 'Gestational', value: 'gestational'},
    {label: 'None', value: 'none'},
  ];

  // ✅ Updated signup function
  const signUpWithEmail = async (email, password, extra) => {
    try {
      // Create user
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const {uid} = cred.user;

      // Save user info in Firestore
      await setDoc(doc(firestore, 'users', uid), {
        email,
        name: extra.name,
        gender: extra.gender,
        age: Number(extra.age),
        height: Number(extra.height),
        weight: Number(extra.weight),
        diabetesType: extra.diabetesType,
        cholesterol: Number(extra.cholesterol),
        usingInsulin: extra.usingInsulin,
        createdAt: serverTimestamp(),
      });

      return {user: cred.user};
    } catch (e) {
      console.log('eeeeee====>', e);
      const code = e?.code || e?.message?.match(/\[([^\]]+)\]/)?.[1];
      if (code === 'auth/email-already-in-use')
        return {error: 'Email already in use.'};
      return {error: firebaseErrorMessages[code] || 'Something went wrong.'};
    }
  };

  const initialValues = {
    email: '',
    name: '',
    gender: '',
    age: '',
    height: '',
    weight: '',
    diabetesType: '',
    cholesterol: '',
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
            onSubmit={async (v, {setSubmitting}) => {
              const {user, error} = await signUpWithEmail(v.email, v.password, {
                name: v.name,
                gender: v.gender,
                age: v.age,
                height: v.height,
                weight: v.weight,
                diabetesType: v.diabetesType,
                cholesterol: v.cholesterol,
                usingInsulin: v.usingInsulin,
              });
              if (user) {
                showSuccess('Signup successful! Please login.');
                navigation.navigate('LogIn');
              } else showError(error || 'Sign up failed.');
              setSubmitting(false);
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

                {/* Name */}
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

                {/* Cholesterol */}
                <AppInput
                  title="Cholesterol (mg/dL)"
                  placeholder="e.g., 100"
                  value={values.cholesterol}
                  onChangeText={handleChange('cholesterol')}
                  onBlur={handleBlur('cholesterol')}
                  keyboardType="numeric"
                  errorMessage={touched.cholesterol && errors.cholesterol}
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

                {/* Submit Button */}
                <TouchableOpacity
                  style={[styles.signInBtn, {opacity: isSubmitting ? 0.7 : 1}]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}>
                  {isSubmitting ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={styles.signInText}>Sign Up</Text>
                  )}
                </TouchableOpacity>

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
