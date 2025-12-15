import React, {useState, useEffect} from 'react';
import {View, Text, ScrollView, Alert} from 'react-native';
import {
  AppButton,
  ChartComponent,
  HalfCircle,
  SugarRecordCard,
  FastingPlans, // Import FastingPlans component
} from '../../../components';
import {styles} from './styles';
import {appIcons} from '../../../utilities';
import {useNavigation} from '@react-navigation/native';
import dayjs from 'dayjs';

const Fasting = () => {
  const navigation = useNavigation();

  // State for fasting
  const [isFasting, setIsFasting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [fastStart, setFastStart] = useState(dayjs().subtract(10, 'hour'));
  const [fastEnd, setFastEnd] = useState(dayjs().add(6, 'hour'));
  const [remaining, setRemaining] = useState(72);
  const [daysStreak, setDaysStreak] = useState(5);

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

  // Fasting plans data
  const fastingPlans = [
    {
      id: '16:8',
      title: '16:8',
      description: 'Improves Insulin Sensitivity',
      hours: 16,
      bgColor: '#FEF9E5',
      bordercolor: '#E2D3A3',
    },
    {
      id: '18:6',
      title: '18:6',
      description: 'Boosts Metabolism',
      hours: 18,
      bgColor: '#E5E8FF',
      bordercolor: '#A3A9E2',
    },
    {
      id: 'custom',
      title: 'Custom Plan',
      description: 'Personalized Duration',
      hours: 16,
      bgColor: '#FFE5F4',
      bordercolor: '#E2A3C6',
    },
  ];

  useEffect(() => {
    if (isFasting && fastEnd) {
      const interval = setInterval(() => {
        const now = dayjs();
        if (now.isAfter(fastEnd)) {
          setIsFasting(false);
          setSelectedPlan(null);
          return;
        }

        const total = fastEnd.diff(fastStart, 'second');
        const left = fastEnd.diff(now, 'second');
        setRemaining((left / total) * 100);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isFasting, fastStart, fastEnd]);

  const startFasting = plan => {
    setSelectedPlan(plan);
    const startTime = dayjs();
    const endTime = startTime.add(plan.hours, 'hour');
    setFastStart(startTime);
    setFastEnd(endTime);
    setIsFasting(true);

    const total = endTime.diff(startTime, 'second');
    const left = endTime.diff(startTime, 'second');
    setRemaining((left / total) * 100);
  };

  const endFasting = () => {
    setIsFasting(false);
    setSelectedPlan(null);
  };

  const formatTimeRemaining = () => {
    if (!fastEnd) return '00:00 hrs';

    const now = dayjs();
    const diff = fastEnd.diff(now, 'minute');
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')} hrs`;
  };

  const handleEditFasting = () => {
    navigation.navigate('AppScreens', {screen: 'CustomFast'});
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        {!isFasting ? (
          // Show fasting plans when not fasting
          <>
            <Text style={styles.forecastTitle}>Start a Fast</Text>
            <Text style={styles.streakText}>
              {daysStreak}-Day Streak, Keep it up!
            </Text>

            <FastingPlans
              fastingPlans={fastingPlans}
              startFasting={startFasting}
              isFasting={isFasting}
              navigation={navigation}
            />

            <Text style={styles.noFastText}>While No Active Fast</Text>
          </>
        ) : (
          // Show fasting progress when fasting
          <>
            <Text style={styles.forecastTitle}>Current Fasting Progress</Text>

            <HalfCircle
              onPressEdit={handleEditFasting}
              onEndFasting={endFasting}
              startTime={fastStart?.format('hh:mm A')}
              endTime={fastEnd?.format('hh:mm A')}
              remainingTime={formatTimeRemaining()}
              progressPercentage={remaining}
            />
          </>
        )}

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
