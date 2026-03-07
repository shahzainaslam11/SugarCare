// TimePicker.js
import React, {useState} from 'react';
import {Platform, StyleSheet, Text, TouchableOpacity, View, Image} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import {appIcons} from '../../utilities';

const iosCenterModalStyles =
  Platform.OS === 'ios'
    ? {
        // keep default bottom-sheet layout; only center picker content
        pickerContainerStyleIOS: {alignItems: 'center'},
        pickerStyleIOS: {alignSelf: 'center'},
      }
    : {};

// Import your clock icon
const clockIcon = require('../../assets/icons/clock.png'); // Update with your actual path

const TimePicker = ({
  title,
  selectedTime,
  onTimeChange,
  containerStyle,
  textStyle,
  titleStyle,
  disabled = false,
  width,
}) => {
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

  const showTimePicker = () => {
    if (!disabled) {
      setTimePickerVisibility(true);
    }
  };

  const hideTimePicker = () => {
    setTimePickerVisibility(false);
  };

  const handleConfirm = time => {
    onTimeChange(time);
    hideTimePicker();
  };

  return (
    <View style={[styles.container, containerStyle, {width: width}]}>
      {title && <Text style={[styles.titleStyle, titleStyle]}>{title}</Text>}
      <TouchableOpacity
        style={[styles.innerContainer, disabled && styles.disabled]}
        onPress={showTimePicker}
        disabled={disabled}>
        <Text
          style={[
            styles.textStyle,
            textStyle,
            disabled && styles.disabledText,
          ]}>
          {selectedTime
            ? moment(selectedTime).format('hh:mm A')
            : 'HH:MM AM/PM'}
        </Text>
        <Image
          source={appIcons.clock}
          style={[styles.iconStyle, disabled && styles.disabledIcon]}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        date={selectedTime ? new Date(selectedTime) : new Date()}
        onConfirm={handleConfirm}
        onCancel={hideTimePicker}
        {...iosCenterModalStyles}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  titleStyle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  innerContainer: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textStyle: {
    color: '#212529',
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
    tintColor: '#6c757d',
  },
  disabled: {
    backgroundColor: '#f8f9fa',
    borderColor: '#e9ecef',
  },
  disabledText: {
    color: '#6c757d',
  },
  disabledIcon: {
    tintColor: '#adb5bd',
  },
});

export {TimePicker};
