import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View, Image} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import {appIcons} from '../../utilities';

const DatePicker = ({
  title,
  selectedDate,
  onDateChange,
  containerStyle,
  textStyle,
  titleStyle,
}) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = date => {
    // The date passed here is a native Date object.
    onDateChange(date);
    hideDatePicker();
  };

  // Ensure selectedDate is a valid Date object for moment formatting and the modal
  const dateValue = selectedDate ? new Date(selectedDate) : null;
  const displayDate = dateValue
    ? moment(dateValue).format('MM/DD/YYYY')
    : 'MM/DD/YYYY';
  const modalDate = dateValue || new Date();

  return (
    <View style={[styles.container, containerStyle]}>
      {title && <Text style={[styles.titleStyle, titleStyle]}>{title}</Text>}
      <TouchableOpacity style={styles.innerContainer} onPress={showDatePicker}>
        <Text style={[styles.textStyle, textStyle]}>{displayDate}</Text>
        <Image
          source={appIcons.calendar}
          style={styles.iconStyle}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        date={modalDate} // Set the initial date of the modal to the selected date
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
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
});

export {DatePicker}; // Changed to default export
