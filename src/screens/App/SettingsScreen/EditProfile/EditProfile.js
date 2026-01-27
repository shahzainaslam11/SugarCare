import React, {useEffect, useState, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Switch,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  AppButton,
  Header,
  CustomDropdown,
  AppInput,
  SmallLoader,
} from '../../../../components';
import {
  appIcons,
  appImages,
  colors,
  showSuccess,
  showError,
} from '../../../../utilities';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import styles from './styles';
import {useDispatch, useSelector} from 'react-redux';
import {
  fetchProfile,
  updateProfile,
  uploadProfileImage,
  deleteProfileImage,
} from '../../../../redux/slices/profileSlice';

const EditProfile = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const {data: profile, loading} = useSelector(state => state.profile);
  const {accessToken} = useSelector(state => state.auth);

  /* ---------------- IMAGE STATE ---------------- */
  const [localImage, setLocalImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());

  const imageSource = useMemo(() => {
    if (localImage) {
      return {uri: localImage};
    }
    if (profile?.profile_image) {
      return {uri: `${profile.profile_image}?t=${imageTimestamp}`};
    }
    return appImages.messi;
  }, [localImage, profile?.profile_image, imageTimestamp]);

  /* ---------------- FORM STATE ---------------- */
  const [name, setName] = useState('');
  const [genderOpen, setGenderOpen] = useState(false);
  const [genderValue, setGenderValue] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [diabetesType, setDiabetesType] = useState('');
  const [diabetesOpen, setDiabetesOpen] = useState(false);
  const [cholesterol, setCholesterol] = useState('');
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

  /* ---------------- FETCH PROFILE ---------------- */
  const loadProfile = useCallback(() => {
    console.log('=== LOAD PROFILE START ===');
    console.log('Access token available:', !!accessToken);

    if (!accessToken) {
      console.log('No access token, skipping profile load');
      return;
    }

    console.log('Dispatching fetchProfile...');

    dispatch(fetchProfile({token: accessToken}))
      .unwrap()
      .then(data => {
        console.log('=== PROFILE LOAD SUCCESS ===');
        console.log('Profile data received:', JSON.stringify(data, null, 2));

        setName(data.name || '');
        setGenderValue(data.gender || '');
        setAge(data.age?.toString() || '');
        setHeight(data.height_cm?.toString() || '');
        setWeight(data.weight_kg?.toString() || '');
        setDiabetesType(data.diabetes_type || '');
        setCholesterol(data.cholesterol_mg_dl?.toString() || '');
        setUsingInsulin(!!data.using_insulin);

        console.log('Profile state updated successfully');
      })
      .catch(err => {
        console.log('=== PROFILE LOAD ERROR ===');
        console.log('Error message:', err?.message);
        if (err?.response?.status === 401) {
          showError('Session expired, please login again');
          dispatch({type: 'auth/logout'});
        } else {
          showError(err?.message || 'Failed to load profile');
        }
      });
  }, [accessToken, dispatch]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  /* ---------------- IMAGE PICKER ---------------- */
  const pickImage = () => {
    Alert.alert('Change Profile Photo', 'Select source', [
      {text: 'Camera', onPress: openCamera},
      {text: 'Gallery', onPress: openLibrary},
      {text: 'Cancel', style: 'cancel'},
    ]);
  };

  const openCamera = () =>
    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.7,
        maxWidth: 800,
        maxHeight: 800,
        includeBase64: false,
      },
      handleImage,
    );

  const openLibrary = () =>
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.7,
        maxWidth: 800,
        maxHeight: 800,
        includeBase64: false,
      },
      handleImage,
    );

  const handleImage = async response => {
    console.log('=== IMAGE PICKER RESPONSE START ===');
    console.log('Full response:', JSON.stringify(response, null, 2));

    if (response.didCancel) {
      console.log('User cancelled image picker');
      return;
    }

    if (response.errorCode) {
      console.log('Image picker error:', response.errorMessage);
      console.log('Error code:', response.errorCode);
      showError(response.errorMessage || 'Failed to pick image');
      return;
    }

    const asset = response.assets?.[0];
    console.log('Selected asset:', JSON.stringify(asset, null, 2));

    if (!asset?.uri) {
      console.log('No asset URI found');
      showError('No image selected');
      return;
    }

    console.log('=== STARTING UPLOAD PROCESS ===');
    console.log('Setting uploadingImage to true');

    try {
      setUploadingImage(true);
      setLocalImage(asset.uri);

      console.log('Creating file data...');
      const fileData = {
        uri: asset.uri,
        name: asset.fileName || `profile_${Date.now()}.jpg`,
        type: asset.type || 'image/jpeg',
      };

      console.log('File data to upload:', JSON.stringify(fileData, null, 2));
      console.log('Access token available:', !!accessToken);

      console.log('Dispatching uploadProfileImage...');

      const unwrapResult = await dispatch(
        uploadProfileImage({
          token: accessToken,
          file: fileData,
        }),
      ).unwrap();

      console.log('=== UPLOAD SUCCESS ===');
      console.log('Unwrap result:', JSON.stringify(unwrapResult, null, 2));

      console.log('Upload successful, clearing local image');
      showSuccess('Profile image updated');
      setLocalImage(null);
      setImageTimestamp(Date.now()); // Force image reload
    } catch (error) {
      console.log('=== UPLOAD ERROR ===');
      console.log('Error message:', error?.message);
      console.log('Error response:', error?.response);
      console.log('Error response data:', error?.response?.data);

      setLocalImage(null);
      if (error?.response?.status === 401) {
        showError('Session expired, please login again');
        dispatch({type: 'auth/logout'});
      } else {
        const errorMessage =
          error?.response?.data?.message || error?.message || 'Upload failed';
        console.log('Final error message to show:', errorMessage);
        showError(errorMessage);
      }
    } finally {
      console.log('=== FINALLY BLOCK ===');
      console.log('Setting uploadingImage to false');
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    console.log('=== REMOVE IMAGE START ===');

    Alert.alert('Remove Photo', 'Are you sure?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          console.log(
            'User confirmed image removal, dispatching deleteProfileImage...',
          );

          try {
            const result = await dispatch(
              deleteProfileImage({token: accessToken}),
            ).unwrap();
            console.log('=== REMOVE IMAGE SUCCESS ===');
            console.log('Delete result:', JSON.stringify(result, null, 2));

            showSuccess('Profile image removed');
            setImageTimestamp(Date.now()); // Force image reload
            console.log('Profile reloaded after image removal');
          } catch (err) {
            console.log('=== REMOVE IMAGE ERROR ===');
            console.log('Error message:', err?.message);
            if (err?.response?.status === 401) {
              showError('Session expired, please login again');
              dispatch({type: 'auth/logout'});
            } else {
              const errorMsg = err?.message;
              if (errorMsg && errorMsg.includes("Can't find variable")) {
                Alert.alert(
                  'Error',
                  'Failed to remove image. Please try again.',
                );
              } else {
                Alert.alert('Error', errorMsg || 'Failed to remove image');
              }
            }
          }
        },
      },
    ]);
  };

  /* ---------------- SAVE PROFILE ---------------- */
  const saveProfile = async () => {
    console.log('=== SAVE PROFILE START ===');

    if (!name.trim()) {
      console.log('Validation failed: Name is empty');
      showError('Please enter your name');
      return;
    }

    const payload = {
      name: name.trim(),
      gender: genderValue,
      using_insulin: usingInsulin,
      diabetes_type: diabetesType,
    };

    // Add optional numeric fields
    if (age) payload.age = Number(age);
    if (height) payload.height_cm = Number(height);
    if (weight) payload.weight_kg = Number(weight);
    if (cholesterol) payload.cholesterol_mg_dl = Number(cholesterol);

    console.log('Profile payload to save:', JSON.stringify(payload, null, 2));
    console.log('Dispatching updateProfile...');

    try {
      const result = await dispatch(
        updateProfile({
          token: accessToken,
          payload,
        }),
      ).unwrap();

      console.log('=== SAVE PROFILE SUCCESS ===');
      console.log('Update result:', JSON.stringify(result, null, 2));

      showSuccess('Profile updated');
      navigation.goBack();
    } catch (err) {
      console.log('=== SAVE PROFILE ERROR ===');
      console.log('Error message:', err?.message);
      if (err?.response?.status === 401) {
        showError('Session expired, please login again');
        dispatch({type: 'auth/logout'});
      } else {
        showError(err?.message || 'Update failed');
      }
    }
  };

  // Utility to lowercase first letter
  const lowerFirst = str =>
    str ? str.charAt(0).toLowerCase() + str.slice(1) : '';

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Edit Profile" onPress={() => navigation.goBack()} />

      {loading && <SmallLoader />}

      <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar Container - Fixed Structure */}
        <View style={styles.avatarContainer}>
          {/* Avatar Image Container */}
          <View style={styles.avatarContainer}>
            <Image
              source={imageSource}
              style={styles.avatar}
              onError={() => console.log('Image load error')}
            />

            {/* Camera Button - Positioned at bottom right of avatar */}
            <TouchableOpacity
              style={styles.cameraBtn}
              onPress={pickImage}
              disabled={uploadingImage}>
              <Image source={appIcons.camera} style={styles.cameraIcon} />
            </TouchableOpacity>
          </View>

          {/* Remove Badge - Positioned below avatar */}
          {profile?.profile_image && (
            <TouchableOpacity
              style={styles.removeBadge}
              onPress={removeImage}
              disabled={uploadingImage}>
              <Text style={styles.removeBadgeText}>Remove</Text>
            </TouchableOpacity>
          )}

          {/* Uploading Overlay - Only covers the avatar image */}
          {uploadingImage && (
            <View style={styles.avatarOverlay}>
              <ActivityIndicator color={colors.white} size="large" />
              <Text style={styles.uploadingText}>Uploading...</Text>
            </View>
          )}
        </View>

        <View style={styles.scrollContent}>
          <AppInput title="Name" value={name} onChangeText={setName} />
          <AppInput
            title="Email"
            value={lowerFirst(profile?.email)}
            editable={false}
          />

          <View style={styles.row}>
            <View style={styles.half}>
              <CustomDropdown
                title="Gender"
                open={genderOpen}
                setOpen={setGenderOpen}
                value={genderValue}
                setValue={setGenderValue}
                items={genderItems}
              />
            </View>

            <View style={styles.half}>
              <AppInput
                title="Age"
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.half}>
              <AppInput
                title="Height (cm)"
                keyboardType="numeric"
                value={height}
                onChangeText={setHeight}
              />
            </View>

            <View style={styles.half}>
              <AppInput
                title="Weight (kg)"
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.half}>
              <CustomDropdown
                title="Diabetes Type"
                open={diabetesOpen}
                setOpen={setDiabetesOpen}
                value={diabetesType}
                setValue={setDiabetesType}
                items={diabetesItems}
              />
            </View>

            <View style={styles.half}>
              <AppInput
                title="Cholesterol"
                keyboardType="numeric"
                value={cholesterol}
                onChangeText={setCholesterol}
              />
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.insulinText}>Using Insulin</Text>
            <Switch
              value={usingInsulin}
              onValueChange={setUsingInsulin}
              trackColor={{false: colors.g2, true: colors.p1}}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>

      <View style={styles.saveBtn}>
        <AppButton
          title="Save"
          onPress={saveProfile}
          disabled={loading || uploadingImage}
        />
      </View>
    </SafeAreaView>
  );
};

export default EditProfile;
