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
  AppButton,
  ChartComponent,
  FastingPlans,
  HalfCircle,
  MenuModal,
} from '../../../components'; // Updated imports
import {appIcons} from '../../../utilities';
import styles from './styles';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {
  fetchFastingRecords,
  fetchSugarRecords,
} from '../../../redux/slices/homeSlice';
import {fetchProfile} from '../../../redux/slices/profileSlice';

export default function Home() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {accessToken, user} = useSelector(state => state.auth);
  const {sugarRecords, fastingRecords, loading} = useSelector(
    state => state.home,
  );
  // console.log('sugarRecords--->', JSON.stringify(sugarRecords));
  // console.log('fastingRecords--->', JSON.stringify(fastingRecords));

  console.log('Token:', accessToken);
  // console.log('User:', JSON.stringify(user.id));

  useEffect(() => {
    if (user?.id && accessToken) {
      dispatch(fetchSugarRecords({user_id: user?.id, token: accessToken}));
      dispatch(fetchFastingRecords({user_id: user?.id, token: accessToken}));
      dispatch(fetchProfile({token: accessToken}));
    }
  }, [dispatch, user, accessToken]);

  const [isFasting, setIsFasting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [fastStart, setFastStart] = useState(dayjs().subtract(10, 'hour'));
  const [fastEnd, setFastEnd] = useState(dayjs().add(6, 'hour'));
  const [remaining, setRemaining] = useState(72);
  const [daysStreak, setDaysStreak] = useState(5);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const {data: profile} = useSelector(state => state.profile);
  console.log('profile---->', JSON.stringify(profile?.id));

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
    navigation.navigate('AppScreens', {screen: 'CustomFast'});
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={toggleMenu} style={styles.iconButton}>
            <Text style={styles.icon}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{profile?.name}</Text>
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
        <ChartComponent loading={loading} sugarData={sugarRecords} />

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
      </ScrollView>

      <MenuModal
        updatedName={profile?.name}
        visible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        navigation={navigation}
      />
      <View style={styles.buttonContainer}>
        <AppButton
          title={'Add Sugar Record'}
          onPress={handleAddSugarRecord}
          icon={appIcons.plus}
        />
      </View>
      <FloatingAction
        actions={actions}
        onPressItem={handleOptionSelect}
        color="#4252FF"
        floatingIcon={<Text style={styles.plusIcon}>+</Text>}
      />
    </SafeAreaView>
  );
}
