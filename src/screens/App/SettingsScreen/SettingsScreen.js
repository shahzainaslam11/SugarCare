import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import {
  appIcons,
  appImages,
  colors,
  HP,
  showSuccess,
  WP,
} from '../../../utilities';
import {useNavigation} from '@react-navigation/native';
import {AppButton} from '../../../components';
import {useDispatch, useSelector} from 'react-redux';
import {logoutUser} from '../../../redux/slices/authSlice';

const SettingsScreen = () => {
  const dispatch = useDispatch();
  const {user, accessToken, refreshToken, loading} = useSelector(
    state => state.auth,
  );

  const {data: profile} = useSelector(state => state.profile);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const performLogout = async () => {
    setIsLoggingOut(true);

    try {
      // Check if we have tokens
      if (!accessToken || !refreshToken) {
        // If no tokens, just clear local data
        dispatch({type: 'auth/clearAuthData'});
        showSuccess('Logged out successfully');
        navigation.replace('Auth', {screen: 'LogIn'});
        return;
      }

      // Call logout API with tokens
      const result = await dispatch(
        logoutUser({
          access_token: accessToken,
          refresh_token: refreshToken,
        }),
      );

      console.log('Logout result:', JSON.stringify(result));

      if (result.meta.requestStatus === 'fulfilled') {
        showSuccess('Logged out successfully');
        // Navigate to login screen
        navigation.replace('Auth', {screen: 'LogIn'});
      } else {
        // Even if API fails, clear local data
        dispatch({type: 'auth/clearAuthData'});
        showSuccess('Logged out successfully');
        navigation.replace('Auth', {screen: 'LogIn'});
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local data even if there's an error
      dispatch({type: 'auth/clearAuthData'});
      showSuccess('Logged out successfully');
      navigation.replace('Auth', {screen: 'LogIn'});
    } finally {
      setIsLoggingOut(false);
    }
  };
  console.log('user0000>', user?.email);
  const navigation = useNavigation();
  return (
    <ImageBackground
      source={appImages.settingBG}
      style={styles.container}
      resizeMode="cover">
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Section */}
        <View style={styles.profileContainer}>
          <Image source={appImages.messi} style={styles.avatar} />
          <Text style={styles.name}>{profile?.name}</Text>
          <Text style={styles.email}>{profile?.email}</Text>
        </View>

        {/* Settings Content */}
        <View style={styles.contentContainer}>
          {/* Account Section */}
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <SettingsItem
              onPress={() => navigation.navigate('EditProfile')}
              title="Edit Profile"
            />
          </View>

          {/* User Preferences Section */}
          <Text style={styles.sectionTitle}>User Preferences</Text>
          <View style={styles.card}>
            <SettingsItem title="Measurement Units" />
          </View>

          {/* Security Section */}
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.card}>
            <SettingsItem
              title="Change Password"
              onPress={() =>
                navigation.replace('Auth', {
                  screen: 'SetPassword',
                  params: {
                    email: user?.email || '',
                    setShow: true,
                  },
                })
              }
            />
          </View>

          {/* Notifications Section */}
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.card}>
            <SettingsItem title="Manage Notifications" />
          </View>

          {/* Support & Legal Section */}
          <Text style={styles.sectionTitle}>Support & Legal</Text>
          <View style={styles.card}>
            <SettingsItem
              onPress={() => navigation.navigate('FAQs')}
              title="FAQs"
              isLast={false}
            />
            <SettingsItem
              onPress={() => navigation.navigate('PrivacyPolicy')}
              title="Privacy Policy"
              isLast={true}
            />
          </View>

          {/* Sign Out Button */}
          {isLoggingOut ? (
            <ActivityIndicator size="small" color={colors.p1} />
          ) : (
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={performLogout}>
              <Image source={appIcons.logOut} style={styles.logOutIcon} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const SettingsItem = ({title, isLast = true, onPress}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.item, isLast && styles.itemLast]}>
    <Text style={styles.itemTitle}>{title}</Text>
    <Text style={styles.chevron}>›</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: HP(4),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: WP(4),
    paddingTop: HP(2),
  },
  backButton: {
    padding: WP(2),
  },
  backIcon: {
    fontSize: WP(6),
    color: '#fff',
  },
  headerTitle: {
    color: '#fff',
    fontSize: WP(5.5),
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: HP(3),
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: HP(2),
    marginBottom: HP(3),
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#eee',
  },
  name: {
    fontSize: WP(5.5),
    fontWeight: 'bold',
    color: '#000',
    marginTop: HP(1.5),
  },
  email: {
    fontSize: WP(3.8),
    color: '#666',
    marginTop: HP(0.3),
  },
  contentContainer: {
    paddingHorizontal: WP(5),
  },
  sectionTitle: {
    fontSize: WP(4),
    fontWeight: '600',
    color: '#000',
    marginBottom: HP(1.2),
    marginTop: HP(2),
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: WP(3),
    marginBottom: HP(1),
    shadowColor: '#000',
    shadowOffset: {width: 1, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 1,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: HP(2),
    paddingHorizontal: WP(4),
    borderBottomColor: '#f0f0f0',
    borderBottomWidth: 1,
  },
  itemLast: {
    borderBottomWidth: 0,
  },
  itemTitle: {
    fontSize: WP(4),
    fontWeight: '400',
    color: '#333',
  },
  chevron: {
    fontSize: WP(6),
    color: '#ccc',
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: HP(2),
    borderRadius: WP(7),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: HP(3),
    flexDirection: 'row',
    shadowColor: '#FF3B30',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  logOutIcon: {
    width: WP(5),
    height: WP(5),
    tintColor: '#fff',
    marginRight: WP(2),
  },
  signOutText: {
    color: '#fff',
    fontSize: WP(4.5),
    fontWeight: '600',
  },
});

export default SettingsScreen;
