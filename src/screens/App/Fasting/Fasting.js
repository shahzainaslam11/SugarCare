import React, {useState, useEffect, useCallback} from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';
import {
  AppButton,
  ChartComponent,
  FastingPlans,
  FastingRecordCard,
  HalfCircle,
  SmallLoader,
} from '../../../components';
import {styles} from './styles';
import {appIcons, showSuccess, showError} from '../../../utilities';
import {
  useNavigation,
  useFocusEffect,
  useRoute,
} from '@react-navigation/native';
import dayjs from 'dayjs';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {
  fetchFastingRecords,
  addFastingRecord,
} from '../../../redux/slices/fastingSlice';

const RANGE_MAP = {
  Today: 'Today',
  '1W': 'OneWeek',
  '1M': 'OneMonth',
  'All Time': 'AllTime',
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

const formatTimeRemaining = fastEnd => {
  if (!fastEnd) return '00:00 hrs';
  const now = dayjs();
  const diff = fastEnd.diff(now, 'minute');
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')} hrs`;
};

const Fasting = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const {user, accessToken} = useSelector(state => state.auth);
  const {recordsByRange, graphData, stats, loading} = useSelector(
    state => state.fasting,
  );

  const [activeRange, setActiveRange] = useState('Today'); // default Today
  const apiRange = RANGE_MAP[activeRange];

  const [isFasting, setIsFasting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [fastStart, setFastStart] = useState(null);
  const [fastEnd, setFastEnd] = useState(null);
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);

  const records = recordsByRange?.[apiRange] || [];
  const chart = graphData?.[apiRange] || {};

  // Fetch fasting records for selected range
  const loadFastingRecords = useCallback(() => {
    if (user?.id && accessToken) {
      dispatch(
        fetchFastingRecords({
          user_id: user.id,
          time_range: apiRange,
          timezone: 'UTC',
          token: accessToken,
        }),
      );
    }
  }, [user, accessToken, apiRange, dispatch]);

  // Refresh whenever screen is focused
  useFocusEffect(
    useCallback(() => {
      loadFastingRecords();

      // Handle updated fast from CustomFast screen
      if (route.params?.updatedFast) {
        const {plan, startTime, endTime} = route.params.updatedFast;
        const start = dayjs(startTime);
        const end = dayjs(endTime);

        setSelectedPlan(plan);
        setFastStart(start);
        setFastEnd(end);
        setIsFasting(true);

        const total = end.diff(start, 'second');
        const left = end.diff(dayjs(), 'second');
        setProgress(((total - left) / total) * 100);

        navigation.setParams({updatedFast: null});
      }
    }, [loadFastingRecords, route.params]),
  );

  // Re-fetch whenever activeRange changes
  useEffect(() => {
    loadFastingRecords();
  }, [activeRange]);

  // Check ongoing fast from today's records
  useEffect(() => {
    if (isFasting) return;
    const todayRecords = recordsByRange?.Today || [];
    const now = dayjs();
    const ongoing = todayRecords.find(record => {
      const start = dayjs(record.start_time, 'HH:mm');
      const end = dayjs(record.end_time, 'HH:mm');
      return now.isAfter(start) && now.isBefore(end);
    });

    if (ongoing) {
      setSelectedPlan({title: ongoing.notes, hours: ongoing.duration_hours});
      setFastStart(dayjs(ongoing.start_time, 'HH:mm'));
      setFastEnd(dayjs(ongoing.end_time, 'HH:mm'));
      setIsFasting(true);

      const total = dayjs(ongoing.end_time, 'HH:mm').diff(
        dayjs(ongoing.start_time, 'HH:mm'),
        'second',
      );
      const left = dayjs(ongoing.end_time, 'HH:mm').diff(now, 'second');
      setProgress(((total - left) / total) * 100 || 0);
    }
  }, [recordsByRange, isFasting]);

  // Update progress every second
  useEffect(() => {
    if (!isFasting || !fastEnd || !fastStart) return;
    const interval = setInterval(() => {
      const now = dayjs();
      if (now.isAfter(fastEnd)) {
        setIsFasting(false);
        setSelectedPlan(null);
        setProgress(100);
        clearInterval(interval);
        return;
      }
      const total = fastEnd.diff(fastStart, 'second');
      const left = fastEnd.diff(now, 'second');
      setProgress(((total - left) / total) * 100);
    }, 1000);
    return () => clearInterval(interval);
  }, [isFasting, fastStart, fastEnd]);

  const startFasting = plan => {
    if (!user?.id || !accessToken) return showError('User not authenticated!');
    const start = dayjs();
    const end = start.add(plan.hours, 'hour');
    const payload = {
      user_id: user.id,
      date: start.format('YYYY-MM-DD'),
      start_time: start.format('HH:mm'),
      end_time: end.format('HH:mm'),
      duration_hours: `${plan.hours}:00`,
      notes: `Following ${plan.title} plan`,
      token: accessToken,
    };

    setSaving(true);
    dispatch(addFastingRecord(payload))
      .unwrap()
      .then(res => {
        showSuccess(res?.message || 'Fasting record added successfully!');
        setSelectedPlan(plan);
        setFastStart(start);
        setFastEnd(end);
        setIsFasting(true);
        setProgress(0);
        loadFastingRecords();
      })
      .catch(err => {
        showError(
          err?.message ||
            err?.error ||
            'Failed to start fast, please try again!',
        );
      })
      .finally(() => setSaving(false));
  };

  const endFasting = () => {
    setIsFasting(false);
    setSelectedPlan(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      {isFasting ? (
        <>
          <Text style={styles.forecastTitle}>Current Fasting Progress</Text>
          <HalfCircle
            onPressEdit={() =>
              navigation.navigate('AppScreens', {
                screen: 'CustomFast',
                params: {
                  ongoingFast: {
                    plan: selectedPlan,
                    startTime: fastStart?.toISOString(),
                    endTime: fastEnd?.toISOString(),
                    durationHours: selectedPlan?.hours || 0,
                    notes: selectedPlan?.title,
                  },
                },
              })
            }
            onEndFasting={endFasting}
            startTime={fastStart?.format('hh:mm A')}
            endTime={fastEnd?.format('hh:mm A')}
            remainingTime={formatTimeRemaining(fastEnd)}
            progressPercentage={progress}
          />
        </>
      ) : (
        <>
          <Text style={styles.forecastTitle}>Start a Fast</Text>
          <Text style={styles.streakText}>
            {stats?.totalFastingDays || 0}-Day Streak, Keep it up!
          </Text>
          <FastingPlans
            fastingPlans={fastingPlans}
            startFasting={startFasting}
            navigation={navigation}
            saving={saving}
          />
        </>
      )}

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.forecastTitle}>Fasting progress at a glance</Text>

        {loading ? (
          <SmallLoader overlay />
        ) : (
          <ChartComponent
            activeRange={activeRange}
            onChangeRange={setActiveRange}
            chart={chart}
          />
        )}

        <View style={styles.recordsContainer}>
          <Text style={styles.sectionTitle}>Recent Records</Text>
          {loading ? (
            <SmallLoader overlay />
          ) : records.length ? (
            records.map(item => (
              <FastingRecordCard key={item.id} record={item} />
            ))
          ) : (
            <Text style={styles.emptyText}>No records found</Text>
          )}
        </View>
      </ScrollView>

      {!isFasting && (
        <View style={styles.buttonContainer}>
          <AppButton
            title="Add New Record"
            onPress={() =>
              navigation.navigate('AppScreens', {screen: 'CustomFast'})
            }
            style={styles.addButton}
            icon={appIcons.plus}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default Fasting;
