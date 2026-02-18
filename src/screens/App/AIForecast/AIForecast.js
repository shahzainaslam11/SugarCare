import React, {useEffect, useMemo} from 'react';
import {View, Text, ScrollView, Image, ActivityIndicator} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {Header} from '../../../components';
import {appIcons, colors} from '../../../utilities';
import styles from './styles';
import {fetchRiskForecast} from '../../../redux/slices/riskForecastSlice';
import {SafeAreaView} from 'react-native-safe-area-context';

/* --------------------------------------------------
   Reusable RiskCard Component
-------------------------------------------------- */
const RiskCard = ({risk}) => {
  const {title, icon, riskLevel, riskPercentage, change, statusLabel} = risk;

  const getRiskStyles = () => {
    switch (riskLevel) {
      case 'High':
        return {
          riskText: styles.riskLevelHigh,
          arrowIcon: appIcons.arrowUp,
          arrowTint: '#DC143C',
          badge: styles.tipBadgeHigh,
          badgeText: styles.tipTextHigh,
        };
      case 'Safe':
        return {
          riskText: styles.riskLevelSafe,
          arrowIcon: appIcons.arrowDown,
          arrowTint: '#28A745',
          badge: styles.tipBadgeSafe,
          badgeText: styles.tipTextSafe,
        };
      case 'Moderate':
        return {
          riskText: styles.riskLevelModerate,
          arrowIcon: appIcons.arrowUp,
          arrowTint: '#FFA500',
          badge: styles.tipBadgeModerate,
          badgeText: styles.tipText,
        };
      default:
        return {
          riskText: styles.riskLevelAverage,
          arrowIcon: null,
          badge: styles.tipBadgeAverage,
          badgeText: styles.tipText,
        };
    }
  };

  const riskStyles = getRiskStyles();

  return (
    <View style={styles.riskCard}>
      {/* Header */}
      <View style={styles.riskHeader}>
        <Text style={styles.riskTitle}>{title}</Text>
        <View style={styles.iconContainer}>
          <Image source={icon} style={styles.riskIcon} />
        </View>
      </View>

      {/* Risk Level */}
      <View style={styles.riskLevelContainer}>
        <Text style={riskStyles.riskText}>
          {riskLevel} ({riskPercentage})
        </Text>
        {riskStyles.arrowIcon && (
          <Image
            source={riskStyles.arrowIcon}
            style={[styles.arrowIcon, {tintColor: riskStyles.arrowTint}]}
          />
        )}
      </View>

      {/* Change */}
      <Text style={styles.causeLabel}>Change:</Text>
      <Text style={styles.causeText}>{change}</Text>

      {/* Status Badge */}
      <Text style={styles.tipLabel}>Status:</Text>
      <View style={riskStyles.badge}>
        <Text style={riskStyles.badgeText}>{statusLabel}</Text>
      </View>
    </View>
  );
};

/* --------------------------------------------------
   Main Screen
-------------------------------------------------- */
export default function AIRiskForecasting({navigation}) {
  const dispatch = useDispatch();
  const {accessToken, user} = useSelector(state => state.auth);

  // ✅ Crash-proof selectors
  const overallRiskStatus = useSelector(
    state => state.riskForecast?.overallStatus ?? null,
  );
  const risks = useSelector(state => state.riskForecast?.risks ?? []);
  const loading = useSelector(state => state.riskForecast?.loading ?? false);

  useEffect(() => {
    if (accessToken && user?.id) {
      dispatch(fetchRiskForecast({token: accessToken, user_id: user.id}));
    }
  }, [accessToken, user?.id, dispatch]);

  /* --------------------------------------------------
     Icon Resolver (Fixes heart icon everywhere issue)
  -------------------------------------------------- */
  const getRiskIcon = name => {
    if (!name) return appIcons.heart;

    const key = name.toLowerCase();

    if (key.includes('nerve')) return appIcons.nerve;
    if (key.includes('kidney')) return appIcons.kidney;
    if (key.includes('eye')) return appIcons.eye;
    if (key.includes('cardio') || key.includes('heart')) return appIcons.heart;
    if (key.includes('foot')) return appIcons.foot;

    return appIcons.heart;
  };

  /* --------------------------------------------------
     API → UI Mapping
  -------------------------------------------------- */
  const mappedRisks = useMemo(() => {
    return risks.map((item, index) => ({
      id: index + 1,
      title: item?.name || 'Health Risk',
      icon: getRiskIcon(item?.name),
      riskLevel: item?.status || 'Average',
      riskPercentage: `${item?.risk_score ?? '--'}%`,
      change: item?.risk_change || '--',
      statusLabel: item?.safe_label || 'Stable',
      trend: item?.trend || [],
      predictedRiskLevel: item?.predicted_risk_level || 'low',
    }));
  }, [risks]);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="AI Risk Forecasting" onPress={() => navigation.goBack()} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>What is AI Risk Forecasting?</Text>
          <Text style={styles.infoText}>
            Our AI analyzes your logged blood sugar trends, fasting routine, and
            eating habits to predict potential health risks and offer tailored
            recommendations.
          </Text>
          <Text style={styles.infoTextBold}>
            These are predictions, not a substitute for medical advice.
          </Text>
        </View>

        {/* Overall Risk Status */}
        {overallRiskStatus && (
          <View style={styles.riskStatusCard}>
            <Text style={styles.sectionTitle}>Overall Risk Status</Text>
            <View style={[styles.safeBadge, {backgroundColor: colors.primary}]}>
              <Text style={styles.safeText}>{overallRiskStatus.label}</Text>
            </View>
          </View>
        )}

        {/* Risk Predictions */}
        <Text style={styles.sectionHeader}>Risk Predictions</Text>
        <Text style={styles.subtitle}>
          Next 8–12 weeks (based on your last 30–60 days of data)
        </Text>

        {/* Loading */}
        {loading && (
          <ActivityIndicator size="large" style={{marginVertical: 20}} />
        )}

        {/* Empty */}
        {!loading && mappedRisks.length === 0 && (
          <Text style={styles.noDataText}>No risk data available yet.</Text>
        )}

        {/* Render API Risks */}
        {mappedRisks.map(risk => (
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
