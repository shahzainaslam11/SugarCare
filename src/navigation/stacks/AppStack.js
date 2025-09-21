import * as React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import CustomFast from '../../screens/App/CustomFast';
import NewSugarRecord from '../../screens/App/NewSugarRecord';
import SettingsScreen from '../../screens/App/SettingsScreen/SettingsScreen';

const Stack = createNativeStackNavigator();

function AppScreens() {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false, animation: 'slide_from_right'}}>
      <Stack.Screen name="CustomFast" component={CustomFast} />
      <Stack.Screen name="NewSugarRecord" component={NewSugarRecord} />
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

export default AppScreens;
