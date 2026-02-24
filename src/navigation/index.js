import {NavigationContainer, CommonActions} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {useEffect, useRef} from 'react';
import {useSelector} from 'react-redux';
import Splash from '../screens/Auth/Splash';
import AuthStack from './stacks/AuthStack';
import MainDrawer from './MainDrawer';
import {setOnSessionExpired, clearSessionExpiredCallback} from '../services/sessionManager';

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

  useEffect(() => {
    const resetToAuth = () => {
      if (!navigationRef.current?.isReady()) return;
      const state = navigationRef.current.getRootState();
      const currentRoute = state?.routes[state?.index];
      if (currentRoute?.name === 'Auth') return;
      navigationRef.current.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{name: 'Auth'}],
        }),
      );
    };
    setOnSessionExpired(resetToAuth);
    return () => clearSessionExpiredCallback();
  }, []);

  useEffect(() => {
    if (isInitialized && !accessToken && navigationRef.current?.isReady()) {
      const state = navigationRef.current.getRootState();
      const currentRoute = state?.routes[state?.index];
      if (currentRoute?.name === 'Auth' || currentRoute?.name === 'Splash') return;
      navigationRef.current.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{name: 'Auth'}],
        }),
      );
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
        <AppStack.Screen name="Splash" component={Splash} />
        <AppStack.Screen name="MainDrawer" component={MainDrawer} />
        <AppStack.Screen name="Auth" component={AuthStack} />
      </AppStack.Navigator>
    </NavigationContainer>
  );
};
export default MainAppNav;
