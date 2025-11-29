import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
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
  auth,
  colors,
  firestore,
  HP,
  showSuccess,
  WP,
} from '../../../../utilities';
import {useNavigation} from '@react-navigation/native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import styles from './styles';
import CheckBox from '@react-native-community/checkbox';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

const EditProfile = () => {
  const navigation = useNavigation();
  const user = auth.currentUser;

  const [loading, setLoading] = useState(true);
  const [avatar, setAvatar] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
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

  // Fetch user profile from Firestore
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (!user) return;

        setEmail(user.email);
        const docRef = firestore.collection('users').doc(user.uid);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
          const data = docSnap.data();
          setName(data.name || '');
          setGenderValue(data.gender || '');
          setAge(data.age?.toString() || '');
          setHeight(data.height?.toString() || '');
          setWeight(data.weight?.toString() || '');
          setDiabetesType(data.diabetesType || '');
          setCholesterol(data.cholesterol?.toString() || '');
          setUsingInsulin(data.usingInsulin || false);
          setAvatar(data.avatar || null); // optional if you store avatar URL
        }
      } catch (error) {
        console.log('Error fetching profile:', error);
        Alert.alert('Error', 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  const pickImage = () => {
    Alert.alert(
      'Change Photo',
      'Choose an option',
      [
        {text: 'Camera', onPress: openCamera},
        {text: 'Library', onPress: openLibrary},
        {text: 'Cancel', style: 'cancel'},
      ],
      {cancelable: true},
    );
  };

  const openCamera = () => {
    launchCamera(
      {mediaType: 'photo', includeBase64: false, quality: 0.8},
      handleImageResponse,
    );
  };

  const openLibrary = () => {
    launchImageLibrary(
      {mediaType: 'photo', includeBase64: false, quality: 0.8},
      handleImageResponse,
    );
  };

  const handleImageResponse = response => {
    if (response.didCancel) return;
    if (response.errorCode) {
      Alert.alert('Error', response.errorMessage);
      return;
    }
    if (response.assets?.[0]?.uri) {
      setAvatar(response.assets[0].uri);
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    try {
      const docRef = firestore.collection('users').doc(user.uid);
      await docRef.set(
        {
          name,
          gender: genderValue,
          age: Number(age),
          height: Number(height),
          weight: Number(weight),
          diabetesType,
          cholesterol: Number(cholesterol),
          usingInsulin,
          avatar: avatar || null,
        },
        {merge: true}, // merge with existing data
      );
      showSuccess('Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      console.log('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.avatarContainer}>
          <Image
            source={avatar ? {uri: avatar} : appImages.messi}
            style={styles.avatar}
            resizeMode="cover"
          />
          <TouchableOpacity style={styles.cameraBtn} onPress={pickImage}>
            <Image
              source={appIcons.camera}
              style={styles.cameraIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <AppInput
          title="Name"
          placeholder="Enter name"
          value={name}
          onChangeText={setName}
        />
        <AppInput
          title="Email"
          placeholder="Your email"
          value={email}
          editable={false}
          containerStyle={styles.readonlyContainer}
        />

        <View style={styles.row}>
          <View style={styles.half}>
            <CustomDropdown
              title="Select Gender"
              open={genderOpen}
              setOpen={setGenderOpen}
              value={genderValue}
              setValue={setGenderValue}
              items={genderItems}
              placeholder="Select Gender"
              errorMessage=""
            />
          </View>
          <View style={styles.half}>
            <AppInput
              title="Age"
              placeholder="Age"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.half}>
            <AppInput
              title="Height (cm)"
              placeholder="Height"
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.half}>
            <AppInput
              title="Weight (kg)"
              placeholder="Weight"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
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
              placeholder="Select Diabetes Type"
              errorMessage=""
            />
          </View>
          <View style={styles.half}>
            <AppInput
              title="Cholesterol (mg/dL)"
              placeholder="mg/dL"
              value={cholesterol}
              onChangeText={setCholesterol}
              keyboardType="numeric"
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
      </ScrollView>

      <AppButton
        title="Save"
        containerStyle={styles.saveBtn}
        onPress={saveProfile}
      />
    </SafeAreaView>
  );
};

export default EditProfile;
