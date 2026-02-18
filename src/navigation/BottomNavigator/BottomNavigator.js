import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import LinearGradient from 'react-native-linear-gradient';

import {appIcons, colors, HP, size, WP} from '../../utilities';
import {Fonts} from '../../assets/fonts';

// Screens
import Home from '../../screens/App/Home/Home';
import TrackSugar from '../../screens/App/TrackSugar/TrackSugar';
import Fasting from '../../screens/App/Fasting/Fasting';
import Reports from '../../screens/App/Reports/Reports';
import FoodScan from '../../screens/App/FoodScan';

const Tab = createBottomTabNavigator();

const CustomTabBar = ({state, descriptors, navigation}) => {
  return (
    <LinearGradient
      colors={[colors.white, colors.white]}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const {options} = descriptors[route.key];
          const isFocused = state.index === index;
          const routeName = route.name;
          const {tabBarIcon, activeTabBarIcon} = options;
          const screenTitle = options.title;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(routeName);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              style={[
                styles.tabBarButton,
                isFocused ? styles.activeTabBarButton : {},
              ]}
              onPress={onPress}>
              <Image
                source={isFocused ? activeTabBarIcon : tabBarIcon}
                style={styles.tabBarIcon}
                resizeMode="contain"
              />
              <Text
                style={[
                  styles.title,
                  isFocused ? styles.activeTitle : styles.inactiveTitle,
                ]}>
                {screenTitle}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </LinearGradient>
  );
};

const BottomNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        style: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
        },
      }}
      tabBar={props => <CustomTabBar {...props} />}>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          title: 'Home',
          tabBarIcon: appIcons.inActiveHome,
          activeTabBarIcon: appIcons.activeHome,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="TrackSugar"
        component={TrackSugar}
        options={{
          title: 'Sugar',
          tabBarIcon: appIcons.inActiveSugar,
          activeTabBarIcon: appIcons.activeSugar,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Fasting"
        component={Fasting}
        options={{
          title: 'Fasting',
          tabBarIcon: appIcons.inActiveFasting,
          activeTabBarIcon: appIcons.activeFasting,
          headerShown: false,
        }}
      />

      <Tab.Screen
        name="Reports"
        component={Reports}
        options={{
          title: 'Reports',
          tabBarIcon: appIcons.inActiveReport,
          activeTabBarIcon: appIcons.activeFasting,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Scan"
        component={FoodScan}
        options={{
          title: 'Scan',
          tabBarIcon: appIcons.inActiveScan,
          activeTabBarIcon: appIcons.activeScan,
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

const tabBarHeight = HP(7.5);

const styles = StyleSheet.create({
  tabBarContainer: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 0.5,
    borderColor: '#CCCCCC',
    height: tabBarHeight,
    alignItems: 'center',
    justifyContent: 'center',
    width: '94%',
    alignSelf: 'center',
    marginBottom: HP(3), // Remove marginBottom so tab bar sits flush
  },
  tabBarButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 1,
  },
  activeTabBarButton: {
    backgroundColor: 'transparent',
  },
  tabBarIcon: {
    width: WP(4),
    height: HP(4),
    marginBottom: HP(0.1),
  },
  title: {
    fontSize: size.small,
    fontFamily: Fonts.medium,
  },
  activeTitle: {
    color: colors.p1,
    fontFamily: Fonts.interMedium,
    fontSize: size.medium,
  },
  inactiveTitle: {
    color: colors.gray,
    fontFamily: Fonts.interRegular,
    fontSize: size.small,
  },
});

export default BottomNavigator;
