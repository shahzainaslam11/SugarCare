import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  appIcons,
  appImages,
  colors,
  family,
  HP,
  showSuccess,
  size,
  WP,
} from '../../../utilities';
import {useNavigation} from '@react-navigation/native';
import {Header} from '../../../components';
import {useSelector} from 'react-redux';
import {useAuth} from '../../../context/AuthContext';
import {DeleteAccountModal, AIConsentModal} from '../../../components';
import {SafeAreaView} from 'react-native-safe-area-context';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const {logout, deleteAccount} = useAuth();
  const {user} = useSelector(state => state.auth);
  const {data: profile} = useSelector(state => state.profile);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAIDisclosure, setShowAIDisclosure] = useState(false);

  const performLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      showSuccess('Logged out successfully');
    } catch (error) {
      showSuccess('Logged out successfully');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View> */}
      <Header title="Settings" onPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Section */}
        <View style={styles.profileContainer}>
          <Image
            source={
              profile?.profile_image
                ? {uri: profile.profile_image}
                : appImages.messi
            }
            style={styles.avatar}
          />
          <Text style={styles.name}>{profile?.name}</Text>
          <Text style={styles.email}>{lowerFirst(profile?.email)}</Text>
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

          {/* Privacy & Data Section - Delete Account (Apple 5.1.1 compliance) */}
          <Text style={styles.sectionTitle}>Privacy & Data</Text>
          <View style={styles.card}>
            <SettingsItem
              onPress={() => setShowAIDisclosure(true)}
              title="View AI Data Disclosure"
              isLast={false}
            />
            <SettingsItem
              onPress={() => setShowDeleteModal(true)}
              title="Delete Account"
              isLast={true}
            />
          </View>

          {/* Support & Legal Section */}
          <Text style={styles.sectionTitle}>Support & Legal</Text>
          <View style={styles.card}>
            <SettingsItem
              onPress={() => navigation.navigate('MedicalSources')}
              title="Sources & Medical Information"
              isLast={false}
            />
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

      <DeleteAccountModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirmDelete={deleteAccount}
      />
      <AIConsentModal
        visible={showAIDisclosure}
        onAccept={() => setShowAIDisclosure(false)}
        onDecline={() => setShowAIDisclosure(false)}
      />
    </SafeAreaView>
  );
};

// Utility to lowercase first letter
const lowerFirst = str =>
  str ? str.charAt(0).toLowerCase() + str.slice(1) : '';

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
    // paddingTop: HP(4),s
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
    borderColor: colors.p1,
    backgroundColor: '#eee',
  },
  name: {
    fontSize: size.large,
    fontFamily: family.inter_black,
    fontWeight: 'bold',
    color: '#000',
    marginTop: HP(1.5),
  },
  email: {
    color: '#666',
    marginTop: HP(0.3),
    fontSize: size.medium,
    fontFamily: family.inter_medium,
  },
  contentContainer: {
    paddingHorizontal: WP(5),
  },
  sectionTitle: {
    fontSize: size.large,
    fontFamily: family.inter_medium,
    fontWeight: '600',
    color: colors.b1,
    marginBottom: HP(1.2),
    marginTop: HP(1),
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: WP(3),
    marginBottom: HP(0.5),
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
    paddingVertical: HP(1),
    paddingHorizontal: WP(4),
    borderBottomColor: '#f0f0f0',
    borderBottomWidth: 1,
  },
  itemLast: {
    borderBottomWidth: 0,
  },
  itemTitle: {
    fontSize: size.large,
    fontFamily: family.inter_medium,
    fontWeight: '400',
    color: '#333',
  },
  chevron: {
    fontSize: WP(6),
    color: colors.b3,
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: HP(1.5),
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
    marginRight: WP(4),
  },
  signOutText: {
    color: '#fff',
    fontSize: size.medium,
    fontFamily: family.inter_medium,
    fontWeight: '600',
  },
});

export default SettingsScreen;
