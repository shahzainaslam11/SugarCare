import React, {useRef, useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  StatusBar,
  Animated,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {
  colors,
  family,
  HP,
  size,
  WP,
  showSuccess,
  showError,
} from '../../utilities';
import {logoutUser} from '../../redux/slices/authSlice';

const {width} = Dimensions.get('window');
const DRAWER_WIDTH = WP(80);

const MenuModal = ({updatedName, visible, onClose, navigation}) => {
  const dispatch = useDispatch();
  const {user, accessToken, refreshToken, loading} = useSelector(
    state => state.auth,
  );
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const isAnimating = useRef(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (visible) {
      openModal();
    } else {
      closeModal();
    }
  }, [visible]);

  const openModal = () => {
    if (isAnimating.current) return;

    isAnimating.current = true;
    slideAnim.setValue(-DRAWER_WIDTH);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      isAnimating.current = false;
    });
  };

  const closeModal = () => {
    if (isAnimating.current) return;

    isAnimating.current = true;
    Animated.timing(slideAnim, {
      toValue: -DRAWER_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      isAnimating.current = false;
    });
  };

  const menuItems = [
    {
      id: 'whatToEat',
      title: 'What to Eat?',
      icon: '🍽️',
    },
    {
      id: 'community',
      title: 'Community Insights',
      icon: '👥',
    },
    {
      id: 'hba1c',
      title: 'Add HBA1C Test Record',
      icon: '📊',
    },
    {
      id: 'AIForecast',
      title: 'AI Risk Foecasting',
      icon: '📊',
    },
    {
      id: 'PredictSugarAlert',
      title: 'Predict Sugar Alert',
      icon: '📊',
    },
    {
      id: 'settings',
      title: 'App Settings',
      icon: '⚙️',
    },
  ];

  const handleMenuItemPress = itemId => {
    // Close modal immediately
    slideAnim.setValue(-DRAWER_WIDTH);
    onClose();

    // Navigate after a small delay
    setTimeout(() => {
      switch (itemId) {
        case 'whatToEat':
          navigation.navigate('AppScreens', {screen: 'WhatToEat'});
          break;
        case 'community':
          navigation.navigate('AppScreens', {screen: 'CommunityInsight'});
          break;
        case 'hba1c':
          navigation.navigate('AppScreens', {screen: 'AddHBA1CTest'});
          break;
        case 'settings':
          navigation.navigate('AppScreens', {screen: 'SettingsScreen'});
          break;
        case 'AIForecast':
          navigation.navigate('AppScreens', {screen: 'AIForecast'});
          break;
        case 'PredictSugarAlert':
          navigation.navigate('AppScreens', {screen: 'PredictSugarAlert'});
          break;
        default:
          break;
      }
    }, 50);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: performLogout,
        },
      ],
      {cancelable: true},
    );
  };

  const performLogout = async () => {
    setIsLoggingOut(true);

    try {
      // Check if we have tokens
      if (!accessToken || !refreshToken) {
        // If no tokens, just clear local data
        dispatch({type: 'auth/clearAuthData'});
        showSuccess('Logged out successfully');
        navigation.replace('Auth', {screen: 'LogIn'});
        onClose();
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
      onClose();
    }
  };

  const handleOverlayPress = () => {
    closeModal();
    setTimeout(() => onClose(), 250);
  };

  // Get user info from Redux store
  const userName = updatedName || 'User';
  const userEmail = user?.email || 'user@example.com';

  return (
    <SafeAreaView>
      <Modal
        visible={visible}
        animationType="none"
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={handleOverlayPress}>
        <View style={styles.container}>
          <StatusBar
            barStyle="dark-content"
            backgroundColor="transparent"
            translucent={true}
          />

          {/* Overlay */}
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={handleOverlayPress}
          />

          {/* Drawer Content */}
          <Animated.View
            style={[
              styles.drawerContainer,
              {
                transform: [{translateX: slideAnim}],
              },
            ]}>
            <SafeAreaView
              style={styles.safeArea}
              edges={['right', 'top', 'bottom']}>
              {/* Profile Header */}
              <View style={styles.profileHeader}>
                <View style={styles.profileIcon}>
                  <Text style={styles.profileIconText}>👤</Text>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{userName}</Text>
                  <Text style={styles.profileEmail}>{userEmail}</Text>
                </View>
                <TouchableOpacity
                  onPress={handleOverlayPress}
                  style={styles.closeButton}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                  <Text style={styles.closeIcon}>×</Text>
                </TouchableOpacity>
              </View>

              {/* Menu Items */}
              <View style={styles.menuItemsContainer}>
                {menuItems.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.menuItem,
                      index === menuItems.length - 1 && styles.lastMenuItem,
                    ]}
                    onPress={() => handleMenuItemPress(item.id)}
                    activeOpacity={0.7}>
                    <Text style={styles.menuItemIcon}>{item.icon}</Text>
                    <View style={styles.menuItemTextContainer}>
                      <Text style={styles.menuItemTitle}>{item.title}</Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                  </TouchableOpacity>
                ))}

                {/* Logout Button */}
                <TouchableOpacity
                  style={styles.logoutButton}
                  onPress={handleLogout}
                  disabled={isLoggingOut}
                  activeOpacity={0.7}>
                  {isLoggingOut ? (
                    <ActivityIndicator size="small" color={colors.p1} />
                  ) : (
                    <>
                      <Text style={styles.logoutIcon}>🚪</Text>
                      <View style={styles.logoutTextContainer}>
                        <Text style={styles.logoutText}>Logout</Text>
                      </View>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Version Info */}
              <View style={styles.bottomSection}>
                <Text style={styles.versionText}>Version: 0.0.0</Text>
              </View>
            </SafeAreaView>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawerContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  safeArea: {
    flex: 1,
    marginTop: HP(4),
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: WP(4),
    paddingVertical: HP(2.5),
    borderBottomWidth: 1,
    borderBottomColor: colors.g1,
    backgroundColor: colors.white,
  },
  profileIcon: {
    width: WP(14),
    height: WP(14),
    borderRadius: WP(7),
    backgroundColor: colors.g1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: WP(3),
  },
  profileIconText: {
    fontSize: size.xlarge,
    fontFamily: family.inter_regular,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: size.medium,
    fontFamily: family.inter_bold,
    color: colors.p1,
    marginBottom: HP(0.3),
  },
  profileEmail: {
    fontSize: size.small,
    fontFamily: family.inter_regular,
    color: colors.g1,
  },
  closeButton: {
    width: WP(10),
    height: WP(10),
    borderRadius: WP(5),
    backgroundColor: colors.p3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: size.large,
    color: colors.white,
    fontFamily: family.inter_medium,
  },
  menuItemsContainer: {
    flex: 1,
    paddingTop: HP(1),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: WP(4),
    paddingVertical: HP(2),
    borderBottomWidth: 1,
    borderBottomColor: `${colors.g1}20`,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemIcon: {
    fontSize: size.h4,
    marginRight: WP(4),
    width: WP(6),
    textAlign: 'center',
  },
  menuItemTextContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: size.normal,
    fontFamily: family.inter_medium,
    color: colors.black,
  },
  chevron: {
    fontSize: size.h3,
    color: colors.b1,
    fontFamily: family.inter_medium,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: WP(4),
    paddingVertical: HP(2),
    marginTop: HP(3),
    marginHorizontal: WP(4),
    backgroundColor: colors.error,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: `${colors.error}30`,
  },
  logoutIcon: {
    fontSize: size.h4,
    marginRight: WP(4),
    width: WP(6),
    textAlign: 'center',
  },
  logoutTextContainer: {
    flex: 1,
  },
  logoutText: {
    fontSize: size.normal,
    fontFamily: family.inter_bold,
    color: colors.b1,
  },
  bottomSection: {
    paddingHorizontal: WP(4),
    paddingVertical: HP(2),
    borderTopWidth: 1,
    borderTopColor: `${colors.g1}20`,
    backgroundColor: colors.white,
  },
  versionText: {
    fontSize: size.small,
    fontFamily: family.inter_medium,
    color: colors.p1,
    textAlign: 'center',
  },
});

export {MenuModal};
