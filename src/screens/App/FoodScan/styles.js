import {StyleSheet} from 'react-native';
import {colors, family, HP, size, WP} from '../../../utilities';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    // paddingTop: HP(4),
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: WP(5),
  },
  scannerImage: {
    width: WP(70),
    height: HP(25),
    marginBottom: HP(3),
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: HP(3),
  },
  capturedImage: {
    width: WP(70),
    height: HP(25),
    borderRadius: 15,
    borderWidth: 2,
    borderColor: colors.p1,
  },
  clearImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: colors.error,
    width: WP(6),
    height: WP(6),
    borderRadius: WP(3),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  clearImageText: {
    color: colors.white,
    fontSize: size.large,
    fontWeight: 'bold',
    lineHeight: WP(5),
  },
  title: {
    fontSize: size.h1,
    fontFamily: family.inter_bold,
    color: colors.black,
    textAlign: 'center',
    marginBottom: HP(1),
  },
  subtitle: {
    fontSize: size.normal,
    fontFamily: family.inter_regular,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: HP(2.8),
    marginBottom: HP(5),
  },
  buttonContainer: {
    width: '100%',
    gap: HP(2),
    marginBottom: HP(2),
  },
  scanButton: {
    backgroundColor: colors.p1,
    paddingVertical: HP(1.5),
    paddingHorizontal: WP(8),
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scanButtonText: {
    color: colors.white,
    fontSize: size.normal,
    fontFamily: family.inter_bold,
    textAlign: 'center',
  },
});

export default styles;
