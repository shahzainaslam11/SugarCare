import * as React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import CustomFast from '../../screens/App/CustomFast';
import NewSugarRecord from '../../screens/App/NewSugarRecord';
import SettingsScreen from '../../screens/App/SettingsScreen/SettingsScreen';
import ScanResult from '../../screens/App/FoodScan/ScanResult';
import WhatToEat from '../../screens/App/WhatToEat';
import CommunityInsight from '../../screens/App/CommunityInsight';
import AddHBA1CTest from '../../screens/App/AddHBA1CTest';
import Recipe from '../../screens/App/WhatToEat/Recipe';
import InsightDetails from '../../screens/App/CommunityInsight/InsightDetails';
import ChatScreen from '../../screens/App/ChatScreen';

const Stack = createNativeStackNavigator();

function AppScreens() {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false, animation: 'slide_from_right'}}>
      <Stack.Screen name="CustomFast" component={CustomFast} />
      <Stack.Screen name="NewSugarRecord" component={NewSugarRecord} />
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
      <Stack.Screen name="ScanResult" component={ScanResult} />
      <Stack.Screen name="WhatToEat" component={WhatToEat} />
      <Stack.Screen name="CommunityInsight" component={CommunityInsight} />
      <Stack.Screen name="AddHBA1CTest" component={AddHBA1CTest} />
      <Stack.Screen name="Recipe" component={Recipe} />
      <Stack.Screen name="InsightDetails" component={InsightDetails} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
    </Stack.Navigator>
  );
}

export default AppScreens;
