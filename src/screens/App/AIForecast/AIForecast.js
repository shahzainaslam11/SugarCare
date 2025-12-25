import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import {appIcons} from '../../../utilities';

// Reusable RiskCard Component
const RiskCard = ({risk}) => {
  const {title, icon, riskLevel, riskPercentage, cause, tip} = risk;

  // Determine styling based on risk level
  const getRiskStyles = () => {
    switch (riskLevel) {
      case 'High':
        return {
          riskText: styles.riskLevelHigh,
          arrowIcon: appIcons.arrowUp,
          arrowTint: '#DC143C',
          tipBadge: styles.tipBadgeHigh,
          tipText: styles.tipTextHigh,
        };
      case 'Safe':
        return {
          riskText: styles.riskLevelSafe,
          arrowIcon: appIcons.arrowDown,
          arrowTint: '#28A745',
          tipBadge: styles.tipBadgeSafe,
          tipText: styles.tipTextSafe,
        };
      case 'Average':
        return {
          riskText: styles.riskLevelAverage,
          arrowIcon: null, // No arrow for average
          tipBadge: styles.tipBadgeAverage,
          tipText: styles.tipText,
        };
      case 'Moderate':
        return {
          riskText: styles.riskLevelModerate,
          arrowIcon: appIcons.arrowUp, // No arrow for moderate
          tipBadge: styles.tipBadgeModerate,
          tipText: styles.tipText,
        };
      default:
        return {
          riskText: styles.riskLevelAverage,
          arrowIcon: null,
          tipBadge: styles.tipBadgeAverage,
          tipText: styles.tipText,
        };
    }
  };

  const riskStyles = getRiskStyles();

  return (
    <View style={styles.riskCard}>
      {/* Header with title and icon */}
      <View style={styles.riskHeader}>
        <Text style={styles.riskTitle}>{title}</Text>
        <View style={styles.iconContainer}>
          <Image source={icon} style={styles.riskIcon} />
        </View>
      </View>

      {/* Risk level with arrow indicator */}
      <View style={styles.riskLevelContainer}>
        <Text style={riskStyles.riskText}>
          Risk: {riskLevel} ({riskPercentage})
        </Text>
        {riskStyles.arrowIcon && (
          <Image
            source={riskStyles.arrowIcon}
            style={[styles.arrowIcon, {tintColor: riskStyles.arrowTint}]}
          />
        )}
      </View>

      {/* Cause section */}
      <Text style={styles.causeLabel}>Cause:</Text>
      <Text style={styles.causeText}>{cause}</Text>

      {/* Tip section */}
      <Text style={styles.tipLabel}>Tip:</Text>
      <View style={riskStyles.tipBadge}>
        <Text style={riskStyles.tipText}>{tip}</Text>
      </View>
    </View>
  );
};

export default function AIRiskForecasting({navigation}) {
  // Risk data array (you can move this to a separate file or fetch from API)
  const risksData = [
    {
      id: 1,
      title: 'Neuropathy (Nerve Damage)',
      icon: appIcons.nerve,
      riskLevel: 'High',
      riskPercentage: '10%',
      cause:
        'Long-term elevated blood sugar, coupled with sedentary habits, significantly increasing risk of nerve damage.',
      tip: 'Prioritize daily physical activity.',
    },
    {
      id: 2,
      title: 'Cardiovascular Risk (Heart Issues)',
      icon: appIcons.heart,
      riskLevel: 'Safe',
      riskPercentage: '10%',
      cause:
        'Healthy fasting glucose, consistent physical activity, and balanced meal patterns supporting heart health.',
      tip: 'Continue a heart-healthy diet, regular exercise, and stress management.',
    },
    // Add more risks as needed following the same structure
    {
      id: 3,
      title: 'Nephropathy (Kidney Health)',
      icon: appIcons.kidney,
      riskLevel: 'Average',
      riskPercentage: '10%',
      cause:
        'Occasional post-meal glucose spikes and inconsistent salt intake detected.',
      tip: 'Watch sodium intake; stay hydrated daily',
    },
    {
      id: 4,
      title: 'Retinopathy (Eye Damage)',
      icon: appIcons.eye,
      riskLevel: 'Moderate',
      riskPercentage: '15%',
      cause: 'Consistent elevated long-term glucose patterns detected.',
      tip: 'Annual eye check-ups recommended',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={appIcons.back_Arrow} style={styles.iconSmall} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Risk Forecasting</Text>
        <Image source={appIcons.info} style={styles.iconSmall} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {/* What is AI Risk Forecasting? */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>What is AI Risk Forecasting?</Text>
          <Text style={styles.infoText}>
            Our AI analyzes your logged blood sugar trends, fasting routine, and
            eating habits to predict potential health risks and offer tailored
            recommendations.
          </Text>
          <Text style={styles.infoTextBold}>
            Our Recommendations are predictions, not a substitute for
            professional medical advice!
          </Text>
        </View>

        {/* Overall Risk Status */}
        <View style={styles.riskStatusCard}>
          <Text style={styles.sectionTitle}>Overall Risk Status</Text>
          <View style={styles.safeBadge}>
            <Text style={styles.safeText}>Safe</Text>
          </View>
        </View>

        {/* Risk Predictions */}
        <Text style={styles.sectionHeader}>Risk Predictions</Text>
        <Text style={styles.subtitle}>
          Next 8–12 weeks (based on your last 30–60 days of data)
        </Text>

        {/* Render all risk cards */}
        {risksData.map(risk => (
          <RiskCard key={risk.id} risk={risk} />
        ))}

        {/* Prevention Tips */}
        <Text style={styles.sectionHeader}>Prevention Tips</Text>
        <View style={styles.tipsContainer}>
          <View style={styles.tipItem}>
            <Image source={appIcons.tip} style={styles.tipIcon} />
            <Text style={styles.tipItemText}>
              Keep HbA1c below 6.5% for long-term risk reduction.
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Image source={appIcons.tip} style={styles.tipIcon} />
            <Text style={styles.tipItemText}>
              Limit processed foods and excess salt.
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Image source={appIcons.tip} style={styles.tipIcon} />
            <Text style={styles.tipItemText}>
              Drink 2–3 liters of water daily.
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Image source={appIcons.tip} style={styles.tipIcon} />
            <Text style={styles.tipItemText}>
              Consult your doctor regularly for personalized advice.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f8fafc'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {fontSize: 20, fontWeight: 'bold', color: '#000'},
  iconSmall: {width: 24, height: 24, resizeMode: 'contain'},

  scrollView: {flex: 1, paddingHorizontal: 20, paddingTop: 20},

  infoCard: {
    backgroundColor: '#F6F9FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#C2D3FF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 8,
  },
  infoTextBold: {
    fontSize: 14,
    color: '#d32f2f',
    fontWeight: '600',
    lineHeight: 20,
  },

  riskStatusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  safeBadge: {
    backgroundColor: '#d4edda',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  safeText: {
    color: '#155724',
    fontWeight: '600',
  },

  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {fontSize: 14, color: '#777', marginBottom: 20},

  // Risk Card Styles
  riskCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  riskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  riskIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  iconContainer: {
    padding: 5,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#C2D3FF',
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  riskLevelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  arrowIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    marginLeft: 6,
  },

  riskLevelAverage: {fontSize: 15, color: '#666'},
  riskLevelModerate: {
    fontSize: 15,
    color: '#FF8C00',
    fontWeight: '600',
  },
  riskLevelHigh: {
    fontSize: 15,
    color: '#DC143C',
    fontWeight: '600',
  },
  riskLevelSafe: {
    fontSize: 15,
    color: '#28A745',
    fontWeight: '600',
  },

  causeLabel: {fontWeight: '600', color: '#000', marginBottom: 4},
  causeText: {fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 12},
  tipLabel: {fontWeight: '600', color: '#000', marginBottom: 8},

  tipBadgeAverage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tipBadgeModerate: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff3cd',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  tipBadgeHigh: {
    alignSelf: 'flex-start',
    backgroundColor: '#f8d7da',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f5c6cb',
  },
  tipBadgeSafe: {
    alignSelf: 'flex-start',
    backgroundColor: '#d4edda',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#c3e6cb',
  },

  tipText: {
    color: '#2d3748',
    fontSize: 14,
  },
  tipTextHigh: {
    color: '#721c24',
    fontSize: 14,
  },
  tipTextSafe: {
    color: '#155724',
    fontSize: 14,
  },

  tipsContainer: {
    backgroundColor: '#F6F9FF',
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#C2D3FF',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tipIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
    marginTop: 2,
  },
  tipItemText: {
    flex: 1,
    marginLeft: 14,
    fontSize: 14,
    color: '#616161',
    lineHeight: 20,
  },
});
