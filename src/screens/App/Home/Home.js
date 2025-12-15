import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import {FloatingAction} from 'react-native-floating-action';
import dayjs from 'dayjs';
import {
  ChartComponent,
  FastingPlans,
  HalfCircle,
  MenuModal,
} from '../../../components'; // Updated imports
import {appIcons} from '../../../utilities';
import styles from './styles';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';

export default function Home() {
  const navigation = useNavigation();

  const [isFasting, setIsFasting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [fastStart, setFastStart] = useState(dayjs().subtract(10, 'hour'));
  const [fastEnd, setFastEnd] = useState(dayjs().add(6, 'hour'));
  const [remaining, setRemaining] = useState(72);
  const [daysStreak, setDaysStreak] = useState(5);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const toggleMenu = () => {
    setIsMenuVisible(!isMenuVisible);
  };

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

  const actions = [
    {
      text: 'Chat with SugarBuddy',
      name: 'Chat',
      position: 2,
      color: '#4252FF',
      icon: appIcons.aiIcon,
    },
    {
      text: 'Add Sugar Record',
      name: 'AddSugar',
      position: 1,
      color: '#4252FF',
      icon: appIcons.activeSugar,
    },
  ];

  const handleOptionSelect = name => {
    if (name === 'Chat') {
      navigation.navigate('AppScreens', {screen: 'ChatScreen'});
    } else if (name === 'AddSugar') {
      navigation.navigate('AppScreens', {screen: 'NewSugarRecord'});
    }
  };

  const handleAddSugarRecord = () => {
    navigation.navigate('AppScreens', {screen: 'NewSugarRecord'});
  };

  const handleEditFasting = () => {
    navigation.navigate('AppScreens', {screen: 'FastingSettings'});
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={toggleMenu} style={styles.iconButton}>
            <Text style={styles.icon}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Hi Jenna!</Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('AppScreens', {screen: 'Notification'})
          }
          style={styles.iconButton}>
          <Text style={styles.icon}>🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {/* Use ChartComponent instead of BloodSugarChart */}
        <ChartComponent />

        <Text style={styles.subtitle}>Fasting Tracker</Text>
        <Text style={styles.streak}>{daysStreak}-Day Streak, Keep it up!</Text>

        {!isFasting ? (
          <>
            {/* Use your existing FastingPlans component */}
            <FastingPlans
              fastingPlans={fastingPlans}
              startFasting={startFasting}
              isFasting={isFasting}
              navigation={navigation}
            />
            <Text style={styles.noFastText}>While No Active Fast</Text>
          </>
        ) : (
          /* Use HalfCircle component when fasting is active */
          <HalfCircle
            onPressEdit={handleEditFasting}
            onEndFasting={endFasting}
            startTime={fastStart?.format('hh:mm A')}
            endTime={fastEnd?.format('hh:mm A')}
            remainingTime={formatTimeRemaining()}
            progressPercentage={remaining}
          />
        )}

        <TouchableOpacity style={styles.button} onPress={handleAddSugarRecord}>
          <Text style={styles.buttonText}> + Add Sugar Record</Text>
        </TouchableOpacity>
      </ScrollView>

      <FloatingAction
        actions={actions}
        onPressItem={handleOptionSelect}
        color="#4252FF"
        floatingIcon={<Text style={styles.plusIcon}>+</Text>}
      />
      <MenuModal
        visible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        navigation={navigation}
      />
    </SafeAreaView>
  );
}
