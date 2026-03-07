import React, {useState, useEffect, useCallback, useRef} from 'react';
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
  const userEndedFastRef = useRef(false);

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

  // Refresh records when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadFastingRecords();

      // Handle updated fast from CustomFast screen
      if (route.params?.updatedFast) {
        userEndedFastRef.current = false;
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
    }, [loadFastingRecords, route.params, navigation]),
  );

  // Re-fetch whenever activeRange changes
  useEffect(() => {
    loadFastingRecords();
  }, [activeRange]);

  // Check ongoing fast from API records (skip if user explicitly ended)
  useEffect(() => {
    if (isFasting) return;
    if (userEndedFastRef.current) return;
    const todayRecords = recordsByRange?.Today || [];
    const now = dayjs();
    const todayStr = now.format('YYYY-MM-DD');
    const ongoing = todayRecords.find(record => {
      const recordDate = record.date || todayStr;
      const start = dayjs(`${recordDate} ${record.start_time}`, 'YYYY-MM-DD HH:mm');
      let end = dayjs(`${recordDate} ${record.end_time}`, 'YYYY-MM-DD HH:mm');
      if (end.isBefore(start)) end = end.add(1, 'day');
      return now.isAfter(start) && now.isBefore(end);
    });

    if (ongoing) {
      const hrs = typeof ongoing.duration_hours === 'number'
        ? ongoing.duration_hours
        : parseFloat(String(ongoing.duration_hours || 0).split(':')[0]) || 16;
      const recordDate = ongoing.date || todayStr;
      const start = dayjs(`${recordDate} ${ongoing.start_time}`, 'YYYY-MM-DD HH:mm');
      let end = dayjs(`${recordDate} ${ongoing.end_time}`, 'YYYY-MM-DD HH:mm');
      if (end.isBefore(start)) end = end.add(1, 'day');

      setSelectedPlan({title: ongoing.notes, hours: hrs});
      setFastStart(start);
      setFastEnd(end);
      setIsFasting(true);

      const total = end.diff(start, 'second');
      const left = end.diff(now, 'second');
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
        loadFastingRecords();
        clearInterval(interval);
        return;
      }
      const total = fastEnd.diff(fastStart, 'second');
      const left = fastEnd.diff(now, 'second');
      setProgress(((total - left) / total) * 100);
    }, 1000);
    return () => clearInterval(interval);
  }, [isFasting, fastStart, fastEnd, loadFastingRecords]);

  const startFasting = plan => {
    userEndedFastRef.current = false;
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
    userEndedFastRef.current = true;
    setIsFasting(false);
    setSelectedPlan(null);
    loadFastingRecords();
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'top']}>
      <View style={styles.wrapper}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {isFasting ? (
            <>
              <Text style={styles.sectionTitle}>Current Fasting Progress</Text>
              <HalfCircle
              onPressEdit={() =>
                navigation.navigate('CustomFast', {
                  ongoingFast: {
                    plan: selectedPlan,
                    startTime: fastStart?.toISOString(),
                    endTime: fastEnd?.toISOString(),
                    durationHours: selectedPlan?.hours || 0,
                    notes: selectedPlan?.title,
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
            <Text style={styles.sectionTitle}>Start a Fast</Text>
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

          {loading ? (
            <SmallLoader overlay />
          ) : (
            <ChartComponent
              title="Fasting Overview"
              activeRange={activeRange}
              onChangeRange={setActiveRange}
              chart={chart}
            />
          )}

        <View style={styles.recordsContainer}>
          <Text style={styles.recordsSectionTitle}>Recent Records</Text>
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
              onPress={() => navigation.navigate('CustomFast')}
              icon={appIcons.plus}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Fasting;
