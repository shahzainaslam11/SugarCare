import * as React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import CustomFast from '../../screens/App/Home/CustomFast';

const Stack = createNativeStackNavigator();

function AppScreens() {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false, animation: 'slide_from_right'}}>
      <Stack.Screen name="CustomFast" component={CustomFast} />
    </Stack.Navigator>
  );
}

export default AppScreens;
