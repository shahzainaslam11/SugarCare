import React, {useRef, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, family, HP, size, WP} from '../../utilities';

const {width} = Dimensions.get('window');
const DRAWER_WIDTH = WP(80);

const MenuModal = ({visible, onClose, navigation}) => {
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const isAnimating = useRef(false);

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
        default:
          break;
      }
    }, 50);
  };

  const handleOverlayPress = () => {
    closeModal();
    setTimeout(() => onClose(), 250);
  };

  return (
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
                <Text style={styles.profileName}>Jenna</Text>
                <Text style={styles.profileEmail}>jenna341@gmail.com</Text>
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
            </View>

            {/* Version Info */}
            <View style={styles.bottomSection}>
              <Text style={styles.versionText}>Version: 0.0.0</Text>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
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
