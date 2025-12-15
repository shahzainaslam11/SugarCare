import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {LineChart} from 'react-native-chart-kit';
import {colors, family, HP, size} from '../../utilities';

const screenWidth = Dimensions.get('window').width;

/* UI-only ranges */
const RANGES = ['Today', '1W', '1M', 'All Time'];

const ChartComponent = ({
  activeRange = '1W',
  onChangeRange = () => {},
  chart = {},
  hideRanges = false,
}) => {
  const noData = !chart?.labels?.length || !chart?.data?.length;

  const chartData = noData
    ? {labels: [], datasets: [{data: []}]}
    : {
        labels: chart.labels,
        datasets: [
          {
            data: chart.data,
            strokeWidth: 3.5,
          },
        ],
      };

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: opacity => colors.p1,
    labelColor: opacity => `rgba(0,0,0,${opacity})`,
    fillShadowGradientOpacity: 0.15,
    propsForDots: {r: '0'},
    propsForBackgroundLines: {stroke: '#e3e3e3'},
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity Overview</Text>
      </View>

      {noData ? (
        <Text style={styles.emptyText}>No records found</Text>
      ) : (
        <LineChart
          data={chartData}
          width={screenWidth - 60}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withInnerLines
          withOuterLines={false}
        />
      )}

      {!hideRanges && (
        <View style={styles.segmentContainer}>
          {RANGES.map(range => (
            <TouchableOpacity
              key={range}
              style={
                activeRange === range ? styles.activeBtn : styles.inactiveBtn
              }
              onPress={() => onChangeRange(range)}
              activeOpacity={0.8}>
              <Text
                style={
                  activeRange === range
                    ? styles.activeText
                    : styles.inactiveText
                }>
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
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
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
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
    paddingHorizontal: 16,
  },
  inactiveText: {
    fontSize: 14,
    color: '#555',
  },
  activeBtn: {
    borderRadius: 20,
    backgroundColor: '#4252FF',
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  activeText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: size.medium,
    fontFamily: family.inter_bold,
    color: '#666',
    marginBottom: HP(0.6),
    alignSelf: 'center',
    marginVertical: HP(3),
  },
});

export {ChartComponent};
