import React, {useEffect} from 'react';
import {
  View,
  Text,
  ImageBackground,
  Image,
  ActivityIndicator,
} from 'react-native';
import {appIcons, appImages} from '../../../utilities';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import styles from './styles';

const SplashScreen = () => {
  const navigation = useNavigation();
  const {accessToken, isInitialized} = useSelector(state => state.auth);

  useEffect(() => {
    let timeoutId;

    const navigateBasedOnAuth = () => {
      // Check if Redux Persist has rehydrated and auth is initialized
      if (isInitialized !== undefined) {
        // or use a specific initialization flag
        if (accessToken) {
          navigation.replace('BottomTabs');
        } else {
          navigation.replace('Auth');
        }
      } else {
        // If not initialized yet, wait a bit more
        timeoutId = setTimeout(navigateBasedOnAuth, 100);
      }
    };

    // Start checking after a short delay to ensure Redux is hydrated
    timeoutId = setTimeout(navigateBasedOnAuth, 1000);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [navigation, accessToken, isInitialized]);

  return (
    <ImageBackground
      source={appImages.bgImage}
      style={styles.background}
      resizeMode="cover">
      <View style={styles.overlay}>
        <View style={styles.row}>
          <Image
            source={appIcons.appIcon}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.textContainer}>
            <Text style={styles.title}>SugarCare</Text>
            <Text style={styles.subtitle}>Stay Balanced, Stay Well</Text>
            <ActivityIndicator
              size="small"
              color="#ffffff"
              style={{marginTop: 20}}
            />
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

export default SplashScreen;
