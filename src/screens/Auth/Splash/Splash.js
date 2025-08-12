import React, {useEffect} from 'react';
import {View, Text, ImageBackground, StyleSheet, Image} from 'react-native';
import {appIcons, appImages} from '../../../utilities';
import {useNavigation} from '@react-navigation/native';

const SplashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Auth');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);
  return (
    <ImageBackground
      source={appImages.bgImage}
      style={styles.background}
      resizeMode="stretch">
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
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 70,
    height: 70,
    marginRight: 15,
  },
  textContainer: {
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#000',
    marginTop: 4,
  },
});

export default SplashScreen;
