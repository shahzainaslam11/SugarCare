import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Alert,
  AppState,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {ChartComponent, MenuModal} from '../../../components';
import {fetchProfile} from '../../../redux/slices/profileSlice';
import {appIcons} from '../../../utilities';
import styles from './styles';
import {fetchSugarRecords} from '../../../redux/slices/sugarForecastSlice';

const RANGE_MAP = {
  Today: 'Today',
  '1W': 'OneWeek',
  '1M': 'OneMonth',
  'All Time': 'AllTime',
};

export default function Home() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {accessToken, user} = useSelector(state => state.auth);
  const {sugarRecords, loading} = useSelector(state => state.home);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const {data: profile} = useSelector(state => state.profile);
  const [activeRange, setActiveRange] = useState('Today');
  const appState = useRef(AppState.currentState);

  const {
    graphData: sugarGraphData,
    stats: sugarStats,
    loading: sugarLoading,
    error: sugarError,
  } = useSelector(state => state.sugarForecast);
  const chartData = sugarGraphData?.[RANGE_MAP[activeRange]] || {};

  // Function to show session expired message
  const showSessionExpired = () => {
    Alert.alert(
      'Session Expired',
      'Your session has expired. Please login again.',
      [
        {
          text: 'Login',
          onPress: () => {
            // Navigate to login screen
            // Adjust based on your navigation structure
            navigation.reset({
              index: 0,
              routes: [{name: 'Auth'}],
            });
          },
        },
      ],
    );
  };

  // Function to check token validity
  const checkTokenValidity = () => {
    if (!accessToken) {
      showSessionExpired();
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

  // Initial token check on mount
  useEffect(() => {
    checkTokenValidity();
  }, []);

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

  // Handle API error responses
  useEffect(() => {
    if (
      sugarError?.status === 401 ||
      sugarError?.message?.includes('token') ||
      sugarError?.message?.includes('unauthorized') ||
      sugarError?.message?.includes('expired')
    ) {
      showSessionExpired();
    }
  }, [sugarError]);

  // You can also add periodic token check (optional)
  useEffect(() => {
    const interval = setInterval(() => {
      checkTokenValidity();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [accessToken]);

  const toggleMenu = () => {
    if (!checkTokenValidity()) return;
    setIsMenuVisible(!isMenuVisible);
  };

  // Handle navigation with token check
  const handleNavigation = screenName => {
    if (!checkTokenValidity()) return;
    navigation.navigate('AppScreens', {screen: screenName});
  };

  // If token is null, show redirecting screen
  if (!accessToken) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View
          style={[
            styles.container,
            {justifyContent: 'center', alignItems: 'center'},
          ]}>
          <Text>Session expired. Redirecting to login...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={toggleMenu} style={styles.iconButton}>
            <Text style={styles.icon}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{profile?.name}</Text>
        </View>
        <TouchableOpacity
          onPress={() => handleNavigation('Notification')}
          style={styles.iconButton}>
          <Text style={styles.icon}>🔔</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        <ChartComponent
          activeRange={activeRange}
          onChangeRange={setActiveRange}
          chart={chartData}
        />

        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            onPress={() => handleNavigation('NewSugarRecord')}
            style={styles.actionButton}>
            <Image
              source={appIcons.trackSugar}
              style={styles.actionIcon}
              resizeMode="contain"
            />
            <Text style={styles.actionText}>Add Sugar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              if (!checkTokenValidity()) return;
              navigation.navigate('Scan');
            }}
            style={styles.actionButton}>
            <Image
              source={appIcons.activeScan}
              style={styles.actionIcon}
              resizeMode="contain"
            />
            <Text style={styles.actionText}>Scan Food</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleNavigation('ChatScreen')}
            style={styles.actionButton}>
            <Image
              source={appIcons.aiIcon}
              style={styles.actionIcon}
              resizeMode="contain"
            />
            <Text style={styles.actionText}>Ask AI</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.spikeCard}>
          <View style={styles.spikeHeader}>
            <Text style={styles.spikeTitle}>Blood Sugar Spike Expected</Text>
            <Image
              source={appIcons.spike}
              style={styles.spikeIcon}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.spikeDescription}>
            Based on your recent activity, your sugar may spike in next 2hrs
          </Text>
          <TouchableOpacity
            onPress={() => handleNavigation('PredictInputs')}
            style={styles.seeSuggestionsButton}>
            <Text style={styles.seeSuggestionsText}>See AI suggestions</Text>
            <Image
              source={appIcons.forwardArrow}
              style={styles.arrowIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* AI Risk Forecasting */}
        <View style={styles.riskCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>AI Risk Forecasting</Text>
            <Image
              source={appIcons.aistars}
              style={styles.sparklesIcon}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.lastChecked}>Last Checked: 1 month ago</Text>
          <View style={styles.riskLevelContainer}>
            <Text style={styles.riskLabel}>Risk Status</Text>
            <View style={styles.safeBadge}>
              <Text style={styles.safeText}>Safe</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => handleNavigation('AIForecast')}
            style={styles.seeDetailButton}>
            <Text style={styles.seeDetailText}>See in detail</Text>
            <Image
              source={appIcons.forwardArrow}
              style={styles.arrowIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Suggested Meal */}
        <View style={styles.mealCard}>
          <View style={styles.mealHeader}>
            <Text style={styles.mealTitle}>Suggested Meal</Text>
            <TouchableOpacity onPress={() => handleNavigation('WhatToEat')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mealContent}>
            <Image
              source={appIcons.bowl}
              style={styles.mealImage}
              resizeMode="contain"
            />
            <View style={styles.mealDetails}>
              <Text style={styles.mealName}>
                Quinoa Salad with Chickpeas and Avocado
              </Text>
              <Text style={styles.mealDesc}>
                Rich in omega-3 and low glycemic index suitable for your current
                levels.
              </Text>
            </View>
          </View>
          <View style={styles.nutritionRow}>
            <View style={styles.nutritionBadge}>
              <Text style={[styles.nutritionText, {color: '#E55C13FF'}]}>
                8g Carbs
              </Text>
            </View>
            <View style={styles.nutritionBadgeProtein}>
              <Text style={styles.nutritionText}>27g Protein</Text>
            </View>
            <View style={styles.nutritionBadgeFiber}>
              <Text style={[styles.nutritionText, {color: '#027A48'}]}>
                10g Fiber
              </Text>
            </View>
          </View>
        </View>
        <MenuModal
          updatedName={profile?.name}
          visible={isMenuVisible}
          onClose={() => setIsMenuVisible(false)}
          navigation={navigation}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
