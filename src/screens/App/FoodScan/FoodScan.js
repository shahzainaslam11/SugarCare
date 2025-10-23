import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StatusBar,
  Image,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {appIcons, colors} from '../../../utilities';
import {AppButton, Header} from '../../../components';
import styles from './styles';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';

const FoodScanScreen = () => {
  const navigation = useNavigation();
  const [capturedImage, setCapturedImage] = useState(null);

  const handleTakePhoto = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      saveToPhotos: true,
      cameraType: 'back',
      includeBase64: false,
    };

    launchCamera(options, response => {
      if (response.didCancel) {
        console.log('User cancelled camera');
        Alert.alert('Info', 'Camera cancelled');
      } else if (response.error) {
        console.log('Camera Error: ', response.error);
        Alert.alert('Error', 'Failed to take photo: ' + response.error);
      } else if (response.assets && response.assets.length > 0) {
        const image = response.assets[0];
        console.log('Photo taken:', image);
        setCapturedImage(image.uri);

        Alert.alert(
          'Success',
          'Photo captured successfully!\nYou can now scan this food item.',
          [
            {
              text: 'Scan Food',
              onPress: () => handleScanFood(image.uri),
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ],
        );
      }
    });
  };

  const handlePickFromGallery = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: 1,
      includeBase64: false,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled gallery');
        Alert.alert('Info', 'Gallery selection cancelled');
      } else if (response.error) {
        console.log('Gallery Error: ', response.error);
        Alert.alert('Error', 'Failed to pick image: ' + response.error);
      } else if (response.assets && response.assets.length > 0) {
        const image = response.assets[0];
        console.log('Image selected:', image);
        setCapturedImage(image.uri);

        Alert.alert(
          'Success',
          'Image selected successfully!\nYou can now scan this food item.',
          [
            {
              text: 'Scan Food',
              onPress: () => handleScanFood(image.uri),
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ],
        );
      }
    });
  };

  const handleScanFood = imageUri => {
    console.log('Scanning food from image:', imageUri);
    // Add your food scanning logic here
    // This could be an API call to your food recognition service

    Alert.alert(
      'Scanning Food',
      'Analyzing food image for nutrition details...',
      [
        {
          text: 'OK',
          onPress: () => {
            // Simulate scanning process
            setTimeout(() => {
              Alert.alert(
                'Scan Complete',
                'Food analysis completed!\n\nFood: Pizza\nCalories: 285 cal\nCarbs: 36g\nProtein: 12g\nFat: 10g',
              );
            }, 2000);
          },
        },
      ],
    );
  };

  const handleHistoryPress = () => {
    console.log('History button pressed');
    Alert.alert('History', 'History feature will be implemented here');
  };

  const clearImage = () => {
    setCapturedImage(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <Header
        title="Smart Food Scanner"
        isBack={false}
        onPressRight={handleHistoryPress}
      />

      <View style={styles.content}>
        {/* Show captured/selected image or default scanner image */}
        {capturedImage ? (
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{uri: capturedImage}}
              style={styles.capturedImage}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.clearImageButton}
              onPress={clearImage}>
              <Text style={styles.clearImageText}>×</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Image
            source={appIcons.scanImg}
            style={styles.scannerImage}
            resizeMode="contain"
          />
        )}

        <Text style={styles.title}>Food Scan</Text>

        <Text style={styles.subtitle}>
          Scan your meal to get nutrition details and{'\n'}predicted impact on
          blood sugar
        </Text>

        <View style={styles.buttonContainer}>
          <AppButton
            title="Take a new Photo"
            icon={appIcons.camera}
            // onPress={handleTakePhoto}
            onPress={() =>
              navigation.navigate('AppScreens', {screen: 'ScanResult'})
            }
          />
          <AppButton
            title="Pick from Gallery"
            icon={appIcons.gallery}
            backgroundColor={colors.g11}
            titleStyle={{color: colors.p1}}
            onPress={handlePickFromGallery}
          />
        </View>

        {/* Show scan button if image is captured/selected */}
        {capturedImage && (
          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => handleScanFood(capturedImage)}>
            <Text style={styles.scanButtonText}>Scan This Food</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default FoodScanScreen;
