import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {LineChart} from 'react-native-chart-kit';

const BloodSugarChart = ({bloodSugar, timeFilter, setTimeFilter}) => {
  const chartData = {
    Today: {
      labels: ['12AM', '3AM', '6AM', '9AM', '12PM', '3PM', '6PM'],
      data: [120, 115, 110, 130, 125, 118, 112],
    },
    '1W': {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      data: [120, 115, 110, 130, 125, 118, 112],
    },
    '1M': {
      labels: ['Week1', 'Week2', 'Week3', 'Week4'],
      data: [125, 118, 122, 115],
    },
    'All Time': {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [130, 125, 120, 118, 115, 112],
    },
  };

  return (
    <View style={styles.section}>
      <Text style={styles.subtitle}>Blood Sugar Forecast</Text>
      <Text style={styles.value}>{bloodSugar} mg/dL (Safe Range)</Text>
      <Text style={styles.time}>Today 3:00 AM</Text>
      <LineChart
        data={{
          labels: chartData[timeFilter].labels,
          datasets: [{data: chartData[timeFilter].data}],
        }}
        width={Dimensions.get('window').width - 48}
        height={180}
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          color: (opacity = 1) => `rgba(66, 82, 255, ${opacity})`,
          style: {borderRadius: 16},
        }}
        bezier
        style={styles.chart}
      />
      <View style={styles.timeButtons}>
        {['Today', '1W', '1M', 'All Time'].map(filter => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.timeButton,
              timeFilter === filter && styles.activeTimeButton,
            ]}
            onPress={() => setTimeFilter(filter)}>
            <Text
              style={[
                styles.timeButtonText,
                timeFilter === filter && styles.activeTimeButtonText,
              ]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  subtitle: {fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#000'},
  value: {fontSize: 20, fontWeight: '500', marginBottom: 4, color: '#000'},
  time: {fontSize: 12, color: '#666', marginBottom: 8},
  chart: {marginVertical: 8, borderRadius: 12},
  timeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    minWidth: 70,
    alignItems: 'center',
  },
  activeTimeButton: {
    backgroundColor: '#4252FF',
  },
  timeButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  activeTimeButtonText: {
    color: '#fff',
  },
});

export {BloodSugarChart};
