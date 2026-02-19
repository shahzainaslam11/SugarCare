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
import NewHbA1cReport from '../../screens/App/AddHBA1CTest/NewHbA1cReport';
import FAQs from '../../screens/App/SettingsScreen/FAQs';
import PrivacyPolicy from '../../screens/App/SettingsScreen/PrivacyPolicy';
import MedicalSources from '../../screens/App/SettingsScreen/MedicalSources';
import EditProfile from '../../screens/App/SettingsScreen/EditProfile';
import Notification from '../../screens/App/Notification/Notification';
import AIForecast from '../../screens/App/AIForecast/AIForecast';
import PredictSugarAlert from '../../screens/App/PredictSugarAlert';
import PredictInputs from '../../screens/App/PredictSugarAlert/PredictInputs';

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
      <Stack.Screen name="NewHbA1cReport" component={NewHbA1cReport} />
      <Stack.Screen name="FAQs" component={FAQs} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
      <Stack.Screen name="MedicalSources" component={MedicalSources} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="Notification" component={Notification} />
      <Stack.Screen name="AIForecast" component={AIForecast} />
      <Stack.Screen name="PredictSugarAlert" component={PredictSugarAlert} />
      <Stack.Screen name="PredictInputs" component={PredictInputs} />
    </Stack.Navigator>
  );
}

export default AppScreens;
