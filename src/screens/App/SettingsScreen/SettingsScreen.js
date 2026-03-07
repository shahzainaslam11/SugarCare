import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import {
  appIcons,
  appImages,
  colors,
  family,
  HP,
  showSuccess,
} from '../../../utilities';
import {useNavigation} from '@react-navigation/native';
import {Header} from '../../../components';
import {useSelector} from 'react-redux';
import {useAuth} from '../../../context/AuthContext';
import {DeleteAccountModal, AIConsentModal} from '../../../components';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import styles from './styles';

const lowerFirst = str =>
  str ? str.charAt(0).toLowerCase() + str.slice(1) : '';

const SettingsItem = ({
  title,
  isLast = false,
  onPress,
  icon,
  isDanger = false,
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.item, isLast && styles.itemLast]}
    activeOpacity={0.7}>
    <View style={[styles.itemIconWrap, isDanger && styles.itemIconWrapDanger]}>
      <Ionicons
        name={icon}
        size={16}
        color={isDanger ? '#FF3B30' : colors.p1}
      />
    </View>
    <Text style={[styles.itemTitle, isDanger && styles.itemTitleDanger]}>
      {title}
    </Text>
    <Ionicons
      name="chevron-forward"
      size={16}
      color={colors.g9}
      style={styles.chevron}
    />
  </TouchableOpacity>
);

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
    <SafeAreaView style={styles.container} edges={['left', 'right', 'top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.headerWrapper}>
        <Header title="Settings" onPress={() => navigation.goBack()} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <TouchableOpacity
          style={styles.profileCard}
          onPress={() => navigation.navigate('EditProfile')}
          activeOpacity={0.9}>
          <LinearGradient
            colors={[colors.p1, colors.p9]}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            style={styles.profileAccent}
          />
          <Image
            source={
              profile?.profile_image
                ? {uri: profile.profile_image}
                : appImages.messi
            }
            style={styles.avatar}
          />
          <Text style={styles.name}>{profile?.name || 'User'}</Text>
          <Text style={styles.email}>
            {lowerFirst(profile?.email) || 'user@example.com'}
          </Text>
          <View style={styles.editHint}>
            <Ionicons name="pencil-outline" size={14} color={colors.g9} />
            <Text style={styles.editHintText}>Tap to edit profile</Text>
          </View>
        </TouchableOpacity>

        {/* Settings Content */}
        <View style={styles.contentContainer}>
          <Text style={[styles.sectionTitle, styles.sectionTitleFirst]}>
            Account
          </Text>
          <View style={styles.card}>
            <LinearGradient
              colors={[colors.p1, colors.p9]}
              start={{x: 0, y: 0}}
              end={{x: 0, y: 1}}
              style={styles.cardAccent}
            />
            <SettingsItem
              onPress={() => navigation.navigate('EditProfile')}
              title="Edit Profile"
              icon="person-outline"
              isLast={true}
            />
          </View>

          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.card}>
            <LinearGradient
              colors={[colors.p1, colors.p9]}
              start={{x: 0, y: 0}}
              end={{x: 0, y: 1}}
              style={styles.cardAccent}
            />
            <SettingsItem
              title="Change Password"
              onPress={() =>
                navigation.navigate('Auth', {
                  screen: 'SetPassword',
                  params: {
                    email: user?.email || '',
                    setShow: true,
                  },
                })
              }
              icon="lock-closed-outline"
              isLast={true}
            />
          </View>

          <Text style={styles.sectionTitle}>Privacy & Data</Text>
          <View style={styles.card}>
            <LinearGradient
              colors={['#F59E0B', '#FBBF24']}
              start={{x: 0, y: 0}}
              end={{x: 0, y: 1}}
              style={styles.cardAccent}
            />
            <SettingsItem
              onPress={() => setShowAIDisclosure(true)}
              title="View AI Data Disclosure"
              icon="sparkles-outline"
              isLast={false}
            />
            <SettingsItem
              onPress={() => setShowDeleteModal(true)}
              title="Delete Account"
              icon="trash-outline"
              isLast={true}
              isDanger
            />
          </View>

          <Text style={styles.sectionTitle}>Support & Legal</Text>
          <View style={styles.card}>
            <LinearGradient
              colors={['#10B981', '#34D399']}
              start={{x: 0, y: 0}}
              end={{x: 0, y: 1}}
              style={styles.cardAccent}
            />
            <SettingsItem
              onPress={() => navigation.navigate('MedicalSources')}
              title="Sources & Medical Information"
              icon="medical-outline"
              isLast={false}
            />
            <SettingsItem
              onPress={() => navigation.navigate('FAQs')}
              title="FAQs"
              icon="help-circle-outline"
              isLast={false}
            />
            <SettingsItem
              onPress={() => navigation.navigate('PrivacyPolicy')}
              title="Privacy Policy"
              icon="document-text-outline"
              isLast={true}
            />
          </View>

          {isLoggingOut ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator size="small" color={colors.p1} />
            </View>
          ) : (
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={performLogout}
              activeOpacity={0.85}>
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

export default SettingsScreen;
