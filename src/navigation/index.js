import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import Splash from '../screens/Auth/Splash';
import AuthStack from './stacks/AuthStack';

const config = {
  screens: {
    Auth: {
      screens: {
        Register: 'register',
      },
    },
  },
};
const AppStack = createNativeStackNavigator();

const MainAppNav = () => {
  return (
    <NavigationContainer>
      <AppStack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}>
        <AppStack.Screen name={'Splash'} component={Splash} />

        <AppStack.Screen name={'Auth'} component={AuthStack} />
      </AppStack.Navigator>
    </NavigationContainer>
  );
};
export default MainAppNav;
