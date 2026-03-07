import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import {colors, family, HP, size, WP} from '../../utilities';

const FastingPlans = ({
  fastingPlans,
  startFasting,
  isFasting,
  navigation,
  saving,
}) => {
  if (!fastingPlans || fastingPlans.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: HP(20),
        }}>
        <Text
          style={{
            textAlign: 'center',
            color: '#888',
            fontSize: 16,
          }}>
          No fasting plans available
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContainer}>
        {fastingPlans.map(plan => {
          const disabled = (isFasting || saving) && plan.id !== 'custom';
          return (
            <TouchableOpacity
              key={plan.id}
              activeOpacity={0.85}
              onPress={() => {
                if (plan.id === 'custom') {
                  navigation.navigate('CustomFast');
                } else if (!disabled) {
                  startFasting(plan);
                }
              }}
              disabled={disabled}
              style={[
                styles.planCard,
                {
                  backgroundColor: plan.bgColor,
                  borderColor: plan.bordercolor,
                },
              ]}>
              <View style={styles.planHeader}>
                <Text style={styles.planTitle}>{plan.title}</Text>
                {plan.hours && (
                  <View style={styles.hoursBadge}>
                    <Text style={styles.hoursText}>{plan.hours}h</Text>
                  </View>
                )}
              </View>
              <Text style={styles.planDescription}>{plan.description}</Text>
              <View
                style={[
                  styles.planButton,
                  disabled && styles.disabledButton,
                ]}>
                <Text
                  style={[
                    styles.planButtonText,
                    disabled && styles.planButtonTextDisabled,
                  ]}>
                  {plan.id === 'custom'
                    ? 'Customize'
                    : isFasting
                    ? 'Active'
                    : saving
                    ? 'Starting...'
                    : 'Start Now'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    width: '100%',
  },
  carouselContainer: {
    paddingVertical: HP(1),
  },
  planCard: {
    width: WP(48),
    minWidth: 155,
    paddingVertical: WP(3.5),
    paddingHorizontal: WP(3),
    borderRadius: 14,
    borderWidth: 2,
    marginRight: WP(2),
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.p1,
        shadowOffset: {width: 0, height: 3},
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {elevation: 4},
    }),
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: HP(0.5),
  },
  planTitle: {
    fontSize: size.medium,
    fontFamily: family.inter_bold,
    color: colors.b4,
  },
  hoursBadge: {
    backgroundColor: 'rgba(66, 82, 255, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  hoursText: {
    fontSize: size.xtiny,
    fontFamily: family.inter_bold,
    color: colors.p1,
  },
  planDescription: {
    fontSize: size.xtiny,
    fontFamily: family.inter_regular,
    color: colors.g3,
    textAlign: 'center',
    marginBottom: HP(1),
    lineHeight: 16,
  },
  planButton: {
    width: '100%',
    paddingVertical: HP(0.75),
    borderRadius: 10,
    backgroundColor: colors.p1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: colors.g11,
  },
  planButtonText: {
    color: colors.white,
    fontFamily: family.inter_bold,
    fontSize: size.xtiny,
    letterSpacing: 0.2,
  },
  planButtonTextDisabled: {
    color: colors.g9,
  },
});

export {FastingPlans};
