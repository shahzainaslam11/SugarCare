import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, {Circle} from 'react-native-svg';
import {appIcons, colors, HP, WP, family, size} from '../../utilities';

const HalfCircle = ({
  onPressEdit,
  onEndFasting,
  startTime,
  endTime,
  remainingTime,
  progressPercentage,
}) => {
  const percentage = progressPercentage || 75;
  const remaining = remainingTime || '06:38 hrs';
  const start = startTime || '08:00 PM';
  const end = endTime || '04:00 PM';

  const radius = 88;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const halfCircumference = circumference / 2;

  const progressLength = (percentage / 100) * halfCircumference;

  const handleEndFasting = () => {
    if (onEndFasting) {
      onEndFasting();
    }
  };

  const cx = radius + 10;
  const cy = radius + 10;

  return (
    <View style={styles.cardWrapper}>
      <LinearGradient
        colors={[colors.p1, colors.p9]}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        style={styles.cardAccent}
      />
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.timeBlock}>
            <Text style={styles.label}>Started</Text>
            <Text style={styles.value}>{start}</Text>
          </View>
          <View style={[styles.timeBlock, styles.timeBlockEnd]}>
            <Text style={styles.label}>Ends at</Text>
            <Text style={styles.value}>{end}</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <Svg
            width={radius * 2 + 20}
            height={radius + 16}
            style={styles.svgWrap}>
            <Circle
              cx={cx}
              cy={cy}
              r={radius}
              stroke={colors.g15}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${halfCircumference}, ${circumference}`}
              strokeDashoffset={0}
              rotation="180"
              originX={cx}
              originY={cy}
              fill="none"
            />
            <Circle
              cx={cx}
              cy={cy}
              r={radius}
              stroke={colors.p1}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${halfCircumference}, ${circumference}`}
              strokeDashoffset={halfCircumference - progressLength}
              rotation="180"
              originX={cx}
              originY={cy}
              fill="none"
            />
          </Svg>
          <View style={styles.centerText}>
            <Text style={styles.percentage}>{Math.round(percentage)}%</Text>
            <Text style={styles.remaining}>
              <Text style={styles.remainingTime}>{remaining}</Text> left
            </Text>
          </View>
        </View>

        <View style={styles.footerRow}>
          <TouchableOpacity
            style={styles.endBtn}
            onPress={handleEndFasting}
            activeOpacity={0.85}>
            <Image
              source={appIcons.pause}
              style={styles.icon}
              resizeMode="contain"
            />
            <Text style={styles.endBtnText}>End Fast</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onPressEdit}
            style={styles.editBtn}
            activeOpacity={0.85}>
            <Image
              source={appIcons.edit}
              style={styles.iconOnly}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
    marginVertical: HP(0.6),
    borderWidth: 1,
    borderColor: 'rgba(66, 82, 255, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: colors.p1,
        shadowOffset: {width: 0, height: 3},
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: {elevation: 4},
    }),
  },
  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingVertical: HP(1.2),
    paddingHorizontal: WP(3),
    paddingLeft: WP(4),
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: HP(0.8),
  },
  timeBlock: {
    flex: 1,
  },
  timeBlockEnd: {
    alignItems: 'flex-end',
  },
  label: {
    fontSize: size.xtiny,
    color: colors.g9,
    fontFamily: family.inter_medium,
    marginBottom: 2,
  },
  value: {
    fontSize: size.small,
    fontFamily: family.inter_bold,
    color: colors.b4,
  },
  progressContainer: {
    alignItems: 'center',
    marginVertical: HP(0.6),
    position: 'relative',
  },
  svgWrap: {
    backgroundColor: 'transparent',
  },
  centerText: {
    position: 'absolute',
    top: '38%',
    alignItems: 'center',
    width: '100%',
  },
  percentage: {
    fontSize: size.h3,
    fontFamily: family.inter_bold,
    color: colors.p1,
  },
  remaining: {
    fontSize: size.xtiny,
    fontFamily: family.inter_regular,
    color: colors.g3,
    marginTop: 2,
  },
  remainingTime: {
    color: colors.p1,
    fontFamily: family.inter_bold,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: HP(0.6),
    gap: WP(2),
  },
  endBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.p1,
    backgroundColor: colors.p6,
    paddingVertical: HP(1),
    marginRight: 0,
  },
  endBtnText: {
    fontSize: size.xtiny,
    color: colors.p1,
    fontFamily: family.inter_bold,
    marginLeft: WP(1.2),
  },
  editBtn: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.p1,
    padding: HP(1),
    backgroundColor: colors.p6,
  },
  icon: {
    width: WP(3.8),
    height: WP(3.8),
    tintColor: colors.p1,
  },
  iconOnly: {
    width: WP(3.8),
    height: WP(3.8),
    tintColor: colors.p1,
  },
});

export {HalfCircle};
