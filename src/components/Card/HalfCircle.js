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

  const radius = 100;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const halfCircumference = circumference / 2;

  const progressLength = (percentage / 100) * halfCircumference;

  const handleEndFasting = () => {
    if (onEndFasting) {
      onEndFasting();
    }
  };

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
        <View>
          <Text style={styles.label}>Started</Text>
          <Text style={styles.value}>{start}</Text>
        </View>
        <View style={{alignItems: 'flex-end'}}>
          <Text style={styles.label}>Ends at</Text>
          <Text style={styles.value}>{end}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <Svg
          width={radius * 2 + 20}
          height={radius + 20}
          style={{backgroundColor: 'transparent'}}>
          <Circle
            cx={radius + 10}
            cy={radius + 10}
            r={radius}
            stroke={colors.g15}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${halfCircumference}, ${circumference}`}
            strokeDashoffset={0}
            rotation="180"
            originX={radius + 10}
            originY={radius + 10}
            fill="none"
          />

          <Circle
            cx={radius + 10}
            cy={radius + 10}
            r={radius}
            stroke={colors.p1}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${halfCircumference}, ${circumference}`}
            strokeDashoffset={halfCircumference - progressLength}
            rotation="180"
            originX={radius + 10}
            originY={radius + 10}
            fill="none"
          />
        </Svg>

        <View style={styles.centerText}>
          <Text style={styles.percentage}>{Math.round(percentage)}%</Text>
          <Text style={styles.remaining}>
            Remaining: <Text style={styles.remainingTime}>{remaining}</Text>
          </Text>
        </View>
      </View>

      <View style={styles.footerRow}>
        <TouchableOpacity style={styles.endBtn} onPress={handleEndFasting}>
          <Image
            source={appIcons.pause}
            style={styles.icon}
            resizeMode="contain"
          />
          <Text style={styles.endBtnText}>End Fasting</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onPressEdit} style={styles.editBtn}>
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
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: HP(1),
    ...Platform.select({
      ios: {
        shadowColor: colors.p1,
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: HP(2),
    paddingHorizontal: WP(4),
    paddingLeft: WP(5),
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: HP(2),
  },
  label: {
    fontSize: size.xxsmall,
    color: colors.g3,
    fontFamily: family.inter_medium,
  },
  value: {
    fontSize: size.medium,
    fontFamily: family.inter_bold,
    color: colors.b4,
  },
  progressContainer: {
    alignItems: 'center',
    marginVertical: HP(1.5),
  },
  centerText: {
    position: 'absolute',
    top: '40%',
    alignItems: 'center',
    width: '100%',
  },
  percentage: {
    fontSize: size.h1,
    fontFamily: family.inter_bold,
    color: colors.b4,
  },
  remaining: {
    fontSize: size.small,
    fontFamily: family.inter_regular,
    color: colors.g3,
    marginTop: HP(0.5),
  },
  remainingTime: {
    color: colors.p1,
    fontFamily: family.inter_bold,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: HP(2),
  },
  endBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.p1,
    backgroundColor: colors.p6,
    paddingVertical: HP(1.5),
    marginRight: WP(2),
  },
  endBtnText: {
    fontSize: size.small,
    color: colors.p1,
    fontFamily: family.inter_bold,
    marginLeft: WP(1.5),
  },
  editBtn: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.p1,
    padding: HP(1.5),
    backgroundColor: colors.p6,
  },
  icon: {
    width: WP(4.5),
    height: WP(4.5),
    tintColor: colors.p1,
  },
  iconOnly: {
    width: WP(4.5),
    height: WP(4.5),
    tintColor: colors.p1,
  },
});

export {HalfCircle};
