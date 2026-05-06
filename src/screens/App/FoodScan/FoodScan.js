import React, {useState} from 'react';
import {
  View,
  Text,
  StatusBar,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  Pressable,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import ImageResizer from 'react-native-image-resizer';

import {appIcons, colors, family, HP, size, showError, showSuccess} from '../../../utilities';
import {Header, AIConsentModal} from '../../../components';
import {useAIConsentGate} from '../../../hooks/useAIConsentGate';
import {useScanCredits} from '../../../context/ScanCreditsContext';
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
  const {gateAIAction, showModal, handleAccept, handleDecline} = useAIConsentGate();
  const {scanCount, refreshBalance} = useScanCredits();
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

  const requestAndroidCameraPermission = async () => {
    if (Platform.OS !== 'android') {
      return true;
    }
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission',
        message: 'SugarCare needs camera access to take food photos for analysis.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestAndroidCameraPermission();
    if (!hasPermission) {
      showError('Camera permission is required to take a photo.');
      return;
    }
    launchCamera({...imageOptions, saveToPhotos: false}, handleImageResponse);
  };

  const handlePickFromGallery = async () => {
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
        80,
        0, // rotation handled automatically by EXIF
      );

      setCapturedImage({
        uri: resized.uri,
        // Resizer outputs JPEG here; keep metadata aligned with actual file content.
        type: 'image/jpeg',
        name: `food_${Date.now()}.jpg`,
      });
    } catch (err) {
      console.log('Image processing error:', err);
      // fallback to original image if resizing fails
      const normalizedType =
        asset.type && asset.type.startsWith('image/') ? asset.type : 'image/jpeg';
      setCapturedImage({
        uri: asset.uri,
        type: normalizedType,
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
    if (!scanCount) {
      showError('No scans left. Please purchase a plan to continue.');
      navigation.navigate('PurchaseScreen');
      return;
    }

    const ok = await gateAIAction();
    if (!ok) return;

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
        await refreshBalance();
        showSuccess(
          analysisResult.message || 'Food analysis completed successfully',
        );
        setCapturedImage(null);
        dispatch(clearFoodResult());
      } else {
        showError(analysisResult.message || 'Food analysis failed');
      }

      navigation.navigate('ScanResult', {scanData: analysisResult});
    } catch (error) {
      console.log('Scan Error:', error);
      if (error?.status === 402) {
        await refreshBalance().catch(() => {});
        showError(error?.message || 'No scans left. Please purchase a plan.');
        navigation.navigate('PurchaseScreen');
        return;
      }
      if (error?.status === 401) {
        showError('Session expired. Please login again.');
        return;
      }
      showError(error?.message || 'Scan failed. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.g13} />
      <Header
        title="Smart Food Scanner"
        isBack={false}
        onPressRight={() =>
          Alert.alert('History', 'History feature will be implemented here')
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Food Scan</Text>
        <Text style={styles.subtitle}>
          Scan your meal to get nutrition details and predicted impact on blood
          sugar
        </Text>
        <Text style={styles.subtitle}>Remaining scans: {scanCount}</Text>

        <View style={styles.heroSection}>
          <Text style={styles.sectionLabel}>Photo</Text>
          {processingImage ? (
            <View style={styles.loadingPlaceholder}>
              <ActivityIndicator size="large" color={colors.p1} />
              <Text style={styles.loadingText}>Processing image...</Text>
            </View>
          ) : capturedImage ? (
            <View style={styles.imagePreviewWrapper}>
              <Image
                source={{uri: capturedImage.uri}}
                style={styles.capturedImage}
                resizeMode="cover"
              />
              <Pressable
                style={({pressed}) => [
                  styles.clearImageButton,
                  pressed && styles.clearImageButtonPressed,
                ]}
                onPress={clearImage}>
                <Text style={styles.clearImageText}>×</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.illustrationCard}>
              <Image
                source={appIcons.scanImg}
                style={styles.scannerImage}
                resizeMode="contain"
              />
              <Text style={styles.illustrationHint}>
                Take a photo or choose from gallery
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actionsSection}>
          <Text style={styles.stepLabel}>Get started</Text>
          <View style={styles.buttonContainer}>
            <Pressable
              style={({pressed}) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleTakePhoto}>
              <Image
                source={appIcons.camera}
                style={styles.buttonIcon}
                resizeMode="contain"
              />
              <Text style={styles.primaryButtonText}>Take a Photo</Text>
            </Pressable>

            <Pressable
              style={({pressed}) => [
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handlePickFromGallery}>
              <Image
                source={appIcons.gallery}
                style={[styles.buttonIcon, styles.buttonIconSecondary]}
                resizeMode="contain"
              />
              <Text style={styles.secondaryButtonText}>Pick from Gallery</Text>
            </Pressable>
          </View>
        </View>

        {capturedImage && !scanning && (
          <View style={styles.scanSection}>
            <Pressable
              style={({pressed}) => [
                styles.scanButton,
                pressed && styles.scanButtonPressed,
              ]}
              onPress={handleScanFood}>
              <Image
                source={appIcons.activeScan}
                style={styles.scanButtonIcon}
                resizeMode="contain"
              />
              <Text style={styles.scanButtonText}>Scan This Food</Text>
            </Pressable>
            <Text style={styles.scanHint}>AI-powered analysis</Text>
          </View>
        )}

        {scanning && (
          <View style={styles.scanningOverlay}>
            <ActivityIndicator size="large" color={colors.p1} />
            <Text style={styles.scanningText}>Analyzing food...</Text>
          </View>
        )}
      </ScrollView>

      <AIConsentModal
        visible={showModal}
        onAccept={handleAccept}
        onDecline={handleDecline}
      />
    </SafeAreaView>
  );
};

export default FoodScanScreen;
