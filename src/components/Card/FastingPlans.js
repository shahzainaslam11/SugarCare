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
        {fastingPlans.map(plan => (
          <View
            key={plan.id}
            style={[
              styles.planCardWrapper,
              styles.planCard,
              {
                backgroundColor: plan.bgColor,
                borderColor: plan.bordercolor,
              },
            ]}>
              <Text style={styles.planTitle}>{plan.title}</Text>
              <Text style={styles.planDescription}>{plan.description}</Text>

              <TouchableOpacity
                style={[
                  styles.planButton,
                  (isFasting || saving) && plan.id !== 'custom' &&
                    styles.disabledButton,
                ]}
                onPress={() => {
                  if (plan.id === 'custom') {
                    navigation.navigate('CustomFast');
                  } else if (!isFasting && !saving) {
                    startFasting(plan);
                  }
                }}
                disabled={(isFasting || saving) && plan.id !== 'custom'}
                activeOpacity={0.8}>
                <Text
                  style={[
                    styles.planButtonText,
                    (isFasting || saving) && plan.id !== 'custom' &&
                      styles.planButtonTextDisabled,
                  ]}>
                  {plan.id === 'custom'
                    ? 'Customize'
                    : isFasting
                    ? 'Active'
                    : saving
                    ? 'Starting...'
                    : 'Start Now'}
                </Text>
              </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    width: '100%',
  },
  carouselContainer: {
    paddingVertical: HP(1.5),
  },
  planCardWrapper: {
    marginRight: WP(3),
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  planCard: {
    width: WP(58),
    minWidth: 200,
    height: 140,
    padding: WP(4),
    borderWidth: 2,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planTitle: {
    fontSize: size.large,
    fontFamily: family.inter_bold,
    color: colors.b4,
  },
  planDescription: {
    fontSize: size.xsmall,
    fontFamily: family.inter_regular,
    color: colors.g3,
    textAlign: 'center',
  },
  planButton: {
    width: '100%',
    paddingVertical: HP(1.2),
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.p1,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: colors.g15,
    borderColor: colors.g11,
  },
  planButtonText: {
    color: colors.p1,
    fontFamily: family.inter_bold,
    fontSize: size.small,
  },
  planButtonTextDisabled: {
    color: colors.g3,
  },
});

export {FastingPlans};
