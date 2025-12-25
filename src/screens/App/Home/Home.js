import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {ChartComponent, MenuModal} from '../../../components';
import {fetchSugarRecords} from '../../../redux/slices/homeSlice';
import {fetchProfile} from '../../../redux/slices/profileSlice';
import {appIcons} from '../../../utilities';
import styles from './styles';

export default function Home() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {accessToken, user} = useSelector(state => state.auth);
  const {sugarRecords, loading} = useSelector(state => state.home);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const {data: profile} = useSelector(state => state.profile);

  console.log('profile---->', JSON.stringify(profile?.id));

  const toggleMenu = () => {
    setIsMenuVisible(!isMenuVisible);
  };
  useEffect(() => {
    if (user?.id && accessToken) {
      dispatch(fetchSugarRecords({user_id: user?.id, token: accessToken}));
      dispatch(fetchProfile({token: accessToken}));
    }
  }, [dispatch, user, accessToken]);

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
          onPress={() =>
            navigation.navigate('AppScreens', {screen: 'Notification'})
          }
          style={styles.iconButton}>
          <Text style={styles.icon}>🔔</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        <ChartComponent loading={loading} sugarData={sugarRecords} />

        <View style={styles.actionButtonsRow}>
          <TouchableOpacity style={styles.actionButton}>
            <Image
              source={appIcons.trackSugar}
              style={styles.actionIcon}
              resizeMode="contain"
            />
            <Text style={styles.actionText}>Add Sugar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Image
              source={appIcons.activeScan}
              style={styles.actionIcon}
              resizeMode="contain"
            />
            <Text style={styles.actionText}>Scan Food</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
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
          <TouchableOpacity style={styles.seeSuggestionsButton}>
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
          <TouchableOpacity style={styles.seeDetailButton}>
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
            <TouchableOpacity>
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
