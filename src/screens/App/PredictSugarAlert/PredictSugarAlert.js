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
import {AreaChart, Grid, YAxis} from 'react-native-svg-charts';
import {Path, Defs, LinearGradient, Stop} from 'react-native-svg';
import * as shape from 'd3-shape';
import {appIcons} from '../../../utilities';
import {AppButton, Header} from '../../../components';
import styles from './styles';

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
      <Header
        title="Predictive Sugar Alert"
        onPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
              <View style={styles.dottedLine} />

              <Text style={styles.timeLabel}>In 2hrs</Text>
              <View style={styles.dottedLine} />
            </View>

            <View style={styles.readingBox}>
              <Text style={styles.readingLabel}>Predicted</Text>
              <Text style={styles.readingValuePredicted}>~185 mg/dL</Text>
            </View>
          </View>

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
            <Image
              source={appIcons.bellIcon}
              style={styles.bellIcon}
              resizeMode="contain"
            />
            <Text style={styles.remindText}>Remind me in 30 mins</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.bottomButtonContainer}>
        <AppButton title="Done" onPress={() => navigation.goBack()} />
      </View>
    </SafeAreaView>
  );
}
