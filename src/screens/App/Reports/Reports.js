import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import {ChartComponent, SmallLoader} from '../../../components';
import {appIcons, showError, showSuccess} from '../../../utilities';
import {SafeAreaView} from 'react-native-safe-area-context';
import {clearReports} from '../../../redux/slices/reportSlice';
import {fetchFastingRecords} from '../../../redux/slices/fastingSlice';
import {fetchSugarRecords} from '../../../redux/slices/sugarForecastSlice';

import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import styles from './styles';
import {useDispatch, useSelector} from 'react-redux';
import {useFocusEffect} from '@react-navigation/native';

const RANGE_MAP = {
  Today: 'Today',
  '1W': 'OneWeek',
  '1M': 'OneMonth',
  'All Time': 'AllTime',
};

const REPORT_TABS = [
  {key: 'Sugar', label: 'Sugar Report'},
  {key: 'Fasting', label: 'Fast Report'},
];

const Reports = () => {
  const dispatch = useDispatch();
  const {user, accessToken} = useSelector(state => state.auth);

  const {loading: reportLoading} = useSelector(state => state.report);

  const {
    graphData: sugarGraphData,
    stats: sugarStats,
    loading: sugarLoading,
    error: sugarError,
  } = useSelector(state => state.sugarForecast);

  const {
    graphData: fastingGraphData,
    stats: fastingStats,
    loading: fastingLoading,
    error: fastingError,
  } = useSelector(state => state.fasting);

  const [activeTab, setActiveTab] = useState('Today');
  const [activeReport, setActiveReport] = useState('Sugar');

  const apiRange = RANGE_MAP[activeTab];

  const loading = reportLoading || sugarLoading || fastingLoading;

  const sugarChart = sugarGraphData?.[apiRange] || {};
  const fastingChart = fastingGraphData?.[apiRange] || {};

  /* ================= SHOW API ERRORS ================= */
  useEffect(() => {
    if (sugarError?.message) showError(sugarError.message);
  }, [sugarError]);

  useEffect(() => {
    if (fastingError?.message) showError(fastingError.message);
  }, [fastingError]);

  /* ================= FETCH REPORT DATA ================= */
  const fetchReports = useCallback(
    async (range, reportType) => {
      if (!user?.id || !accessToken) return;

      const rangeValue = RANGE_MAP[range];

      try {
        if (reportType === 'Fasting') {
          const actionResult = await dispatch(
            fetchFastingRecords({
              user_id: user.id,
              time_range: rangeValue,
              token: accessToken,
            }),
          );

          if (fetchFastingRecords.fulfilled.match(actionResult)) {
            const message =
              actionResult.payload?.message || 'Fetched successfully';
            // showSuccess(message);
          } else if (fetchFastingRecords.rejected.match(actionResult)) {
            const message = actionResult.payload?.message || 'Failed to fetch';
            showError(message);
          }
        } else if (reportType === 'Sugar') {
          const actionResult = await dispatch(
            fetchSugarRecords({
              user_id: user.id,
              time_range: rangeValue,
              token: accessToken,
            }),
          );

          if (fetchSugarRecords.fulfilled.match(actionResult)) {
            const message =
              actionResult.payload?.message || 'Fetched successfully';
            // showSuccess(message);
          } else if (fetchSugarRecords.rejected.match(actionResult)) {
            const message = actionResult.payload?.message || 'Failed to fetch';
            showError(message);
          }
        }
      } catch (err) {
        showError(err?.message || 'An unexpected error occurred.');
      }
    },
    [user, accessToken, dispatch],
  );

  useEffect(() => {
    fetchReports(activeTab, activeReport);
    return () => dispatch(clearReports());
  }, [activeTab, activeReport, fetchReports, dispatch]);

  const handleReportSwitch = key => {
    dispatch(clearReports());
    setActiveReport(key);
    setActiveTab('Today');
  };
  useFocusEffect(
    useCallback(() => {
      setActiveTab('Today');
    }, []),
  );

  const handleRangeChange = useCallback(newRange => {
    setActiveTab(newRange);
  }, []);

  const handleDownload = async () => {
    try {
      const rangeValue = RANGE_MAP[activeTab];

      const url =
        activeReport === 'Sugar'
          ? `https://sugarcare.cloud/api/v1/sugar/forecast/report?user_id=${user.id}&time_range=${rangeValue}`
          : `https://sugarcare.cloud/api/v1/fasting/report?user_id=${user.id}&time_range=${rangeValue}`;

      const reportType = activeReport === 'Sugar' ? 'Sugar' : 'Fast';

      Alert.alert(
        'Download Report',
        `Do you want to download the ${reportType} Report?`,
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Download',
            onPress: async () => {
              const response = await fetch(url, {
                headers: {Authorization: `Bearer ${accessToken}`},
              });

              if (!response.ok) {
                const text = await response.text(); // Backend error message
                showError(text || `Failed to fetch ${reportType} report.`);
                return;
              }

              const blob = await response.blob();
              const reader = new FileReader();

              reader.onloadend = async () => {
                const base64 = reader.result.split(',')[1];
                const fileName = `${reportType}_Report.pdf`;
                const filePath =
                  Platform.OS === 'android'
                    ? `${RNFS.DownloadDirectoryPath}/${fileName}`
                    : `${RNFS.TemporaryDirectoryPath}/${fileName}`;

                try {
                  await RNFS.writeFile(filePath, base64, 'base64');

                  if (Platform.OS === 'ios') {
                    await Share.open({
                      url: `file://${filePath}`,
                      type: 'application/pdf',
                    });
                    showSuccess(
                      `${reportType} Report downloaded successfully.`,
                    );
                  } else {
                    showSuccess(`Report saved to Downloads as ${fileName}`);
                  }
                } catch (writeErr) {
                  showError(`Failed to save file: ${writeErr.message}`);
                }
              };

              reader.readAsDataURL(blob);
            },
          },
        ],
        {cancelable: true},
      );
    } catch (err) {
      showError(err?.message || 'An unexpected error occurred.');
    }
  };

  /* ================= CHART DATA / STATS ================= */
  const chartData = activeReport === 'Sugar' ? sugarChart : fastingChart;

  const averageLabel =
    activeReport === 'Sugar' ? 'Average Sugar' : 'Average Fast';
  const totalRecordsLabel =
    activeReport === 'Sugar' ? 'Total Sugar Records' : 'Total Fast Records';

  const average =
    activeReport === 'Sugar'
      ? sugarStats?.averageSugarLevel ?? '--'
      : fastingStats?.averageFastingTime ?? '--';

  const totalRecords =
    activeReport === 'Sugar'
      ? sugarStats?.totalSugarDays ?? '--'
      : fastingStats?.totalFastingDays ?? '--';

  const chartTitle =
    activeReport === 'Sugar' ? 'Blood Sugar Overview' : 'Fasting Overview';

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      {loading && <SmallLoader />}

      <View style={styles.wrapper}>
        <Text style={styles.title}>Reports</Text>

        {/* ===== REPORT TYPE SWITCH ===== */}
        <View style={styles.reportTabContainer}>
          {REPORT_TABS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.reportTab,
                activeReport === tab.key && styles.activeReportTab,
              ]}
              onPress={() => handleReportSwitch(tab.key)}
              activeOpacity={0.8}>
              <Text
                style={[
                  styles.reportTabText,
                  activeReport === tab.key && styles.activeReportTabText,
                ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <ChartComponent
            title={chartTitle}
            activeRange={activeTab}
            onChangeRange={handleRangeChange}
            chart={chartData}
          />

          {/* ===== STATS ===== */}
          <Text style={styles.sectionLabel}>Summary</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardLeft]}>
              <View style={styles.statAccent} />
              <Text style={styles.statLabel}>{averageLabel}</Text>
              <Text style={styles.statValue}>{average}</Text>
            </View>

            <View style={[styles.statCard, styles.statCardRight]}>
              <View style={styles.statAccent} />
              <Text style={styles.statLabel}>{totalRecordsLabel}</Text>
              <Text style={styles.statValue}>{totalRecords}</Text>
            </View>
          </View>
        </ScrollView>

        {/* ===== DOWNLOAD BUTTON (fixed above bottom tabs) ===== */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={handleDownload}
            activeOpacity={0.85}>
            <Image source={appIcons.download} style={styles.downloadIcon} />
            <Text style={styles.downloadButtonText}>
              {activeReport === 'Sugar'
                ? 'Download Sugar Report'
                : 'Download Fast Report'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Reports;
