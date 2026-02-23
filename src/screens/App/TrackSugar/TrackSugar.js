import React, {useEffect, useCallback} from 'react';
import {View, Text, ScrollView} from 'react-native';
import {
  AppButton,
  ChartComponent,
  SugarRecordCard,
  SmallLoader,
} from '../../../components';
import {styles} from './styles';
import {appIcons, showError} from '../../../utilities';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {fetchSugarRecords} from '../../../redux/slices/sugarForecastSlice';
import {SafeAreaView} from 'react-native-safe-area-context';

const RANGE_MAP = {
  Today: 'Today',
  '1W': 'OneWeek',
  '1M': 'OneMonth',
  'All Time': 'AllTime',
};

const TrackSugar = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {recordsByRange, graphData, loading, error} = useSelector(
    state => state.sugarForecast,
  );
  const {accessToken, user} = useSelector(state => state.auth);

  const [activeRange, setActiveRange] = React.useState('Today');
  const apiRange = RANGE_MAP[activeRange];

  const records = recordsByRange?.[apiRange] || [];
  const chart = graphData?.[apiRange] || {};

  // Fetch records function
  const loadSugarRecords = useCallback(() => {
    if (user?.id && accessToken) {
      dispatch(
        fetchSugarRecords({
          user_id: user.id,
          time_range: apiRange,
          token: accessToken,
        }),
      );
    }
  }, [user, accessToken, apiRange, dispatch]);

  // Refresh whenever screen is focused
  useFocusEffect(
    useCallback(() => {
      loadSugarRecords();
    }, [loadSugarRecords]),
  );

  useEffect(() => {
    if (error) showError(error);
  }, [error]);

  const handleAddSugarRecord = () => {
    navigation.navigate('NewSugarRecord');
  };

  // Full screen loader while fetching data

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'top']}>
      <View style={{flex: 1}}>
        <ScrollView
          contentContainerStyle={[styles.contentContainer, {flexGrow: 1}]}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.forecastTitle}>Blood Sugar Forecast</Text>
          <Text style={styles.readingText}>
            {records[0]?.value ?? '--'} mg/dL
          </Text>
          <Text style={styles.trendText}>
            Next 3 hours {records[0]?.trend ?? '--'}
          </Text>
          {loading && <SmallLoader />}

          {/* Chart */}
          <ChartComponent
            activeRange={activeRange}
            onChangeRange={setActiveRange}
            chart={chart}
          />
          <View style={styles.recordsContainer}>
            <Text style={styles.sectionTitle}>Recent Records</Text>

            {!records.length && <SugarRecordCard empty />}

            {records.map((record, index) => (
              <SugarRecordCard key={record.id || index} record={record} />
            ))}
          </View>
        </ScrollView>
        <View style={styles.buttonContainer}>
          <AppButton
            title="Add New Record"
            onPress={handleAddSugarRecord}
            icon={appIcons.plus}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default TrackSugar;
