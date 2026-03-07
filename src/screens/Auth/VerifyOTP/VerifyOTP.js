import React, {useState, useEffect, useRef} from 'react';
import {View, Text, TouchableOpacity, ImageBackground} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import OTPTextInput from 'react-native-otp-textinput';
import {appImages, colors, showError, showSuccess} from '../../../utilities';
import {AppButton} from '../../../components';
import {sendOtp, verifyOtp} from '../../../redux/slices/authSlice'; // Changed from forgotPassword to sendOtp
import styles from './styles';

export default function VerifyOTP() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const {loading} = useSelector(state => state.auth);

  const {email, purpose = 'reset_pw'} = route.params || {}; // Get purpose from params
  const otpInputRef = useRef(null);

  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(59);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Timer
  useEffect(() => {
    if (timer > 0) {
      const id = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(id);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Resend OTP using the new sendOtp API
  const handleResend = async () => {
    if (!canResend) return;

    const res = await dispatch(
      sendOtp({
        email,
        purpose: purpose,
      }),
    );

    console.log('Resend OTP Response:', res);

    if (res.meta.requestStatus === 'fulfilled') {
      showSuccess('OTP sent again!');
      setTimer(59);
      setCanResend(false);
      setCode('');
      if (otpInputRef.current) {
        otpInputRef.current.clear();
      }
    } else {
      if (res.payload?.details?.validation_errors) {
        const validationErrors = res.payload.details.validation_errors;
        const messages = validationErrors
          .map(err => `${err.field.replace('body.', '')}: ${err.message}`)
          .join('\n');
        showError(messages);
      } else {
        showError(res.payload?.message || 'Failed to resend OTP');
      }
    }
  };

  // Verify OTP using the new API
  const handleVerify = async () => {
    if (code.length !== 6) {
      showError('Please enter 6-digit code');
      return;
    }

    setIsVerifying(true);
    console.log('Verifying OTP with:', {email, code, purpose});

    const res = await dispatch(
      verifyOtp({
        email,
        code: code,
        purpose: purpose,
      }),
    );

    console.log('Verify OTP Response:', res);

    if (res.meta.requestStatus === 'fulfilled') {
      showSuccess('OTP verified successfully!');

      // For password reset flow
      if (purpose === 'reset_pw') {
        // Navigate to reset password screen
        navigation.replace('SetPassword', {
          email: email,
          // No token needed for new reset password flow
        });
      }
      // For email verification flow (if you have one)
      else if (purpose === 'email_verify') {
        // Navigate to success screen or login
        navigation.replace('LogIn', {
          email: email,
          message: 'Email verified successfully! Please login.',
        });
      }
    } else {
      if (res.payload?.details?.validation_errors) {
        const validationErrors = res.payload.details.validation_errors;
        const messages = validationErrors
          .map(err => `${err.field.replace('body.', '')}: ${err.message}`)
          .join('\n');
        showError(messages);
      } else {
        showError(res.payload?.message || 'Invalid OTP');
      }
      setCode('');
      if (otpInputRef.current) {
        otpInputRef.current.clear();
      }
    }

    setIsVerifying(false);
  };

  return (
    <ImageBackground
      source={appImages.bgImage}
      style={styles.container}
      resizeMode="cover">
      <SafeAreaView style={{flex: 1}} edges={['top', 'bottom']}>
      <KeyboardAwareScrollView
        contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}
        showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.title}>Verify your email</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit code to your email. Enter it below.
          </Text>

          <View style={styles.emailPill}>
            <Text style={styles.email} numberOfLines={1}>
              {email || 'user@sugarcare.com'}
            </Text>
          </View>

          <View style={styles.otpWrapper}>
            <OTPTextInput
              ref={otpInputRef}
              inputCount={6}
              tintColor={colors.p1}
              offTintColor={colors.g4}
              textInputStyle={styles.otpBox}
              containerStyle={{}}
              handleTextChange={setCode}
              inputCellLength={1}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.resendRow}>
            <Text style={styles.resendText}>
              Didn't receive the code?{' '}
              <Text
                style={[styles.resendLink, !canResend && styles.disabledLink]}
                onPress={canResend ? handleResend : undefined}
                disabled={!canResend}>
                Resend OTP
              </Text>
            </Text>
            <View style={styles.timerBadge}>
              <Text style={styles.timerText}>
                {timer > 0
                  ? `00:${String(timer).padStart(2, '0')}`
                  : 'Code expired'}
              </Text>
            </View>
          </View>

          <AppButton
            title="Verify OTP"
            onPress={handleVerify}
            loading={loading || isVerifying}
            style={styles.verifyBtn}
            disabled={code.length !== 6}
          />

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backLink}>
            <Text style={styles.backText}>← Change Email</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}
