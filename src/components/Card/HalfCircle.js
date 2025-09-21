import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import Svg, {Circle} from 'react-native-svg';
import {appIcons, HP, WP, family, size} from '../../utilities';
import {Fonts} from '../../assets/fonts';

const HalfCircle = ({onPressEdit}) => {
  const percentage = 75;
  const remainingTime = '06:38 hrs';

  const radius = 100;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const halfCircumference = circumference / 2;

  const progressLength = (percentage / 100) * halfCircumference;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.label}>Started</Text>
          <Text style={styles.value}>08:00 PM</Text>
        </View>
        <View style={{alignItems: 'flex-end'}}>
          <Text style={styles.label}>Ends at</Text>
          <Text style={styles.value}>04:00 PM</Text>
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
            stroke="#E6E9F5"
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
            stroke="#4252FF"
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
          <Text style={styles.percentage}>{percentage}%</Text>
          <Text style={styles.remaining}>
            Remaining: <Text style={styles.remainingTime}>{remainingTime}</Text>
          </Text>
        </View>
      </View>

      <View style={styles.footerRow}>
        <TouchableOpacity style={styles.endBtn}>
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
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: WP(5),
    backgroundColor: '#fff',
    paddingVertical: HP(2),
    paddingHorizontal: WP(4),
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
    alignItems: 'center',
    width: '98%',
    alignSelf: 'center',
    marginVertical: HP(1),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: HP(2),
  },
  label: {
    fontSize: size.medium,
    color: '#555',
    fontFamily: Fonts.interMedium,
  },
  value: {
    fontSize: size.small,
    fontFamily: Fonts.interSemiBold,
    color: '#000',
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
    fontFamily: Fonts.interSemiBold,
    color: '#000',
  },
  remaining: {
    fontSize: size.small,
    fontFamily: Fonts.interRegular,
    color: '#333',
    marginTop: HP(0.5),
  },
  remainingTime: {
    color: '#4252FF',
    fontFamily: Fonts.interSemiBold,
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
    borderRadius: WP(3),
    borderWidth: 1,
    borderColor: '#D9E0FF',
    backgroundColor: '#F7F9FF',
    paddingVertical: HP(1.5),
    marginRight: WP(2),
  },
  endBtnText: {
    fontSize: WP(3.8),
    color: '#4252FF',
    fontFamily: Fonts.interSemiBold,
    marginLeft: WP(1.5),
  },
  editBtn: {
    borderRadius: WP(3),
    borderWidth: 1,
    borderColor: '#D9E0FF',
    padding: HP(1.5),
    backgroundColor: '#F7F9FF',
  },
  icon: {
    width: WP(4.5),
    height: WP(4.5),
  },
  iconOnly: {
    width: WP(4.5),
    height: WP(4.5),
  },
});

export {HalfCircle};
