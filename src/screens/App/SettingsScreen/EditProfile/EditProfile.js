import React, {useEffect, useState, useCallback} from 'react';
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
import ImageResizer from 'react-native-image-resizer';

const EditProfile = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const {data: profile, loading} = useSelector(state => state.profile);
  const {accessToken} = useSelector(state => state.auth);

  /* ---------------- IMAGE STATE ---------------- */
  const [localImage, setLocalImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const serverImageUrl = profile?.profile_image
    ? `${profile.profile_image}?t=${profile.updated_at}`
    : null;

  const imageSource = localImage
    ? {uri: localImage}
    : serverImageUrl
    ? {uri: serverImageUrl}
    : appImages.messi;
  console.log('imageSource', imageSource);

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
    if (!accessToken) return;

    dispatch(fetchProfile({token: accessToken}))
      .unwrap()
      .then(data => {
        console.log('data---->', JSON.stringify(data));
        setLocalImage(null);
        setName(data.name || '');
        setGenderValue(data.gender || '');
        setAge(data.age?.toString() || '');
        setHeight(data.height_cm?.toString() || '');
        setWeight(data.weight_kg?.toString() || '');
        setDiabetesType(data.diabetes_type || '');
        setCholesterol(data.cholesterol_mg_dl?.toString() || '');
        setUsingInsulin(!!data.using_insulin);
      })
      .catch(err => showError(err?.message || 'Failed to load profile'));
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
    launchCamera({mediaType: 'photo', quality: 0.9}, handleImage);

  const openLibrary = () =>
    launchImageLibrary({mediaType: 'photo', quality: 0.9}, handleImage);

  const handleImage = async response => {
    if (response.didCancel || response.errorCode) return;

    const asset = response.assets?.[0];
    if (!asset?.uri) return;

    try {
      const resized = await ImageResizer.createResizedImage(
        asset.uri,
        800,
        800,
        'JPEG',
        90,
      );

      setLocalImage(resized.uri);
      setUploadingImage(true);

      const file = {
        uri:
          Platform.OS === 'ios'
            ? resized.uri.replace('file://', '')
            : resized.uri,
        type: asset.type || 'image/jpeg',
        name: `profile_${Date.now()}.jpg`,
      };

      dispatch(uploadProfileImage({token: accessToken, file}))
        .unwrap()
        .then(() => {
          showSuccess('Profile image updated');
          setUploadingImage(false);
          loadProfile();
        })
        .catch(err => {
          setUploadingImage(false);
          setLocalImage(null);
          showError(err?.message || 'Upload failed');
        });
    } catch {
      showError('Image processing failed');
    }
  };

  const removeImage = () => {
    Alert.alert('Remove Photo', 'Are you sure?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          dispatch(deleteProfileImage({token: accessToken}))
            .unwrap()
            .then(() => {
              showSuccess('Profile image removed');
              loadProfile();
            })
            .catch(err => showError(err?.message || 'Failed to remove image'));
        },
      },
    ]);
  };

  /* ---------------- SAVE ---------------- */
  const saveProfile = () => {
    dispatch(
      updateProfile({
        token: accessToken,
        payload: {
          name,
          age: Number(age),
          height_cm: Number(height),
          weight_kg: Number(weight),
          gender: genderValue,
          diabetes_type: diabetesType,
          cholesterol_mg_dl: Number(cholesterol),
          using_insulin: usingInsulin,
        },
      }),
    )
      .unwrap()
      .then(() => {
        showSuccess('Profile updated');
        navigation.goBack();
      })
      .catch(err => showError(err?.message || 'Update failed'));
  };

  if (loading) {
    return (
      <View style={styles.loaderScreen}>
        <ActivityIndicator size="large" color={colors.p1} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Edit Profile" onPress={() => navigation.goBack()} />

      <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.avatarContainer}>
          <Image source={imageSource} style={styles.avatar} />

          <TouchableOpacity style={styles.cameraBtn} onPress={pickImage}>
            <Image source={appIcons.camera} style={styles.cameraIcon} />
          </TouchableOpacity>

          {profile?.profile_image && (
            <TouchableOpacity style={styles.removeBadge} onPress={removeImage}>
              <Text style={styles.removeBadgeText}>Remove</Text>
            </TouchableOpacity>
          )}

          {uploadingImage && (
            <View style={styles.loaderOverlay}>
              <ActivityIndicator color={colors.white} />
            </View>
          )}
        </View>

        <View style={styles.scrollContent}>
          <AppInput title="Name" value={name} onChangeText={setName} />
          <AppInput title="Email" value={profile?.email} editable={false} />

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
        <AppButton title="Save" onPress={saveProfile} />
      </View>
    </SafeAreaView>
  );
};

export default EditProfile;
