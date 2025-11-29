import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {appIcons, colors, family, HP, WP, size} from '../../../utilities';

const Notifications = ({navigation}) => {
  const [activeTab, setActiveTab] = useState('insights'); // 'all' or 'insights'

  const notifications = {
    today: [
      {
        id: 1,
        title: 'Stay Hydrated!',
        message: "Don't forget to hydrate after your meal.",
        time: 'Just Now',
        isNew: true,
      },
      {
        id: 2,
        title: 'Take a Break!',
        message: 'Step away from your screen for a few minutes.',
        time: '1 Hour Ago',
        isNew: false,
      },
    ],
    yesterday: [
      {
        id: 3,
        title: 'Plan Your Day!',
        message: 'Setting goals can help you stay focused and productive.',
        time: '12:00 AM',
        isNew: false,
      },
      {
        id: 4,
        title: 'Morning Stretch!',
        message: 'A quick stretch can boost your energy for the day.',
        time: '02:45 PM',
        isNew: false,
      },
    ],
  };

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
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
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
          <View style={styles.badge}>
            <Text style={styles.badgeText}>12</Text>
          </View>
          {activeTab === 'insights' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 20}}>
        {/* Today */}
        <Text style={styles.sectionTitle}>Today</Text>
        {notifications.today.map(item => (
          <View key={item.id} style={styles.notificationCard}>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardMessage}>{item.message}</Text>
            </View>
            <View style={styles.cardRight}>
              <Text style={styles.cardTime}>{item.time}</Text>
              {item.isNew && <View style={styles.newDot} />}
            </View>
          </View>
        ))}

        {/* Yesterday */}
        <Text style={styles.sectionTitle}>Yesterday</Text>
        {notifications.yesterday.map(item => (
          <View key={item.id} style={styles.notificationCard}>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardMessage}>{item.message}</Text>
            </View>
            <View style={styles.cardRight}>
              <Text style={styles.cardTime}>{item.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: WP(4),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#2c3e50',
  },
  headerTitle: {
    fontSize: size.large,
    fontWeight: '600',
    color: '#2c3e50',
    fontFamily: family.inter_medium,
  },
  settingsIcon: {
    width: WP(6),
    height: HP(5),
    tintColor: '#2c3e50',
  },

  // Tab Switcher
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F4F5F7FF',
    // marginHorizontal: 20,
    marginVertical: HP(2),
    borderRadius: 25,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: HP(1),
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: colors.p1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  tabText: {
    fontSize: size.small,
    fontFamily: family.inter_medium,
    color: '#95a5a6',
    // fontWeight: '500',
  },
  activeTabText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: size.small,
    fontFamily: family.inter_medium,
  },
  badge: {
    backgroundColor: colors.p1,
    minWidth: WP(4),
    height: HP(2),
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: WP(1.5),
  },
  badgeText: {
    color: '#fff',
    fontSize: size.xtiny,
    fontFamily: family.inter_medium,
    fontWeight: 'bold',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },

  // ScrollView & Sections
  scrollView: {
    flex: 1,
    marginTop: HP(1),
  },
  sectionTitle: {
    fontSize: size.medium,
    family: family.inter_medium,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
    marginTop: 20,
  },
  notificationCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardContent: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  cardMessage: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  cardTime: {
    fontSize: 12,
    color: '#95a5a6',
    marginBottom: 4,
  },
  newDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.p1 || '#007AFF',
  },
});

export default Notifications;
