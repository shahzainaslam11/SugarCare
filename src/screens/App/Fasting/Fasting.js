import React from 'react';
import {View, Text, ScrollView, Alert} from 'react-native';
import {
  AppButton,
  ChartComponent,
  HalfCircle,
  SugarRecordCard,
} from '../../../components';
import {styles} from './styles';
import {appIcons} from '../../../utilities';
import {useNavigation} from '@react-navigation/native';

const Fasting = () => {
  const navigation = useNavigation();
  const records = [
    {
      value: 124.4,
      type: 'Fasting',
      time: '04:48 AM | 17 Aug 2025',
      notes: 'During Fasting in Morning...',
    },
    {
      value: 200.5,
      type: 'Meal',
      time: '01:15 PM | 17 Aug 2025',
      notes: 'After lunch meal',
    },
    {
      value: 40.3,
      type: 'Low',
      time: '06:30 PM | 17 Aug 2025',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.forecastTitle}>Current Fasting Progress</Text>

        <HalfCircle
          onPressEdit={() =>
            navigation.navigate('AppScreens', {screen: 'CustomFast'})
          }
        />
        <Text style={styles.forecastTitle}>Fasting progress at a glance</Text>

        <ChartComponent />
        <View style={styles.recordsContainer}>
          <Text style={styles.sectionTitle}>Recent Records</Text>

          {records.map((record, index) => (
            <SugarRecordCard key={index} record={record} />
          ))}

          <SugarRecordCard />
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <AppButton
          title="Add New Record"
          onPress={() =>
            navigation.navigate('AppScreens', {screen: 'NewSugarRecord'})
          }
          style={styles.addButton}
          icon={appIcons.plus}
        />
      </View>
    </View>
  );
};

export default Fasting;
