import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Svg, {Path} from 'react-native-svg';

const HalfCircleProgress = ({progress, size = 180}) => {
  const radius = size / 2;
  const circumference = Math.PI * radius; // Circumference of half circle
  const progressValue = ((100 - progress) * circumference) / 100;

  return (
    <View style={[styles.progressContainer, {width: size, height: radius}]}>
      <Svg width={size} height={radius} viewBox={`0 0 ${size} ${radius}`}>
        {/* Background half circle */}
        <Path
          d={`M${radius * 0.1},${radius} 
             A${radius * 0.9},${radius * 0.9} 0 0 1 ${radius * 1.9},${radius}`}
          fill="none"
          stroke="#e6e6e6"
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* Progress half circle */}
        <Path
          d={`M${radius * 0.1},${radius} 
             A${radius * 0.9},${radius * 0.9} 0 0 1 ${radius * 1.9},${radius}`}
          fill="none"
          stroke="#4252FF"
          strokeWidth="14"
          strokeDasharray={circumference}
          strokeDashoffset={progressValue}
          strokeLinecap="round"
        />
      </Svg>
      <Text style={[styles.percent, {top: radius / 2 - 10}]}>
        {Math.round(progress)}%
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  percent: {
    position: 'absolute',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4252FF',
  },
});

export {HalfCircleProgress};
