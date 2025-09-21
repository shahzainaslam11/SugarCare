import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {LineChart} from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const ChartComponent = () => {
  const [activeRange, setActiveRange] = useState('1W');

  const chartData = {
    Today: {
      labels: ['9AM', '12PM', '3PM', '6PM', '9PM'],
      data: [50, 70, 60, 80, 75],
    },
    '1W': {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      data: [195, 180, 160, 145, 135, 137, 140],
    },
    '1M': {
      labels: ['W1', 'W2', 'W3', 'W4'],
      data: [600, 550, 500, 650],
    },
    'All Time': {
      labels: ['2021', '2022', '2023', '2024', '2025'],
      data: [2000, 3500, 4000, 6000, 7000],
    },
  };

  const data = {
    labels: chartData[activeRange].labels,
    datasets: [
      {
        data: chartData[activeRange].data,
        color: () => `#4252FF`,
        strokeWidth: 3.5,
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    fillShadowGradient: '#4252FF',
    fillShadowGradientOpacity: 0.15,
    propsForDots: {
      r: '0',
    },
    propsForBackgroundLines: {
      stroke: '#e3e3e3',
    },
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Activity Overview</Text>
        <Text style={styles.percentage}>+12%</Text>
      </View>

      {/* Chart */}
      <LineChart
        data={data}
        width={screenWidth - 60}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        withInnerLines={true}
        withOuterLines={false}
      />

      {/* Segment Buttons */}
      <View style={styles.segmentContainer}>
        {['Today', '1W', '1M', 'All Time'].map(range => (
          <TouchableOpacity
            key={range}
            style={
              activeRange === range ? styles.activeBtn : styles.inactiveBtn
            }
            onPress={() => setActiveRange(range)}>
            <Text
              style={
                activeRange === range ? styles.activeText : styles.inactiveText
              }>
              {range}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    backgroundColor: '#fff',
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
    width: '99%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  percentage: {
    fontSize: 15,
    fontWeight: '600',
    color: '#28a745', // green for growth %
  },
  chart: {
    borderRadius: 16,
    marginBottom: 20,
  },
  segmentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  inactiveBtn: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 6,
    paddingHorizontal: 18,
  },
  inactiveText: {
    fontSize: 14,
    color: '#555',
  },
  activeBtn: {
    borderRadius: 20,
    backgroundColor: '#4252FF',
    paddingVertical: 6,
    paddingHorizontal: 18,
  },
  activeText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
});

export {ChartComponent};
