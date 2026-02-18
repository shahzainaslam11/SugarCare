import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {useEffect, useRef} from 'react';
import {useSelector} from 'react-redux';
import Splash from '../screens/Auth/Splash';
import AuthStack from './stacks/AuthStack';
import BottomNavigator from './BottomNavigator/BottomNavigator';
import AppScreens from './stacks/AppStack';

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
  const navigationRef = useRef(null);
  const {accessToken, isInitialized} = useSelector(state => state.auth);

  // Global session handling - redirect to login if token is null
  useEffect(() => {
    if (isInitialized && !accessToken && navigationRef.current?.isReady()) {
      const currentRoute = navigationRef.current.getCurrentRoute();
      // Only redirect if not already on Auth or Splash screens
      if (currentRoute?.name !== 'Auth' && currentRoute?.name !== 'Splash') {
        navigationRef.current.reset({
          index: 0,
          routes: [{name: 'Auth'}],
        });
      }
    }
  }, [accessToken, isInitialized]);

  return (
    <NavigationContainer
      ref={navigationRef}
      onStateChange={state => {
        // Check token on every navigation state change
        if (isInitialized && !accessToken) {
          const currentRoute = state?.routes[state.index];
          if (currentRoute?.name !== 'Auth' && currentRoute?.name !== 'Splash') {
            navigationRef.current?.reset({
              index: 0,
              routes: [{name: 'Auth'}],
            });
          }
        }
      }}>
      <AppStack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}>
        <AppStack.Screen name={'Splash'} component={Splash} />
        <AppStack.Screen name={'BottomTabs'} component={BottomNavigator} />

        <AppStack.Screen name={'Auth'} component={AuthStack} />
        <AppStack.Screen name={'AppScreens'} component={AppScreens} />
      </AppStack.Navigator>
    </NavigationContainer>
  );
};
export default MainAppNav;
