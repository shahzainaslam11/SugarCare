import * as React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import Login from '../../screens/Auth/Login/Login';
import Signup from '../../screens/Auth/SignUp';
import ForgotPassword from '../../screens/Auth/ForgotPassword';

const Stack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="LogIn"
      screenOptions={{headerShown: false, animation: 'slide_from_right'}}>
      <Stack.Screen name="LogIn" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
    </Stack.Navigator>
  );
}

export default AuthStack;
