import React from 'react';
import {Platform} from 'react-native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {colors, WP} from '../utilities';
import CustomDrawerContent from './CustomDrawerContent';
import AppWithTabsStack from './stacks/AppWithTabsStack';

const Drawer = createDrawerNavigator();
const DRAWER_WIDTH = WP(80);
const SWIPE_EDGE_WIDTH = Platform.select({ios: 50, android: 30});

function MainDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        overlayColor: 'rgba(0,0,0,0.5)',
        drawerStyle: {
          width: DRAWER_WIDTH,
          backgroundColor: colors.white,
          shadowColor: '#000',
          shadowOffset: {width: 2, height: 0},
          shadowOpacity: 0.25,
          shadowRadius: 10,
          elevation: 10,
        },
        swipeEnabled: true,
        swipeEdgeWidth: SWIPE_EDGE_WIDTH,
        lazy: true,
      }}
      drawerContent={props => <CustomDrawerContent {...props} />}
      initialRouteName="App">
      <Drawer.Screen name="App" component={AppWithTabsStack} />
    </Drawer.Navigator>
  );
}

export default MainDrawer;
