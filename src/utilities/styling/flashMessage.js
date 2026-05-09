import {showMessage} from 'react-native-flash-message';
import {Platform, StatusBar} from 'react-native';
import {HP} from './responsive';

const getTopInset = () => {
  if (Platform.OS === 'android') {
    return (StatusBar.currentHeight || 0) + HP(0.4);
  }
  return HP(1);
};

export const showSuccess = message => {
  showMessage({
    message,
    type: 'success',
    icon: 'success',
    duration: 3000,
    floating: true, // ✅ Makes it float like a pop-up
    style: {
      borderRadius: 12,
      marginTop: getTopInset(),
      marginHorizontal: 10,
      paddingVertical: 12,
      paddingHorizontal: 16,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 5,
    },
    titleStyle: {
      fontSize: 15,
      fontWeight: '600',
      color: '#fff',
    },
  });
};

export const showError = message => {
  showMessage({
    message,
    type: 'danger',
    icon: 'danger',
    duration: 3000,
    floating: true, // ✅ Floating style
    style: {
      borderRadius: 12,
      marginTop: getTopInset(),
      marginHorizontal: 10,
      paddingVertical: 12,
      paddingHorizontal: 16,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 5,
    },
    titleStyle: {
      fontSize: 15,
      fontWeight: '600',
      color: '#fff',
    },
  });
};
