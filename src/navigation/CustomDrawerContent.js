import React, {memo, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import {DrawerContentScrollView} from '@react-navigation/drawer';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';

import {
  colors,
  family,
  HP,
  size,
  WP,
  showSuccess,
  appIcons,
} from '../utilities';
import {useAuth} from '../context/AuthContext';

const DRAWER_WIDTH = WP(80);

const MENU_ITEMS = [
  {id: 'WhatToEat', title: 'What to Eat?', icon: appIcons.eat},
  {id: 'PredictInputs', title: 'Predict Sugar Alert', icon: appIcons.aiRisk},
  {id: 'AIForecast', title: 'AI Risk Forecasting', icon: appIcons.aiRisk},
  {
    id: 'CommunityInsight',
    title: 'Community Insights',
    icon: appIcons.communityInsights,
  },
  {id: 'AddHBA1CTest', title: 'Add HBA1C Test Record', icon: appIcons.User},
  {id: 'SettingsScreen', title: 'App Settings', icon: appIcons.setting},
];

const lowerFirst = str =>
  str ? str.charAt(0).toLowerCase() + str.slice(1) : '';

const DRAWER_TOP_PADDING = Platform.select({ios: HP(3), android: HP(2)});
const DRAWER_BOTTOM_PADDING = Platform.select({ios: HP(2), android: HP(2.5)});

function CustomDrawerContentInner(props) {
  const {navigation} = props;
  const insets = useSafeAreaInsets();
  const {logout} = useAuth();
  const {user, loading: isLoggingOut} = useSelector(s => s.auth);
  const {data: profile} = useSelector(s => s.profile);

  const userName = profile?.name || user?.name || 'User';
  const userEmail =
    lowerFirst(user?.email || profile?.email) || 'user@example.com';
  const userAvatar = user?.profile_image || profile?.profile_image || null;

  const contentPadding = {
    paddingTop: DRAWER_TOP_PADDING + insets.top,
    paddingBottom: DRAWER_BOTTOM_PADDING + insets.bottom,
  };

  const handleMenuItemPress = useCallback(
    screenName => {
      navigation.navigate('App', {screen: screenName});
      navigation.closeDrawer();
    },
    [navigation],
  );

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Logout', style: 'destructive', onPress: performLogout},
      ],
      {cancelable: true},
    );
  }, []);

  const performLogout = useCallback(async () => {
    try {
      await logout();
      showSuccess('Logged out successfully');
    } catch (_) {
      showSuccess('Logged out successfully');
    }
  }, [logout]);

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={[styles.scrollContent, contentPadding]}
      scrollEnabled={true}
      showsVerticalScrollIndicator={false}>
      <View style={styles.drawerInner}>
        <View style={styles.profileHeader}>
          {userAvatar ? (
            <Image source={{uri: userAvatar}} style={styles.profileAvatar} />
          ) : (
            <View style={styles.profileIcon}>
              <Text style={styles.profileIconText}>👤</Text>
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userName}</Text>
            <Text style={styles.profileEmail}>{userEmail}</Text>
          </View>
        </View>

        <View style={styles.menuItemsContainer}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index === MENU_ITEMS.length - 1 && styles.lastMenuItem,
              ]}
              onPress={() => handleMenuItemPress(item.id)}
              activeOpacity={0.7}>
              <Image
                source={item.icon}
                style={styles.menuItemIcon}
                resizeMode="contain"
              />
              <View style={styles.menuItemTextContainer}>
                <Text style={styles.menuItemTitle}>{item.title}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            disabled={isLoggingOut}
            activeOpacity={0.7}>
            {isLoggingOut ? (
              <ActivityIndicator size="small" color={colors.p1} />
            ) : (
              <>
                <Image source={appIcons.logOut} style={styles.logOutIcon} />
                <View style={styles.logoutTextContainer}>
                  <Text style={styles.logoutText}>Logout</Text>
                </View>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSection}>
          <Text style={styles.versionText}>Version: 2.0.1</Text>
        </View>
      </View>
    </DrawerContentScrollView>
  );
}

const CustomDrawerContent = memo(CustomDrawerContentInner);

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  drawerInner: {
    flex: 1,
    backgroundColor: colors.white,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: WP(4),
    paddingVertical: HP(1),
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
  profileAvatar: {
    width: WP(14),
    height: WP(14),
    borderRadius: WP(7),
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
  menuItemsContainer: {
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
    width: WP(6),
    height: WP(6),
    marginRight: WP(4),
    tintColor: '#787575',
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
    paddingVertical: HP(1.5),
    marginTop: HP(3),
    marginHorizontal: WP(2),
    backgroundColor: colors.p1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: `${colors.g1}30`,
  },
  logOutIcon: {
    width: WP(5),
    height: WP(5),
    tintColor: colors.white,
    marginRight: WP(4),
  },
  logoutTextContainer: {
    flex: 1,
  },
  logoutText: {
    fontSize: size.normal,
    fontFamily: family.inter_bold,
    color: colors.white,
  },
  bottomSection: {
    paddingHorizontal: WP(4),
    paddingVertical: HP(1),
    borderTopWidth: 1,
    borderTopColor: `${colors.g1}20`,
    backgroundColor: colors.white,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  versionText: {
    fontSize: size.small,
    fontFamily: family.inter_medium,
    color: colors.p1,
    textAlign: 'center',
  },
});

export default CustomDrawerContent;
