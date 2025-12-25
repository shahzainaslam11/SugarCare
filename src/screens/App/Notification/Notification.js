import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {
  fetchNotifications,
  markNotificationRead,
} from '../../../redux/slices/notificationSlice';
import {appIcons, colors} from '../../../utilities';
import styles from './styles';
import {SmallLoader} from '../../../components';

const Notifications = ({navigation}) => {
  const [activeTab, setActiveTab] = useState('all'); // all | insights
  const [refreshing, setRefreshing] = useState(false);

  const dispatch = useDispatch();
  const {items, loading} = useSelector(state => state.notifications);
  const {accessToken, user} = useSelector(state => state.auth);
  console.log('items---->', items);

  const user_id = user?.id;
  const token = accessToken;

  // Fetch data whenever screen opens or tab changes
  useEffect(() => {
    if (user_id && token) {
      dispatch(fetchNotifications({user_id, token, type_filter: activeTab}));
    }
  }, [activeTab]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(
      fetchNotifications({user_id, token, type_filter: activeTab}),
    ).finally(() => setRefreshing(false));
  }, [dispatch, user_id, token, activeTab]);

  // Correct API structure:
  const notifications = {
    Today: items?.Today || [],
    Yesterday: items?.Yesterday || [],
    'Last Week': items?.['Last Week'] || [],
    Older: items?.Older || [],
  };

  // Badge count from response
  const unreadCount = useSelector(
    state => state.notifications.items?.unread_count || 0,
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={appIcons.back_Arrow}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications Center</Text>
        <TouchableOpacity onPress={() => Alert.alert('Coming Soon!')}>
          <Image
            source={appIcons.setting}
            style={styles.settingsIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'all' && styles.activeTabText,
            ]}>
            All Notifications
          </Text>

          {activeTab === 'all' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'insights' && styles.activeTab]}
          onPress={() => setActiveTab('insights')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'insights' && styles.activeTabText,
            ]}>
            Smart Insights
          </Text>

          {/* 🔥 Live badge */}
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}

          {activeTab === 'insights' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </View>

      {loading && <SmallLoader height={100} width={'100%'} />}

      {!loading && (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{paddingBottom: 20}}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          {Object.keys(notifications).map(section => {
            const list = notifications[section];
            if (list.length === 0) return null;
            return (
              <View key={section}>
                <Text style={styles.sectionTitle}>{section}</Text>

                {list.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.notificationCard}
                    onPress={() =>
                      !item.is_read &&
                      dispatch(
                        markNotificationRead({
                          notification_id: item.id,
                          user_id,
                          token,
                        }),
                      )
                    }>
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      <Text style={styles.cardMessage}>{item.detail}</Text>
                    </View>
                    <View style={styles.cardRight}>
                      <Text style={styles.cardTime}>{item.time_ago}</Text>
                      {!item.is_read && <View style={styles.newDot} />}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default Notifications;
