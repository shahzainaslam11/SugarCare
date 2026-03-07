import React, {useState, useCallback, useMemo, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Switch,
  ActivityIndicator,
  Alert,
  Keyboard,
} from 'react-native';
import FastImage from 'react-native-fast-image';
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

const EditProfile = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const {data: profile, loading} = useSelector(state => state.profile);
  const {accessToken} = useSelector(state => state.auth);

  /* ---------------- IMAGE STATE ---------------- */
  const [localImage, setLocalImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  useEffect(() => {
    setAvatarLoadError(false);
  }, [profileImageUrl, imageTimestamp]);

  const profileImageUrl = profile?.profile_image?.trim?.()
    ? profile.profile_image.trim()
    : null;

  const imageSource = useMemo(() => {
    if (localImage) {
      return {uri: localImage};
    }
    if (profileImageUrl && !avatarLoadError) {
      return {uri: `${profileImageUrl}?t=${imageTimestamp}`};
    }
    return appImages.messi;
  }, [localImage, profileImageUrl, imageTimestamp, avatarLoadError]);

  /* ---------------- FORM STATE ---------------- */
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [genderOpen, setGenderOpen] = useState(false);
  const [genderValue, setGenderValue] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [diabetesType, setDiabetesType] = useState('');
  const [diabetesOpen, setDiabetesOpen] = useState(false);
  const [dietType, setDietType] = useState('');
  const [dietTypeOpen, setDietTypeOpen] = useState(false);
  const [activityLevel, setActivityLevel] = useState('');
  const [activityLevelOpen, setActivityLevelOpen] = useState(false);
  const [cholesterol, setCholesterol] = useState('');
  const [hba1c, setHba1c] = useState('');
  const [usingInsulin, setUsingInsulin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileFormReady, setProfileFormReady] = useState(false);

  const setGenderOpenSafe = useCallback(v => {
    setGenderOpen(v);
    if (v) {
      setDiabetesOpen(false);
      setDietTypeOpen(false);
      setActivityLevelOpen(false);
    }
  }, []);
  const setDiabetesOpenSafe = useCallback(v => {
    setDiabetesOpen(v);
    if (v) {
      setGenderOpen(false);
      setDietTypeOpen(false);
      setActivityLevelOpen(false);
    }
  }, []);
  const setDietTypeOpenSafe = useCallback(v => {
    setDietTypeOpen(v);
    if (v) {
      setGenderOpen(false);
      setDiabetesOpen(false);
      setActivityLevelOpen(false);
    }
  }, []);
  const setActivityLevelOpenSafe = useCallback(v => {
    setActivityLevelOpen(v);
    if (v) {
      setGenderOpen(false);
      setDiabetesOpen(false);
      setDietTypeOpen(false);
    }
  }, []);

  const genderItems = [
    {label: 'Male', value: 'male'},
    {label: 'Female', value: 'female'},
    {label: 'Other', value: 'other'},
  ];

  const diabetesItems = [
    {label: 'Type 1', value: 'Type 1'},
    {label: 'Type 2', value: 'Type 2'},
    {label: 'Prediabetes', value: 'Prediabetes'},
    {label: 'Gestational', value: 'Gestational'},
    {label: 'None', value: 'None'},
  ];

  const dietTypeItems = [
    {label: 'Balanced', value: 'balanced'},
    {label: 'High Carb', value: 'high_carb'},
    {label: 'Low Carb', value: 'low_carb'},
  ];

  const activityLevelItems = [
    {label: 'Low', value: 'low'},
    {label: 'Moderate', value: 'moderate'},
    {label: 'High', value: 'high'},
  ];

  /* ---------------- FETCH PROFILE ---------------- */
  const loadProfile = useCallback(() => {
    if (!accessToken) return;
    setProfileFormReady(false);
    dispatch(fetchProfile({token: accessToken}))
      .unwrap()
      .then(data => {
        console.log('EditProfile - loaded data (on screen open):', JSON.stringify(data));
        setName(data.name || '');
        setDob(data.dob ? String(data.dob) : '');
        setGenderValue(data.gender || '');
        setAge(data.age?.toString() || '');
        setHeight(data.height_cm?.toString() || '');
        setWeight(data.weight_kg?.toString() || '');
        setDiabetesType(data.diabetes_type || '');
        setDietType(data.diet_type || '');
        setActivityLevel(data.activity_level || '');
        setCholesterol(data.cholesterol_mg_dl?.toString() || '');
        setHba1c(
          (data.hba1c ?? data.hba1c_percent ?? '')?.toString() || '',
        );
        setUsingInsulin(!!data.using_insulin);
        setProfileFormReady(true);
      })
      .catch(err => {
        setProfileFormReady(true);
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
      Keyboard.dismiss();
      return () => Keyboard.dismiss();
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
    if (response.didCancel) return;
    if (response.errorCode) {
      console.log('Image picker error:', response.errorMessage);
      console.log('Error code:', response.errorCode);
      showError(response.errorMessage || 'Failed to pick image');
      return;
    }
    const asset = response.assets?.[0];
    if (!asset?.uri) {
      showError('No image selected');
      return;
    }
    try {
      setUploadingImage(true);
      setLocalImage(asset.uri);
      const fileData = {
        uri: asset.uri,
        name: asset.fileName || `profile_${Date.now()}.jpg`,
        type: asset.type || 'image/jpeg',
      };
      await dispatch(
        uploadProfileImage({token: accessToken, file: fileData}),
      ).unwrap();
      showSuccess('Profile image updated');
      setLocalImage(null);
      setImageTimestamp(Date.now()); // Force image reload
    } catch (error) {
      setLocalImage(null);
      if (error?.response?.status === 401) {
        showError('Session expired, please login again');
        dispatch({type: 'auth/logout'});
      } else {
        showError(
          error?.response?.data?.message || error?.message || 'Upload failed',
        );
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    Alert.alert('Remove Photo', 'Are you sure?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await dispatch(
              deleteProfileImage({token: accessToken}),
            ).unwrap();
            showSuccess('Profile image removed');
            setImageTimestamp(Date.now());
          } catch (err) {
            if (err?.response?.status === 401) {
              showError('Session expired, please login again');
              dispatch({type: 'auth/logout'});
            } else {
              showError(err?.message || 'Failed to remove image');
            }
          }
        },
      },
    ]);
  };

  /* ---------------- SAVE PROFILE ---------------- */
  const saveProfile = async () => {
    if (!name.trim()) {
      showError('Please enter your name');
      return;
    }
    if (!dietType) {
      showError('Please select Diet Type');
      return;
    }
    if (!activityLevel) {
      showError('Please select Activity Level');
      return;
    }
    if (isSaving) return;
    setIsSaving(true);

    // Payload matching API: name, dob, age, height_cm, weight_kg, gender, diabetes_type, cholesterol_mg_dl, using_insulin, hba1c, diet_type, activity_level
    const payload = {
      name: name.trim(),
      dob: (dob && dob.trim()) ? dob.trim() : '',
      age: age ? Number(age) : 0,
      height_cm: height ? Number(height) : 0,
      weight_kg: weight ? Number(weight) : 0,
      gender: genderValue || '',
      diabetes_type: diabetesType || '',
      cholesterol_mg_dl: cholesterol ? Number(cholesterol) : 0,
      using_insulin: usingInsulin,
      hba1c: hba1c ? Number(hba1c) : 0,
      diet_type: dietType || '',
      activity_level: activityLevel || '',
    };

    console.log('EditProfile - save payload (sending to API):', JSON.stringify(payload));

    try {
      await dispatch(
        updateProfile({
          token: accessToken,
          payload,
        }      ),
      ).unwrap();

      showSuccess('Profile updated');
      navigation.goBack();
    } catch (err) {
      if (err?.response?.status === 401) {
        showError('Session expired, please login again');
        dispatch({type: 'auth/logout'});
      } else {
        showError(err?.message || 'Update failed');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const lowerFirst = str =>
    str ? str.charAt(0).toLowerCase() + str.slice(1) : '';
  const hasProfileImage = !!profileImageUrl && !avatarLoadError;

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Edit Profile" onPress={() => navigation.goBack()} />

      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.scrollContentContainer}>
        <View style={styles.heroSection}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarRing}>
              <FastImage
                source={
                  typeof imageSource === 'object' && imageSource?.uri
                    ? {uri: imageSource.uri, priority: FastImage.priority.normal}
                    : imageSource
                }
                style={styles.avatar}
                resizeMode={FastImage.resizeMode.cover}
                onError={() => setAvatarLoadError(true)}
              />
              {uploadingImage && (
                <View style={styles.avatarOverlay}>
                  <ActivityIndicator color={colors.white} size="large" />
                  <Text style={styles.uploadingText}>Uploading...</Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.cameraBtn}
              onPress={pickImage}
              disabled={uploadingImage}>
              <Image source={appIcons.camera} style={styles.cameraIcon} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.scrollContent}>
          <View style={styles.formCard}>
            <View style={styles.avatarActions}>
              <TouchableOpacity
                style={styles.changePhotoBtn}
                onPress={pickImage}
                disabled={uploadingImage}
                activeOpacity={0.7}>
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>
              {hasProfileImage && (
                <TouchableOpacity
                  style={styles.removePhotoBtn}
                  onPress={removeImage}
                  disabled={uploadingImage}
                  activeOpacity={0.7}>
                  <Text style={styles.removePhotoText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionDot} />
              <Text style={styles.cardTitle}>PERSONAL INFO</Text>
            </View>
            <AppInput
              title="Full Name"
              placeholder="Your name"
              value={name}
              onChangeText={setName}
            />
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
                  setOpen={setGenderOpenSafe}
                  value={genderValue}
                  setValue={setGenderValue}
                  items={genderItems}
                  placeholder="Select"
                  zIndex={4000}
                  zIndexInverse={1000}
                />
              </View>
              <View style={styles.half}>
                <AppInput
                  title="Age"
                  placeholder="Age"
                  keyboardType="numeric"
                  value={age}
                  onChangeText={setAge}
                />
              </View>
            </View>

            <View style={styles.divider} />
            <View style={styles.sectionHeader}>
              <View style={styles.sectionDot} />
              <Text style={styles.cardTitle}>BODY</Text>
            </View>
            <View style={styles.row}>
              <View style={styles.half}>
                <AppInput
                  title="Height (cm)"
                  placeholder="170"
                  keyboardType="numeric"
                  value={height}
                  onChangeText={setHeight}
                />
              </View>
              <View style={styles.half}>
                <AppInput
                  title="Weight (kg)"
                  placeholder="70"
                  keyboardType="numeric"
                  value={weight}
                  onChangeText={setWeight}
                />
              </View>
            </View>

            <View style={styles.divider} />
            <View style={styles.sectionHeader}>
              <View style={styles.sectionDot} />
              <Text style={styles.cardTitle}>HEALTH</Text>
            </View>
            <View style={styles.row}>
              <View style={styles.half}>
                {profileFormReady ? (
                  <CustomDropdown
                    key={`diabetes-${diabetesType}`}
                    title="Diabetes Type"
                    open={diabetesOpen}
                    setOpen={setDiabetesOpenSafe}
                    value={diabetesType}
                    setValue={setDiabetesType}
                    items={diabetesItems}
                    placeholder="Select"
                    zIndex={3000}
                    zIndexInverse={2000}
                  />
                ) : (
                  <View style={styles.dropdownPlaceholder}>
                    <Text style={styles.dropdownPlaceholderLabel}>Diabetes Type</Text>
                    <View style={[styles.dropdown, styles.dropdownPlaceholderBox]}>
                      <Text style={styles.dropdownPlaceholderText}>Loading...</Text>
                    </View>
                  </View>
                )}
              </View>
              <View style={styles.half}>
                <AppInput
                  title="Cholesterol"
                  placeholder="Cholesterol"
                  keyboardType="numeric"
                  value={cholesterol}
                  onChangeText={setCholesterol}
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.half}>
                {profileFormReady ? (
                  <CustomDropdown
                    key={`diet-${dietType}`}
                    title="Diet Type"
                    open={dietTypeOpen}
                    setOpen={setDietTypeOpenSafe}
                    value={dietType}
                    setValue={setDietType}
                    items={dietTypeItems}
                    placeholder="Select"
                    zIndex={2000}
                    zIndexInverse={3000}
                  />
                ) : (
                  <View style={styles.dropdownPlaceholder}>
                    <Text style={styles.dropdownPlaceholderLabel}>Diet Type</Text>
                    <View style={[styles.dropdown, styles.dropdownPlaceholderBox]}>
                      <Text style={styles.dropdownPlaceholderText}>Loading...</Text>
                    </View>
                  </View>
                )}
              </View>
              <View style={styles.half}>
                {profileFormReady ? (
                  <CustomDropdown
                    key={`activity-${activityLevel}`}
                    title="Activity Level"
                    open={activityLevelOpen}
                    setOpen={setActivityLevelOpenSafe}
                    value={activityLevel}
                    setValue={setActivityLevel}
                    items={activityLevelItems}
                    placeholder="Select"
                    zIndex={1000}
                    zIndexInverse={4000}
                  />
                ) : (
                  <View style={styles.dropdownPlaceholder}>
                    <Text style={styles.dropdownPlaceholderLabel}>Activity Level</Text>
                    <View style={[styles.dropdown, styles.dropdownPlaceholderBox]}>
                      <Text style={styles.dropdownPlaceholderText}>Loading...</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.half}>
                <AppInput
                  title="HbA1c (%)"
                  placeholder="5.7"
                  keyboardType="numeric"
                  value={hba1c}
                  onChangeText={setHba1c}
                />
              </View>
              <View style={styles.half} />
            </View>
            <View style={styles.insulinRow}>
              <Text style={styles.insulinText}>Using Insulin?</Text>
              <Switch
                value={usingInsulin}
                onValueChange={setUsingInsulin}
                trackColor={{false: colors.g4, true: colors.p1}}
                thumbColor={colors.white}
              />
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>

      <View style={styles.saveBtn}>
        <AppButton
          title={isSaving ? 'Saving...' : 'Save'}
          onPress={saveProfile}
          disabled={loading || uploadingImage || isSaving}
          loading={isSaving}
        />
      </View>
    </SafeAreaView>
  );
};

export default EditProfile;
