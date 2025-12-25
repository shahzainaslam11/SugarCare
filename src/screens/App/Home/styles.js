import {StyleSheet} from 'react-native';
import {family, HP, size, WP} from '../../../utilities';
import {Fonts} from '../../../assets/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F5F5F5',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginLeft: 10,
  },
  iconButton: {
    padding: 8,
  },
  icon: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  streak: {
    fontSize: 16,
    marginBottom: 16,
    color: '#000',
  },

  // Fasting Plans Styles (KEEPING ORIGINAL STYLE)
  plansContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: HP(2),
    paddingHorizontal: WP(2),
  },

  planCard: {
    width: WP(28),
    borderRadius: WP(4),
    padding: WP(3.5),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HP(1),
  },

  planTitle: {
    fontSize: size.normal,
    fontFamily: Fonts.interSemiBold,
    color: '#000',
  },

  planHours: {
    fontSize: size.small,
    fontFamily: Fonts.interRegular,
    color: '#666',
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: WP(1.5),
    paddingVertical: HP(0.3),
    borderRadius: WP(1),
  },

  planDescription: {
    fontSize: size.xsmall,
    fontFamily: Fonts.interRegular,
    color: '#555',
    lineHeight: HP(1.8),
  },

  noFastText: {
    textAlign: 'center',
    fontSize: size.small,
    color: '#999',
    fontFamily: Fonts.interRegular,
    marginTop: HP(1),
    marginBottom: HP(2),
  },

  // Button
  button: {
    padding: 12,
    backgroundColor: '#4252FF',
    borderRadius: 8,
    width: '100%',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
  },
  plusIcon: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  buttonContainer: {
    paddingHorizontal: WP(6),
    bottom: 0,
    position: 'absolute',
    left: WP(14),
    right: WP(14),
  },
});

export default styles;
