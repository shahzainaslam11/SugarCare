import {StyleSheet} from 'react-native';
import {colors, family, HP, size, WP} from '../../../../utilities';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgGray || '#f5f5f5',
  },
  scrollContent: {
    padding: WP(5),
    paddingBottom: HP(15),
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: HP(3),
    position: 'relative',
  },
  avatar: {
    width: WP(25),
    height: WP(25),
    borderRadius: WP(12.5),
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: WP(32),
    backgroundColor: colors.p1,
    padding: WP(1.5),
    borderRadius: WP(5),
    borderWidth: 2,
    borderColor: '#fff',
  },
  cameraIcon: {
    width: WP(4),
    height: WP(4),
    tintColor: '#fff',
  },
  readonlyContainer: {
    opacity: 0.7,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  half: {
    flex: 1,
    marginRight: WP(2),
  },
  saveBtn: {
    marginBottom: HP(3),
    alignSelf: 'center',
    width: '80%',
  },
  insulinText: {
    flex: 1,
    fontSize: size.medium,
    fontFamily: family.inter_medium,
    color: colors.black,
  },
});

export default styles;
