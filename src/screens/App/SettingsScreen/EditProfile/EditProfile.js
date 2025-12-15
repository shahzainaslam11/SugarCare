import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
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
import {useNavigation} from '@react-navigation/native';
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

  // FIX: Correct image URL
  const imageUrl = profile?.profile_image ?? null;
  const imageIsPresent = !!imageUrl;

  const [name, setName] = useState('');
  const [genderOpen, setGenderOpen] = useState(false);
  const [genderValue, setGenderValue] = useState('');
  const [genderItems] = useState([
    {label: 'Male', value: 'male'},
    {label: 'Female', value: 'female'},
    {label: 'Other', value: 'other'},
  ]);
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [diabetesType, setDiabetesType] = useState('');
  const [diabetesOpen, setDiabetesOpen] = useState(false);
  const [diabetesItems] = useState([
    {label: 'Type 1', value: 'type1'},
    {label: 'Type 2', value: 'type2'},
    {label: 'Prediabetes', value: 'prediabetes'},
    {label: 'Gestational', value: 'gestational'},
    {label: 'None', value: 'none'},
  ]);
  const [cholesterol, setCholesterol] = useState('');
  const [usingInsulin, setUsingInsulin] = useState(false);

  const getProfileData = useCallback(() => {
    if (accessToken) {
      dispatch(fetchProfile({token: accessToken}))
        .unwrap()
        .then(profileData => {
          setName(profileData.name || '');
          setGenderValue(profileData.gender || '');
          setAge(profileData.age?.toString() || '');
          setHeight(profileData.height_cm?.toString() || '');
          setWeight(profileData.weight_kg?.toString() || '');
          setDiabetesType(profileData.diabetes_type || '');
          setCholesterol(profileData.cholesterol_mg_dl?.toString() || '');
          setUsingInsulin(profileData.using_insulin || false);
        })
        .catch(err => {
          showError(err?.message || 'Failed to fetch profile');
        });
    }
  }, [accessToken, dispatch]);

  useEffect(() => {
    getProfileData();
  }, [getProfileData]);

  const pickImage = () => {
    Alert.alert(
      'Change Photo',
      'Choose an option',
      [
        {text: 'Camera', onPress: openCamera},
        {text: 'Gallery', onPress: openLibrary},
        {text: 'Cancel', style: 'cancel'},
      ],
      {cancelable: true},
    );
  };

  const openCamera = () => {
    launchCamera({mediaType: 'photo', quality: 0.9}, handleImageResponse);
  };

  const openLibrary = () => {
    launchImageLibrary({mediaType: 'photo', quality: 0.9}, handleImageResponse);
  };

  // ⭐ FIX: Correct image orientation before upload
  const handleImageResponse = async response => {
    if (response.didCancel) return;
    if (response.errorCode) {
      Alert.alert('Error', response.errorMessage);
      return;
    }

    if (response.assets?.[0]) {
      const asset = response.assets[0];

      try {
        // FIX: Resize + Correct Orientation
        const fixedImage = await ImageResizer.createResizedImage(
          asset.uri,
          800,
          800,
          'JPEG',
          90,
          0, // <-- this auto-fixes rotation!
          undefined,
          false,
          {mode: 'contain'},
        );

        const file = {
          uri:
            Platform.OS === 'ios'
              ? fixedImage.uri.replace('file://', '')
              : fixedImage.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || `img_${Date.now()}.jpg`,
        };

        dispatch(uploadProfileImage({token: accessToken, file}))
          .unwrap()
          .then(res => {
            showSuccess(res?.message || 'Profile image updated');
            getProfileData();
          })
          .catch(err => {
            showError(err?.message || 'Failed to upload image');
          });
      } catch (err) {
        showError('Image processing failed');
      }
    }
  };

  const removeImage = () => {
    dispatch(deleteProfileImage({token: accessToken}))
      .unwrap()
      .then(() => {
        showSuccess('Profile image removed');
        getProfileData();
      })
      .catch(err => {
        showError(err?.message || 'Failed to delete image');
      });
  };

  const saveProfile = () => {
    const payload = {
      name,
      dob: profile?.dob || '',
      age: Number(age),
      height_cm: Number(height),
      weight_kg: Number(weight),
      gender: genderValue,
      diabetes_type: diabetesType,
      cholesterol_mg_dl: Number(cholesterol),
      using_insulin: usingInsulin,
      city: profile?.city || '',
    };

    dispatch(updateProfile({token: accessToken, payload}))
      .unwrap()
      .then(() => {
        showSuccess('Profile updated successfully');
        navigation.goBack();
      })
      .catch(err => {
        showError(err?.message || 'Failed to update profile');
      });
  };

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color={colors.p1} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Edit Profile" onPress={() => navigation.goBack()} />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.avatarContainer}>
          <Image
            source={imageUrl ? {uri: imageUrl} : appImages.messi}
            style={styles.avatar}
            resizeMode="cover"
          />

          <TouchableOpacity style={styles.cameraBtn} onPress={pickImage}>
            <Image source={appIcons.camera} style={styles.cameraIcon} />
          </TouchableOpacity>

          {imageIsPresent && (
            <TouchableOpacity style={styles.removeBtn} onPress={removeImage}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>

        <AppInput
          title="Name"
          placeholder="Enter name"
          value={name}
          onChangeText={setName}
        />

        <AppInput title="Email" value={profile?.email} editable={false} />

        <View style={styles.row}>
          <View style={styles.half}>
            <CustomDropdown
              title="Select Gender"
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
              placeholder="Age"
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
              placeholder="Height"
              keyboardType="numeric"
              value={height}
              onChangeText={setHeight}
            />
          </View>

          <View style={styles.half}>
            <AppInput
              title="Weight (kg)"
              placeholder="Weight"
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
              title="Cholesterol (mg/dL)"
              placeholder="mg/dL"
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
            thumbColor={usingInsulin ? colors.white : colors.g3}
          />
        </View>
      </KeyboardAwareScrollView>

      <AppButton
        title="Save"
        containerStyle={styles.saveBtn}
        onPress={saveProfile}
      />
    </SafeAreaView>
  );
};

export default EditProfile;
