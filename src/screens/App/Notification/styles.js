import {StyleSheet} from 'react-native';
import {colors, family, HP, size, WP} from '../../../utilities';

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
    width: WP(6),
    height: HP(5),
  },
  headerTitle: {
    fontSize: size.large,
    fontWeight: '600',
    color: '#0A0B0BFF',
    fontFamily: family.inter_medium,
  },
  settingsIcon: {
    width: WP(6),
    height: HP(5),
  },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#EBF2FFFF',
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
    fontSize: size.small,
    fontFamily: family.inter_regular,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  cardTime: {
    fontSize: size.tiny,
    fontFamily: family.inter_regular,
    color: '#95a5a6',
    marginBottom: 4,
  },
  newDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.p1 || '#007AFF',
  },

  skeletonCard: {
    height: 70,
    backgroundColor: '#EAEAEB',
    borderRadius: 10,
    marginVertical: 6,
    marginHorizontal: 15,
    padding: 10,
    opacity: 0.7,
  },
  skeletonTitle: {
    width: '60%',
    height: 12,
    backgroundColor: '#D3D4D6',
    borderRadius: 6,
    marginBottom: 10,
  },
  skeletonMsg: {
    width: '80%',
    height: 10,
    backgroundColor: '#D3D4D6',
    borderRadius: 6,
  },
});

export default styles;
