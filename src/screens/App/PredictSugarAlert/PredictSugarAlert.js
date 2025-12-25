import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {
  LineChart,
  AreaChart,
  Grid,
  YAxis,
  XAxis,
} from 'react-native-svg-charts';
import {Path, Defs, LinearGradient, Stop} from 'react-native-svg';
import * as shape from 'd3-shape';
import {appIcons} from '../../../utilities';
import {Header} from '../../../components';

export default function PredictiveSugarAlert() {
  const navigation = useNavigation();

  // Sample data - replace with your API data
  const pastData = [80, 110, 140, 120, 90, 85]; // Past (solid gray)
  const futureData = [85, 110, 145, 170, 185, 195]; // Predicted spike (dashed red)

  const data = [...pastData, ...futureData.slice(1)]; // Combine for smooth connection
  const predictionStartIndex = pastData.length - 1;

  // Custom dashed line for future part
  const DashedLine = ({line}) => (
    <Path
      d={line}
      stroke="#528FC1FF"
      strokeWidth={4}
      fill="none"
      strokeDasharray="8,4"
    />
  );

  // Solid line for past
  const SolidLine = ({line}) => (
    <Path d={line} stroke="#999999" strokeWidth={4} fill="none" />
  );

  // Area fill: light gray for past, light pink for future
  const GradientArea = () => (
    <Defs key={'gradient'}>
      <LinearGradient
        id={'gradientPast'}
        x1={'0%'}
        y1={'0%'}
        x2={'0%'}
        y2={'100%'}>
        <Stop offset={'0%'} stopColor={'#cccccc'} stopOpacity={0.3} />
        <Stop offset={'100%'} stopColor={'#ffffff'} stopOpacity={0} />
      </LinearGradient>
      <LinearGradient
        id={'gradientFuture'}
        x1={'0%'}
        y1={'0%'}
        x2={'0%'}
        y2={'100%'}>
        <Stop offset={'0%'} stopColor={'#F11C1CFF'} stopOpacity={0.4} />
        <Stop offset={'100%'} stopColor={'#3B1F1FFF'} stopOpacity={0.1} />
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Header
          title="Predictive Sugar Alert"
          onPress={() => navigation.goBack()}
        />

        {/* Header */}

        {/* Main Card */}
        <View style={styles.alertCard}>
          <View style={styles.alertHeader}>
            <Text style={styles.alertTitle}>Glucose Spike Expected</Text>
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>92% Confidence</Text>
            </View>
          </View>

          <View style={styles.readingsRow}>
            <View style={styles.readingBox}>
              <Text style={styles.readingLabel}>Last Reading</Text>
              <Text style={styles.readingValue}>140 mg/dL</Text>
            </View>

            <View style={styles.dottedLineContainer}>
              <Text style={styles.timeLabel}>In 2hrs</Text>
              <View style={styles.dottedLine} />
            </View>

            <View style={styles.readingBox}>
              <Text style={styles.readingLabel}>Predicted</Text>
              <Text style={styles.readingValuePredicted}>~185 mg/dL</Text>
            </View>
          </View>

          {/* Perfect Matching Chart */}
          <View style={styles.chartContainer}>
            <YAxis
              data={data}
              contentInset={{top: 20, bottom: 20}}
              svg={{fill: '#666', fontSize: 12}}
              numberOfTicks={5}
              formatLabel={value => `${value}`}
            />
            <View style={{flex: 1, marginLeft: 16}}>
              <AreaChart
                style={{flex: 1}}
                data={data}
                curve={shape.curveNatural}
                contentInset={{top: 20, bottom: 20}}
                svg={{fill: 'none'}}>
                <GradientArea />
                <Grid
                  svg={{stroke: '#eee', strokeDasharray: '6,6'}}
                  direction={Grid.Direction.HORIZONTAL}
                />
                <SolidLine />
                <DashedLine />
                <ClippedArea />
              </AreaChart>
            </View>
          </View>

          <Text style={styles.description}>
            Based on your recent high-carb lunch and low activity, your glucose
            level may spike in next 2 hours
          </Text>
        </View>

        {/* AI Suggestion */}
        <View style={styles.suggestionCard}>
          <View style={styles.suggestionHeader}>
            <Text style={styles.suggestionTitle}>AI Suggestion</Text>
          </View>
          <Text style={styles.suggestionText}>
            Consider a short walk after your meal to help manage glucose levels.
          </Text>

          <TouchableOpacity style={styles.remindButton}>
            <Image source={appIcons.bell} style={styles.bellIcon} />
            <Text style={styles.remindText}>Remind me in 30 mins</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Done Button */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },

  alertCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  confidenceBadge: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  confidenceText: {
    color: '#0369a1',
    fontSize: 13,
    fontWeight: '600',
  },

  readingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 30,
  },
  readingBox: {
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 100,
  },
  readingLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  readingValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  readingValuePredicted: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F38484FF',
  },
  dottedLineContainer: {
    alignItems: 'center',
  },
  dottedLine: {
    width: 60,
    borderBottomWidth: 2,
    borderStyle: 'dotted',
    borderColor: '#ccc',
    marginTop: 8,
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
  },

  chartContainer: {
    flexDirection: 'row',
    height: 220,
    marginBottom: 20,
  },

  description: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    textAlign: 'center',
  },

  suggestionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 100,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  suggestionHeader: {
    backgroundColor: '#e0f2fe',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  suggestionTitle: {
    color: '#0369a1',
    fontSize: 14,
    fontWeight: '600',
  },
  suggestionText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 20,
  },
  remindButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 14,
    borderRadius: 30,
  },
  bellIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  remindText: {
    color: '#2563eb',
    fontSize: 15,
    fontWeight: '600',
  },

  bottomButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  doneButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  doneText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
