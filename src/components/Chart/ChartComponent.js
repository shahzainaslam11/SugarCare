import React, {useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from 'react-native';
import {LineChart} from 'react-native-gifted-charts';
import {colors, family, HP, WP, size} from '../../utilities';
import Ionicons from 'react-native-vector-icons/Ionicons';

const RANGES = ['Today', '1W', '1M', 'All Time'];

const formatStatValue = v => {
  const n = Number(v);
  if (isNaN(n)) return '--';
  return n % 1 === 0 ? String(Math.round(n)) : n.toFixed(1);
};

const ChartComponent = ({
  activeRange = '1W',
  onChangeRange = () => {},
  chart = {},
  hideRanges = false,
  title = 'Activity Overview',
}) => {
  const {width: screenWidth, height: screenHeight} = useWindowDimensions();
  const noData = !chart?.labels?.length || !chart?.data?.length;

  const cardInnerWidth = useMemo(
    () => screenWidth - WP(8) - WP(8),
    [screenWidth],
  );
  const chartWidth = useMemo(
    () =>
      Math.max(cardInnerWidth - 36 - 72, 140),
    [cardInnerWidth],
  );
  const chartHeight = useMemo(
    () => Math.min(Math.round(screenHeight * 0.18), 150),
    [screenHeight],
  );

  const giftedData = useMemo(() => {
    if (noData) return [];
    const points = chart.labels.map((label, i) => ({
      value: Number(chart.data[i]) || 0,
      label: label,
    }));
    if (points.length === 1) {
      return [{...points[0]}, {value: points[0].value, label: ''}];
    }
    return points;
  }, [chart?.labels, chart?.data, noData]);

  const stats = useMemo(() => {
    if (noData || !chart.data?.length) return null;
    const values = chart.data.map(Number).filter(v => !isNaN(v));
    if (!values.length) return null;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const last = values[values.length - 1];
    return {min, max, last};
  }, [chart?.data, noData]);

  const chartColor = colors.p1;
  const chartGradientEnd = colors.p12;

  const rangeText =
    stats && stats.min === stats.max
      ? formatStatValue(stats.min)
      : stats
        ? `${formatStatValue(stats.min)}–${formatStatValue(stats.max)}`
        : '--';

  return (
    <View style={[styles.card, {width: screenWidth - WP(8)}]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {stats && !noData && (
            <View style={styles.statsInline}>
              <View style={styles.statBadge}>
                <Text style={styles.statLabel}>Latest</Text>
                <Text style={styles.statValue}>{formatStatValue(stats.last)}</Text>
              </View>
              <View style={styles.statBadge}>
                <Text style={styles.statLabel}>Range</Text>
                <Text style={styles.statValue}>{rangeText}</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {noData ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrapper}>
            <Ionicons name="stats-chart-outline" size={32} color={colors.g6} />
          </View>
          <Text style={styles.emptyTitle}>No records yet</Text>
          <Text style={styles.emptySubtitle}>
            Your chart will appear here once you add some entries
          </Text>
        </View>
      ) : (
        <View style={[styles.chartWrapper, {width: cardInnerWidth}]}>
          <LineChart
            data={giftedData}
            width={chartWidth}
            height={chartHeight}
            initialSpacing={12}
            endSpacing={36}
            color={chartColor}
            thickness={2}
            startFillColor={chartColor}
            endFillColor={chartGradientEnd}
            startOpacity={0.35}
            endOpacity={0.02}
            areaChart
            curved
            isAnimated
            animationDuration={700}
            hideDataPoints1={giftedData.length > 12}
            dataPointsColor1={chartColor}
            dataPointsRadius1={3}
            xAxisColor="transparent"
            yAxisColor={colors.g11}
            yAxisThickness={1}
            rulesColor={colors.g11}
            noOfSections={4}
            maxValue={
              stats
                ? Math.ceil(
                    (stats.max + Math.max(stats.max - stats.min, 20) * 0.5) /
                      10,
                  ) * 10
                : 150
            }
            yAxisLabelWidth={36}
          />
        </View>
      )}

      {!hideRanges && (
        <View style={styles.segmentContainer}>
          {RANGES.map(range => {
            const isActive = activeRange === range;
            return (
              <TouchableOpacity
                key={range}
                style={[styles.segmentBtn, isActive && styles.segmentBtnActive]}
                onPress={() => onChangeRange(range)}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.segmentText,
                    isActive && styles.segmentTextActive,
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit>
                  {range}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: colors.white,
    paddingVertical: HP(1.4),
    paddingHorizontal: WP(3),
    marginHorizontal: WP(2),
    marginBottom: HP(1.5),
    alignSelf: 'center',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {elevation: 3},
    }),
  },
  header: {
    marginBottom: HP(1),
    paddingHorizontal: WP(0.5),
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: size.medium,
    fontFamily: family.inter_bold,
    color: colors.b1,
  },
  statsInline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: WP(2),
  },
  statBadge: {
    backgroundColor: colors.g13,
    paddingHorizontal: WP(2),
    paddingVertical: HP(0.35),
    borderRadius: 8,
    marginRight: WP(1.5),
  },
  statLabel: {
    fontSize: size.xtiny,
    fontFamily: family.inter_regular,
    color: colors.g9,
    marginBottom: 1,
  },
  statValue: {
    fontSize: size.xsmall,
    fontFamily: family.inter_bold,
    color: colors.b1,
  },
  chartWrapper: {
    marginBottom: HP(1.2),
    alignItems: 'center',
    overflow: 'hidden',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: HP(2.5),
    paddingHorizontal: WP(4),
  },
  emptyIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.g13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: HP(1.2),
  },
  emptyTitle: {
    fontSize: size.small,
    fontFamily: family.inter_bold,
    color: colors.b1,
    marginBottom: HP(0.4),
  },
  emptySubtitle: {
    fontSize: size.xsmall,
    fontFamily: family.inter_regular,
    color: colors.g9,
    textAlign: 'center',
    lineHeight: size.xsmall * 1.4,
  },
  segmentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: WP(0.5),
  },
  segmentBtn: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: WP(0.4),
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.g11,
    paddingVertical: HP(0.7),
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBtnActive: {
    backgroundColor: colors.p1,
    borderColor: colors.p1,
  },
  segmentText: {
    fontSize: size.xsmall,
    fontFamily: family.inter_medium,
    color: colors.g9,
  },
  segmentTextActive: {
    color: colors.white,
  },
});

export {ChartComponent};
