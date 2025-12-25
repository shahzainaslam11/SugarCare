import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import ImageResizer from 'react-native-image-resizer';

import {appIcons, colors, showError, showSuccess} from '../../../utilities';
import {AppButton, Header} from '../../../components';
import styles from './styles';

// Redux
import {useDispatch, useSelector} from 'react-redux';
import {
  analyzeFoodImage,
  clearFoodResult,
  clearFoodError,
} from '../../../redux/slices/foodRecognitionSlice';

const FoodScanScreen = ({route}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [capturedImage, setCapturedImage] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);

  const {accessToken, user} = useSelector(state => state.auth);

  // If image comes from server, set it
  React.useEffect(() => {
    if (route?.params?.serverImage) {
      setCapturedImage({
        uri: route.params.serverImage,
        type: 'image/jpeg',
        name: `server_image_${Date.now()}.jpg`,
      });
    }
  }, [route?.params?.serverImage]);

  const imageOptions = {
    mediaType: 'photo',
    quality: 0.8,
    includeExtra: true, // includes EXIF data
  };

  const handleTakePhoto = () => {
    launchCamera({...imageOptions, saveToPhotos: true}, handleImageResponse);
  };

  const handlePickFromGallery = () => {
    launchImageLibrary(
      {...imageOptions, selectionLimit: 1},
      handleImageResponse,
    );
  };

  // ✅ Fix rotation before setting capturedImage
  const handleImageResponse = async response => {
    if (!response) return;
    if (response.didCancel) return;
    if (response.errorCode || response.errorMessage) {
      Alert.alert(
        'Image Error',
        response.errorMessage || 'Failed to pick image',
      );
      return;
    }

    const asset = response?.assets?.[0];
    if (!asset?.uri) {
      Alert.alert('Error', 'Invalid image selected. Try another image.');
      return;
    }

    try {
      setProcessingImage(true);

      // Rotate and resize image properly
      const resized = await ImageResizer.createResizedImage(
        asset.uri,
        1080, // width
        1080, // height
        'JPEG',
        100,
        0, // rotation handled automatically by EXIF
      );

      setCapturedImage({
        uri: resized.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || `food_${Date.now()}.jpg`,
      });
    } catch (err) {
      console.log('Image processing error:', err);
      // fallback to original image if resizing fails
      setCapturedImage({
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || `food_${Date.now()}.jpg`,
      });
    } finally {
      setProcessingImage(false);
    }
  };

  const clearImage = () => {
    setCapturedImage(null);
    dispatch(clearFoodResult());
    dispatch(clearFoodError());
  };

  const handleScanFood = async () => {
    if (!capturedImage?.uri) {
      showError('No image to scan');
      return;
    }
    if (!user?.id || !accessToken) {
      showError('User not found');
      return;
    }

    setScanning(true);

    const file = {
      uri: capturedImage.uri,
      type: capturedImage.type,
      name: capturedImage.name,
    };

    try {
      const analysisResult = await dispatch(
        analyzeFoodImage({file, user_id: user.id, token: accessToken}),
      ).unwrap();

      console.log('analysisResult---?', JSON.stringify(analysisResult));

      // ✅ Show success or error message
      if (analysisResult?.status === 'success') {
        showSuccess(
          analysisResult.message || 'Food analysis completed successfully',
        );
      } else {
        showError(analysisResult.message || 'Food analysis failed');
      }

      navigation.navigate('AppScreens', {
        screen: 'ScanResult',
        params: {scanData: analysisResult},
      });
    } catch (error) {
      console.log('Scan Error:', error);
      showError('Scan failed. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <Header
        title="Smart Food Scanner"
        isBack={false}
        onPressRight={() =>
          Alert.alert('History', 'History feature will be implemented here')
        }
      />

      <View style={styles.content}>
        {processingImage ? (
          <ActivityIndicator size="large" color={colors.p1} />
        ) : capturedImage ? (
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{uri: capturedImage.uri}}
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
          Scan your meal to get nutrition details and{'\n'}
          predicted impact on blood sugar
        </Text>

        <View style={styles.buttonContainer}>
          <AppButton
            title="Take a Photo"
            icon={appIcons.camera}
            onPress={handleTakePhoto}
          />
          <AppButton
            title="Pick from Gallery"
            icon={appIcons.gallery}
            backgroundColor={colors.g11}
            titleStyle={{color: colors.p1}}
            onPress={handlePickFromGallery}
          />
        </View>

        {capturedImage && !scanning && (
          <TouchableOpacity style={styles.scanButton} onPress={handleScanFood}>
            <Text style={styles.scanButtonText}>Scan This Food</Text>
          </TouchableOpacity>
        )}

        {scanning && (
          <View style={{marginTop: 20, alignItems: 'center'}}>
            <ActivityIndicator size="large" color={colors.p1} />
            <Text style={{marginTop: 8}}>Analyzing Food...</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default FoodScanScreen;
