import React, {useEffect, useState, useCallback} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import notifee from '@notifee/react-native';
import {
  fetchNotifications,
  markNotificationRead,
} from '../../../redux/slices/notificationSlice';
import {appIcons} from '../../../utilities';
import styles from './styles';
import {SmallLoader} from '../../../components';

const Notifications = ({navigation}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Clear app icon badge when user views the Notifications screen
  useFocusEffect(
    useCallback(() => {
      notifee.setBadgeCount(0).catch(() => {});
    }, []),
  );

  const dispatch = useDispatch();
  const {items, loading, markLoading} = useSelector(state => state.notifications);
  const {accessToken, user} = useSelector(state => state.auth);

  const user_id = user?.id;
  const token = accessToken;

  // =======================
  // Fetch Notifications
  // =======================
  useEffect(() => {
    if (user_id && token) {
      dispatch(fetchNotifications({user_id, token, type_filter: activeTab}));
    }
  }, [activeTab, user_id, token, dispatch]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(
      fetchNotifications({user_id, token, type_filter: activeTab}),
    ).finally(() => setRefreshing(false));
  }, [dispatch, user_id, token, activeTab]);

  // =======================
  // Sections from API
  // =======================
  const notifications = {
    Today: items?.Today || [],
    Yesterday: items?.Yesterday || [],
    'Last Week': items?.['Last Week'] || [],
    Older: items?.Older || [],
  };

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
       <View />
      </View>

      {/* Tabs */}
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

          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}

          {activeTab === 'insights' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </View>

      {/* Loader only for fetch */}
      {loading && <SmallLoader height={100} width="100%" />}

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
            if (!list?.length) return null;

            return (
              <View key={section}>
                <Text style={styles.sectionTitle}>{section}</Text>

                {list.map(item => {
                  // Optimistically mark as read in UI immediately
                  const isMarkingRead = markLoading && !item.is_read;
                  
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.notificationCard}
                      onPress={() => {
                        if (!item.is_read && !isMarkingRead && user_id && token) {
                          // Mark as read - state will update optimistically, no need to refresh
                          dispatch(
                            markNotificationRead({
                              notification_id: item.id,
                              user_id,
                              token,
                            }),
                          );
                        }
                      }}
                      disabled={isMarkingRead}>
                      <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <Text style={styles.cardMessage}>{item.detail}</Text>
                      </View>

                      <View style={styles.cardRight}>
                        <Text style={styles.cardTime}>{item.time_ago}</Text>
                        {!item.is_read && !isMarkingRead && <View style={styles.newDot} />}
                        {isMarkingRead && (
                          <ActivityIndicator size="small" color="#007AFF" />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default Notifications;
