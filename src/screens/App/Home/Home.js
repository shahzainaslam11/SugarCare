import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  AppState,
  Platform,
  StyleSheet,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import {ChartComponent} from '../../../components';
import {fetchProfile} from '../../../redux/slices/profileSlice';
import {fetchNotifications} from '../../../redux/slices/notificationSlice';
import {appIcons, colors, size, HP, WP} from '../../../utilities';
import styles from './styles';
import {fetchSugarRecords} from '../../../redux/slices/sugarForecastSlice';

const RANGE_MAP = {
  Today: 'Today',
  '1W': 'OneWeek',
  '1M': 'OneMonth',
  'All Time': 'AllTime',
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export default function Home() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {accessToken, user} = useSelector(state => state.auth);
  const {sugarRecords, loading} = useSelector(state => state.home);
  const {data: profile} = useSelector(state => state.profile);
  const [activeRange, setActiveRange] = useState('Today');
  const appState = useRef(AppState.currentState);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const {
    graphData: sugarGraphData,
    stats: sugarStats,
    loading: sugarLoading,
    error: sugarError,
  } = useSelector(state => state.sugarForecast);
  const unreadCount = useSelector(
    state => state.notifications?.items?.unread_count || 0,
  );
  const chartData = sugarGraphData?.[RANGE_MAP[activeRange]] || {};

  // Function to redirect to login screen
  const redirectToLogin = () => {
    navigation.reset({
      index: 0,
      routes: [{name: 'Auth'}],
    });
  };

  // Function to check token validity
  const checkTokenValidity = () => {
    if (!accessToken) {
      redirectToLogin();
      return false;
    }
    return true;
  };

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App came to foreground - check token
        checkTokenValidity();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [accessToken]);

  // Initial token check on mount - redirect immediately if no token
  useEffect(() => {
    if (!accessToken) {
      redirectToLogin();
    }
  }, [accessToken]);

  // Check token before API calls
  useEffect(() => {
    if (user?.id && accessToken) {
      if (!checkTokenValidity()) return;

      dispatch(
        fetchSugarRecords({
          user_id: user.id,
          time_range: RANGE_MAP[activeRange],
          token: accessToken,
        }),
      );

      dispatch(fetchProfile({token: accessToken}));
    }
  }, [dispatch, user, accessToken, activeRange]);

  // Fetch notifications when Home is focused (for unread badge on bell icon)
  useFocusEffect(
    React.useCallback(() => {
      if (user?.id && accessToken) {
        dispatch(
          fetchNotifications({
            user_id: user.id,
            token: accessToken,
            type_filter: 'all',
          }),
        );
      }
    }, [dispatch, user?.id, accessToken]),
  );

  // Handle API error responses
  useEffect(() => {
    if (
      sugarError?.status === 401 ||
      sugarError?.message?.includes('token') ||
      sugarError?.message?.includes('unauthorized') ||
      sugarError?.message?.includes('expired')
    ) {
      redirectToLogin();
    }
  }, [sugarError]);

  // You can also add periodic token check (optional)
  useEffect(() => {
    const interval = setInterval(() => {
      checkTokenValidity();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [accessToken]);

  const openDrawer = () => {
    if (!checkTokenValidity()) return;
    let nav = navigation;
    while (nav && typeof nav.openDrawer !== 'function') {
      nav = nav.getParent?.();
    }
    nav?.openDrawer?.();
  };

  const handleNavigation = screenName => {
    if (!checkTokenValidity()) return;
    navigation.navigate(screenName);
  };

  // If token is null, don't render anything or return null
  // The useEffect will handle the redirect immediately
  if (!accessToken) {
    return null; // Or you can return a minimal loading view if needed
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'top']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Platform.OS === 'android' ? colors.white : colors.g13}
      />
      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={[colors.white, colors.white]}
          style={StyleSheet.absoluteFill}
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}
        />
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              onPress={openDrawer}
              style={styles.iconButton}
              activeOpacity={0.7}>
              <View style={styles.menuIconWrap}>
                <Ionicons name="menu" size={size.h6} color={colors.white} />
              </View>
            </TouchableOpacity>
            <View style={styles.greetingBlock}>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                {profile?.name || 'User'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => handleNavigation('Notification')}
            style={styles.iconButton}
            activeOpacity={0.7}>
            <View style={styles.bellIconWrap}>
              {Platform.OS === 'ios' ? (
                <Ionicons
                  name="notifications-outline"
                  size={size.h6}
                  color={colors.white}
                />
              ) : (
                <Image
                  source={appIcons.bellIcon}
                  style={styles.bellIcon}
                  resizeMode="contain"
                />
              )}
              {unreadCount > 0 && (
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <ChartComponent
          title="Blood Sugar Overview"
          activeRange={activeRange}
          onChangeRange={setActiveRange}
          chart={chartData}
        />

        <Text style={[styles.sectionLabel, styles.sectionLabelFirst]}>
          Quick actions
        </Text>
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            onPress={() => handleNavigation('NewSugarRecord')}
            style={styles.actionButton}
            activeOpacity={0.85}>
            <View style={styles.actionIconWrap}>
              <Image
                source={appIcons.trackSugar}
                style={styles.actionIcon}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.actionText}>Add Sugar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              if (!checkTokenValidity()) return;
              navigation.navigate('Scan');
            }}
            style={styles.actionButton}
            activeOpacity={0.85}>
            <View style={styles.actionIconWrap}>
              <Image
                source={appIcons.activeScan}
                style={styles.actionIcon}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.actionText}>Scan Food</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleNavigation('ChatScreen')}
            style={styles.actionButton}
            activeOpacity={0.85}>
            <View style={styles.actionIconWrap}>
              <Image
                source={appIcons.aiIcon}
                style={styles.actionIcon}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.actionText}>Ask AI</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Alerts & insights</Text>
        <TouchableOpacity
          onPress={() => handleNavigation('PredictInputs')}
          style={styles.spikeCard}
          activeOpacity={0.9}>
          <LinearGradient
            colors={[colors.warning, colors.s4]}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            style={styles.spikeAccent}
          />
          <View style={styles.spikeContent}>
            <View style={styles.spikeHeader}>
              <Image
                source={appIcons.spike}
                style={styles.spikeIcon}
                resizeMode="contain"
              />
              <Text style={styles.spikeTitle}>Spike Alert</Text>
            </View>
            <Text style={styles.spikeDescription}>
              Sugar may spike in next 2hrs — See AI suggestions
            </Text>
            <View style={styles.spikeCta}>
              <Text style={styles.spikeCtaText}>View suggestions</Text>
              <Ionicons
                name="chevron-forward"
                size={size.normal}
                color={colors.p1}
                style={styles.ctaChevron}
              />
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleNavigation('AIForecast')}
          style={styles.riskCard}
          activeOpacity={0.9}>
          <LinearGradient
            colors={[colors.p1, colors.p9]}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            style={styles.riskAccent}
          />
          <View style={styles.riskContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>AI Risk Forecasting</Text>
              <Image
                source={appIcons.aistars}
                style={styles.sparklesIcon}
                resizeMode="contain"
              />
            </View>
            <View style={styles.riskRow}>
              <Text style={styles.lastChecked}>Last checked: 1 month ago</Text>
              <View style={styles.safeBadge}>
                <Text style={styles.safeText}>Safe</Text>
              </View>
            </View>
            <View style={styles.spikeCta}>
              <Text style={styles.spikeCtaText}>See in detail</Text>
              <Ionicons
                name="chevron-forward"
                size={size.normal}
                color={colors.p1}
                style={styles.ctaChevron}
              />
            </View>
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>For you</Text>
        <View style={styles.mealCard}>
          <LinearGradient
            colors={[colors.lightGreen, colors.green]}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            style={styles.mealAccent}
          />
          <View style={styles.mealContent}>
            <View style={styles.mealHeader}>
              <Text style={styles.mealTitle}>Suggested Meal</Text>
              <TouchableOpacity
                onPress={() => handleNavigation('WhatToEat')}
                hitSlop={{
                  top: HP(1),
                  bottom: HP(1),
                  left: WP(2),
                  right: WP(2),
                }}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.mealRow}>
              <Image
                source={appIcons.bowl}
                style={styles.mealImage}
                resizeMode="contain"
              />
              <View style={styles.mealDetails}>
                <Text style={styles.mealName} numberOfLines={2}>
                  Quinoa Salad with Chickpeas and Avocado
                </Text>
                <Text style={styles.mealDesc} numberOfLines={2}>
                  Low glycemic, rich in omega-3
                </Text>
                <View style={styles.nutritionRow}>
                  <View
                    style={[styles.nutritionBadge, styles.nutritionBadgeCarbs]}>
                    <Text style={styles.nutritionText}>8g Carbs</Text>
                  </View>
                  <View
                    style={[
                      styles.nutritionBadge,
                      styles.nutritionBadgeProtein,
                    ]}>
                    <Text style={styles.nutritionText}>27g Protein</Text>
                  </View>
                  <View
                    style={[styles.nutritionBadge, styles.nutritionBadgeFiber]}>
                    <Text style={styles.nutritionText}>10g Fiber</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
