import React from 'react';
import {View, Text, TouchableOpacity, Image, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import {AreaChart, Grid, YAxis} from 'react-native-svg-charts';
import {Path, Defs, LinearGradient, Stop} from 'react-native-svg';
import * as shape from 'd3-shape';
import {appIcons} from '../../../utilities';
import {AppButton, Header} from '../../../components';
import styles from './styles';

export default function PredictiveSugarAlert() {
  const navigation = useNavigation();
  const route = useRoute();

  // Get prediction data from navigation params
  const {predictionResult, userInput} = route.params || {};

  // Use the data directly (predictionResult is already the data object)
  const predictionData = predictionResult || {};

  // Extract data from API response
  const {
    prediction,
    confidence,
    suggestion,
    last_reading,
    predicted_value,
    explanation,
    graph,
  } = predictionData;

  // Check if we have all required data
  const hasData =
    predictionData && last_reading && predicted_value && prediction;

  // Calculate change values
  const changeValue =
    last_reading && predicted_value
      ? predicted_value.value - last_reading.value
      : 0;
  const changePercent = last_reading?.value
    ? ((changeValue / last_reading.value) * 100).toFixed(1)
    : '0.0';

  // Determine alert status based on values
  const getAlertStatus = () => {
    if (!hasData) {
      return {type: 'unknown', color: '#64748b', title: 'Prediction'};
    }

    const predValue = predicted_value.value;
    const lastValue = last_reading.value;
    const difference = predValue - lastValue;

    if (predValue >= 180)
      return {type: 'high', color: '#ef4444', title: 'High Glucose Alert'};
    if (predValue <= 70)
      return {type: 'low', color: '#f59e0b', title: 'Low Glucose Alert'};
    if (lastValue >= 180 && predValue < 140)
      return {type: 'improving', color: '#10b981', title: 'Glucose Improving'};
    if (Math.abs(difference) > 30)
      return {type: 'spike', color: '#dc2626', title: 'Glucose Spike Expected'};
    if (difference > 15)
      return {type: 'rising', color: '#f97316', title: 'Glucose Rising'};
    if (difference < -15)
      return {type: 'dropping', color: '#3b82f6', title: 'Glucose Dropping'};
    return {type: 'stable', color: '#10b981', title: 'Glucose Stable'};
  };

  const alertStatus = getAlertStatus();

  // Format confidence as percentage
  const confidencePercent = confidence ? Math.round(confidence * 100) : 0;

  // Prepare chart data
  const chartData = graph?.data || [];
  const chartLabels = graph?.labels || [];

  // Chart components
  const DashedLine = ({line}) => (
    <Path
      d={line}
      stroke={alertStatus.color}
      strokeWidth={2}
      fill="none"
      strokeDasharray="6,3"
    />
  );

  const SolidLine = ({line}) => (
    <Path d={line} stroke="#64748b" strokeWidth={2} fill="none" />
  );

  const GradientArea = () => (
    <Defs key={'gradient'}>
      <LinearGradient
        id={'gradientPast'}
        x1={'0%'}
        y1={'0%'}
        x2={'0%'}
        y2={'100%'}>
        <Stop offset={'0%'} stopColor={'#94a3b8'} stopOpacity={0.2} />
        <Stop offset={'100%'} stopColor={'#ffffff'} stopOpacity={0} />
      </LinearGradient>
      <LinearGradient
        id={'gradientFuture'}
        x1={'0%'}
        y1={'0%'}
        x2={'0%'}
        y2={'100%'}>
        <Stop offset={'0%'} stopColor={alertStatus.color} stopOpacity={0.3} />
        <Stop offset={'100%'} stopColor={'#ffffff'} stopOpacity={0} />
      </LinearGradient>
    </Defs>
  );

  const ClippedArea = ({x, y, data}) => {
    const areaPath = shape
      .area()
      .x((d, index) => x(index))
      .y0(y(0))
      .y1(d => y(d))
      .curve(shape.curveNatural)(data);

    return (
      <>
        <Path
          d={areaPath}
          fill="url(#gradientPast)"
          clipPath={`url(#clip-past)`}
        />
        <Path
          d={areaPath}
          fill="url(#gradientFuture)"
          clipPath={`url(#clip-future)`}
        />
      </>
    );
  };

  // Helper functions
  const getTrendArrow = () => {
    if (!hasData) return '→';
    if (changeValue > 15) return '↑';
    if (changeValue < -15) return '↓';
    return '→';
  };

  const getTrendColor = () => {
    if (!hasData) return '#64748b';
    if (changeValue > 15) return '#dc2626';
    if (changeValue < -15) return '#10b981';
    return '#64748b';
  };

  const getTrendText = () => {
    if (!hasData) return 'No data';
    if (changeValue > 15) return `Rising ${Math.abs(changeValue)} mg/dL`;
    if (changeValue < -15) return `Dropping ${Math.abs(changeValue)} mg/dL`;
    return `Stable (±${Math.abs(changeValue)} mg/dL)`;
  };

  const getStatusMessage = () => {
    if (!hasData) return 'No prediction data available';
    if (last_reading.value >= 180 && predicted_value.value < 140) {
      return 'Your glucose is expected to improve significantly';
    }
    if (last_reading.value >= 180) {
      return 'Your glucose is high and needs attention';
    }
    if (last_reading.value <= 70) {
      return 'Your glucose is low, consider a snack';
    }
    return explanation || 'Based on your recent readings and activity level';
  };

  const getCurrentStatus = value => {
    if (!value) return 'N/A';
    if (value >= 180) return 'High';
    if (value <= 70) return 'Low';
    return 'Normal';
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Sugar Prediction" onPress={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {hasData ? (
          <>
            {/* Main Alert Card */}
            <View
              style={[styles.alertCard, {borderLeftColor: alertStatus.color}]}>
              <View style={styles.alertHeader}>
                <View style={styles.alertTitleContainer}>
                  <Text style={styles.alertTitle}>{alertStatus.title}</Text>
                  <View style={styles.confidenceBadge}>
                    <Text style={styles.confidenceText}>
                      {confidencePercent}% Confident
                    </Text>
                  </View>
                </View>
              </View>

              {/* Readings Comparison */}
              <View style={styles.readingsContainer}>
                <View style={styles.readingColumn}>
                  <Text style={styles.readingLabel}>Current</Text>
                  <Text
                    style={[
                      styles.readingValue,
                      last_reading.value >= 180
                        ? {color: '#ef4444'}
                        : last_reading.value <= 70
                        ? {color: '#f59e0b'}
                        : {},
                    ]}>
                    {last_reading.value}
                    <Text style={styles.readingUnit}> {last_reading.unit}</Text>
                  </Text>
                  <Text style={styles.currentStatus}>
                    {getCurrentStatus(last_reading.value)}
                  </Text>
                </View>

                <View style={styles.arrowContainer}>
                  <View style={styles.arrowLine} />
                  <Text style={[styles.arrowText, {color: getTrendColor()}]}>
                    {getTrendArrow()}
                  </Text>
                  <View style={styles.arrowLine} />
                  <Text style={styles.timeText}>in 1-2h</Text>
                </View>

                <View style={styles.readingColumn}>
                  <Text style={styles.readingLabel}>Predicted</Text>
                  <Text
                    style={[styles.readingValue, {color: alertStatus.color}]}>
                    {predicted_value.value}
                    <Text style={styles.readingUnit}>
                      {' '}
                      {predicted_value.unit}
                    </Text>
                  </Text>
                  <Text style={styles.predictedStatus}>
                    {getCurrentStatus(predicted_value.value)}
                  </Text>
                </View>
              </View>

              {/* Trend Indicator */}
              <View style={styles.trendContainer}>
                <Text style={[styles.trendText, {color: getTrendColor()}]}>
                  {getTrendText()} ({Math.abs(changePercent)}%)
                </Text>
              </View>

              {/* Chart */}
              {chartData.length > 0 && (
                <View style={styles.chartContainer}>
                  <YAxis
                    data={chartLabels.length > 0 ? chartLabels : [0, 100, 200]}
                    contentInset={{top: 10, bottom: 10}}
                    svg={{fill: '#64748b', fontSize: 10}}
                    numberOfTicks={4}
                    formatLabel={value => `${value}`}
                  />
                  <View style={styles.chartWrapper}>
                    <AreaChart
                      style={styles.chart}
                      data={chartData}
                      curve={shape.curveNatural}
                      contentInset={{top: 10, bottom: 10}}
                      svg={{fill: 'none'}}>
                      <GradientArea />
                      <Grid
                        svg={{stroke: '#e2e8f0', strokeWidth: 0.5}}
                        direction={Grid.Direction.HORIZONTAL}
                      />
                      <SolidLine />
                      <DashedLine />
                      <ClippedArea />
                    </AreaChart>
                  </View>
                </View>
              )}

              {/* Explanation */}
              <View style={styles.explanationContainer}>
                <Text style={styles.explanationText}>{getStatusMessage()}</Text>
              </View>

              {/* Prediction Detail */}
              {prediction && (
                <View style={styles.predictionDetail}>
                  <Text style={styles.predictionText}>
                    <Text style={styles.predictionLabel}>AI Analysis: </Text>
                    {prediction}
                  </Text>
                </View>
              )}
            </View>

            {/* AI Suggestion Card */}
            {suggestion && (
              <View style={styles.suggestionCard}>
                <View style={styles.suggestionHeader}>
                  <Image
                    source={appIcons.aiIcon || appIcons.bulbIcon}
                    style={styles.suggestionIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.suggestionTitle}>Recommendation</Text>
                </View>
                <Text style={styles.suggestionText}>{suggestion}</Text>

                {/* User Input Summary */}
                {userInput && (
                  <View style={styles.inputSummary}>
                    <Text style={styles.summaryTitle}>
                      Based on your inputs:
                    </Text>
                    <View style={styles.summaryGrid}>
                      <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Reading</Text>
                        <Text style={styles.summaryValue}>
                          {userInput.recentReading}
                        </Text>
                      </View>
                      <View style={styles.summaryDivider} />
                      <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Meal</Text>
                        <Text style={styles.summaryValue} numberOfLines={1}>
                          {userInput.lastMeal && userInput.lastMeal.length > 12
                            ? userInput.lastMeal.substring(0, 12) + '...'
                            : userInput.lastMeal || 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.summaryDivider} />
                      <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Activity</Text>
                        <Text style={styles.summaryValue}>
                          {userInput.activityLevel
                            ? userInput.activityLevel.charAt(0).toUpperCase() +
                              userInput.activityLevel.slice(1).substring(0, 3)
                            : 'N/A'}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Reminder Button */}
                {/* <TouchableOpacity
                  style={styles.remindButton}
                  onPress={() => console.log('Set reminder')}>
                  <Image
                    source={appIcons.bellIcon}
                    style={styles.bellIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.remindText}>Remind to check</Text>
                </TouchableOpacity> */}
              </View>
            )}

            {/* Glucose Ranges Reference */}
            <View style={styles.rangesCard}>
              <View style={styles.rangesHeader}>
                <Text style={styles.rangesTitle}>Glucose Ranges (mg/dL)</Text>
                {last_reading && (
                  <View style={styles.currentIndicator}>
                    <View
                      style={[
                        styles.indicatorDot,
                        {backgroundColor: '#10b981'},
                      ]}
                    />
                    <Text style={styles.indicatorText}>
                      Current: {last_reading.value}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.rangesGrid}>
                <View style={[styles.rangeItem, styles.rangeNormal]}>
                  <View
                    style={[styles.rangeColor, {backgroundColor: '#10b981'}]}
                  />
                  <Text style={styles.rangeText}>Normal: 70-140</Text>
                  {last_reading &&
                    last_reading.value >= 70 &&
                    last_reading.value <= 140 && (
                      <Text style={styles.rangeCurrent}>✓ Current</Text>
                    )}
                </View>
                <View style={[styles.rangeItem, styles.rangePrediabetes]}>
                  <View
                    style={[styles.rangeColor, {backgroundColor: '#f59e0b'}]}
                  />
                  <Text style={styles.rangeText}>Pre-diabetes: 141-199</Text>
                  {last_reading &&
                    last_reading.value >= 141 &&
                    last_reading.value <= 199 && (
                      <Text style={styles.rangeCurrent}>✓ Current</Text>
                    )}
                </View>
                <View style={[styles.rangeItem, styles.rangeDiabetes]}>
                  <View
                    style={[styles.rangeColor, {backgroundColor: '#ef4444'}]}
                  />
                  <Text style={styles.rangeText}>Diabetes: ≥200</Text>
                  {last_reading && last_reading.value >= 200 && (
                    <Text style={styles.rangeCurrent}>✓ Current</Text>
                  )}
                </View>
              </View>
              {predicted_value && (
                <View style={styles.predictedIndicator}>
                  <Text style={styles.predictedIndicatorText}>
                    Predicted: {predicted_value.value} mg/dL (
                    {changeValue > 0 ? '+' : ''}
                    {changeValue} change)
                  </Text>
                </View>
              )}
            </View>
          </>
        ) : (
          // No data state
          <View style={styles.noDataContainer}>
            <Image
              source={appIcons.warningIcon}
              style={styles.noDataIcon}
              resizeMode="contain"
            />
            <Text style={styles.noDataTitle}>No Prediction Data</Text>
            <Text style={styles.noDataText}>
              Unable to load prediction data. Please try again.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Single Bottom Button */}
      <View style={styles.bottomButtonContainer}>
        <AppButton
          title="Done"
          onPress={() => navigation.goBack()}
          style={styles.doneButton}
        />
      </View>
    </SafeAreaView>
  );
}
