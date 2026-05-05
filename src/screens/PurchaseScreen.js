import React, {useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {showError, colors} from '../utilities';
import styles from './PurchaseScreen.styles';
import {useScanCredits} from '../context/ScanCreditsContext';
import {useIapManager} from '../context/IAPContext';
import PlanCard from '../components/Purchase/PlanCard';
import {Header} from '../components';
import {FOOD_SCAN_PLANS} from '../constants/iapProducts';

const PurchaseScreen = () => {
  const navigation = useNavigation();
  const [selectedPlanId, setSelectedPlanId] = useState(FOOD_SCAN_PLANS[0].id);
  const {scanCount} = useScanCredits();
  const {
    connected,
    products,
    isBootstrapping,
    isProcessing,
    isRestoring,
    purchasePlan,
    restorePurchases,
    setAfterSuccessfulPurchase,
  } = useIapManager();

  useEffect(() => {
    setAfterSuccessfulPurchase(() => {
      navigation.goBack();
    });
    return () => setAfterSuccessfulPurchase(null);
  }, [navigation, setAfterSuccessfulPurchase]);

  const plansWithPrices = useMemo(
    () =>
      FOOD_SCAN_PLANS.map(plan => {
        const product = products?.find(
          item => item.id === plan.id || item.productId === plan.id,
        );
        return {
          ...plan,
          price: product?.displayPrice || product?.localizedPrice || 'Unavailable',
          storeProductId: product?.productId || product?.id,
        };
      }),
    [products],
  );

  const selectedPlan = plansWithPrices.find(plan => plan.id === selectedPlanId);

  const handleBuyNow = async () => {
    if (!connected) {
      showError('Store unavailable. Please try again later.');
      return;
    }
    if (!selectedPlan) {
      showError('Please select a plan.');
      return;
    }

    const sku = selectedPlan.storeProductId || selectedPlan.id;
    await purchasePlan(sku);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerWrap}>
        <Header title="Upgrade Plans" onPress={() => navigation.goBack()} isBack />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <LinearGradient
          colors={[colors.p1, '#5564E8']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.heroCard}>
          <Text style={styles.title}>Upgrade Your Food Scans</Text>
          <Text style={styles.subtitle}>Analyze meals instantly</Text>
          <View style={styles.creditPill}>
            <Text style={styles.creditPillLabel}>Available scans</Text>
            <Text style={styles.creditPillValue}>{scanCount}</Text>
          </View>
        </LinearGradient>

        {isBootstrapping ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.p1} />
            <Text style={styles.loaderText}>Loading plans...</Text>
          </View>
        ) : (
          <View style={styles.plansList}>
            {plansWithPrices.map(plan => (
              <PlanCard
                key={plan.id}
                plan={plan}
                selected={selectedPlanId === plan.id}
                onPress={selected => setSelectedPlanId(selected.id)}
              />
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[styles.buyButton, isProcessing && styles.buyButtonDisabled]}
          disabled={
            isProcessing ||
            isBootstrapping ||
            !selectedPlan?.storeProductId ||
            selectedPlan?.price === 'Unavailable'
          }
          onPress={handleBuyNow}>
          {isProcessing ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buyButtonText}>Buy {selectedPlan?.title || 'Plan'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.restoreButton, isRestoring && styles.restoreButtonDisabled]}
          disabled={isRestoring}
          onPress={restorePurchases}>
          {isRestoring ? (
            <ActivityIndicator color={colors.p1} />
          ) : (
            <Text style={styles.restoreText}>Restore Purchases</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PurchaseScreen;
