import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import {appImages, HP, WP} from '../../../utilities';

const SettingsScreen = () => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={styles.profileContainer}>
        <Image source={appImages.messi} style={styles.avatar} />
        <Text style={styles.name}>Jenna Ortega</Text>
        <Text style={styles.email}>jennaortega@gmail.com</Text>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.card}>
          <SettingsItem title="Edit Profile" />
          <SettingsItem title="User Preferences" />
        </View>

        <View style={styles.card}>
          <SettingsItem title="Security" subtitle="Change password" />
        </View>

        <View style={styles.card}>
          <SettingsItem title="Contact us" />
          <SettingsItem title="Help & Support" />
          <SettingsItem title="Privacy policy" />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutText}>⟵ Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const SettingsItem = ({title, subtitle}) => (
  <TouchableOpacity style={styles.item}>
    <View>
      <Text style={styles.itemTitle}>{title}</Text>
      {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
    </View>
    <Text style={styles.chevron}>›</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  scrollContent: {
    paddingBottom: HP(6),
  },
  header: {
    backgroundColor: '#4252FF',
    height: HP(22),
    borderBottomLeftRadius: 120,
    borderBottomRightRadius: 120,
    justifyContent: 'flex-start',
    paddingTop: HP(6),
    paddingHorizontal: WP(4),
  },
  backButton: {
    position: 'absolute',
    left: WP(4),
    top: HP(6),
  },
  backIcon: {
    fontSize: WP(6),
    color: '#fff',
  },
  headerTitle: {
    color: '#fff',
    fontSize: WP(5.5),
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: -HP(7),
    marginBottom: HP(2),
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#eee',
  },
  name: {
    fontSize: WP(5),
    fontWeight: 'bold',
    color: '#000',
    marginTop: HP(1),
  },
  email: {
    fontSize: WP(4),
    color: '#777',
    marginTop: HP(0.5),
  },
  contentContainer: {
    padding: WP(5),
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: HP(1),
    paddingHorizontal: WP(4),
    marginBottom: HP(2),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: HP(2),
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  itemTitle: {
    fontSize: WP(4.2),
    fontWeight: '500',
    color: '#000',
  },
  itemSubtitle: {
    fontSize: WP(3.5),
    color: '#999',
    marginTop: 2,
  },
  chevron: {
    fontSize: WP(5),
    color: '#ccc',
  },
  logoutButton: {
    backgroundColor: '#DB4A39',
    paddingVertical: HP(2.2),
    borderRadius: WP(3),
    alignItems: 'center',
    marginTop: HP(1),
  },
  logoutText: {
    color: '#fff',
    fontSize: WP(4.5),
    fontWeight: '600',
  },
});

export default SettingsScreen;
