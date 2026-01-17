import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {HP} from '../../utilities';

const FastingPlans = ({fastingPlans, startFasting, isFasting, navigation}) => {
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
                isFasting && plan.id !== 'custom' && styles.disabledButton,
              ]}
              onPress={() => {
                if (plan.id === 'custom') {
                  navigation.navigate('AppScreens', {screen: 'CustomFast'});
                } else if (!isFasting) {
                  startFasting(plan);
                }
              }}
              disabled={isFasting && plan.id !== 'custom'}>
              <Text style={styles.planButtonText}>
                {plan.id === 'custom'
                  ? 'Customize'
                  : isFasting
                  ? 'Active'
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
    paddingVertical: HP(2),
  },
  planCard: {
    width: 224.67,
    height: 156,
    padding: 20,
    borderRadius: 28,
    borderWidth: 2,
    marginRight: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#191A26',
  },
  planDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  planButton: {
    width: 184.67,
    height: 43,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#4252FF',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    borderColor: '#ccc',
  },
  planButtonText: {
    color: '#4252FF',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export {FastingPlans};
