// CustomFast.js
import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Text, TextInput, SafeAreaView} from 'react-native';

import moment from 'moment';
import {DatePicker, Header, TimePicker, AppButton} from '../../../components';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {WP} from '../../../utilities';
import {useNavigation} from '@react-navigation/native';

const CustomFast = () => {
  const naigation = useNavigation();
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [fastingDuration, setFastingDuration] = useState({
    hours: 0,
    minutes: 0,
  });
  const [eatingWindow, setEatingWindow] = useState({hours: 0, minutes: 0});
  const [notes, setNotes] = useState('224.4 mg/dL before fasting');
  const [progress, setProgress] = useState(26);

  useEffect(() => {
    calculateDurations();
  }, [startTime, endTime]);

  const calculateDurations = () => {
    const startMoment = moment(startTime);
    let endMoment = moment(endTime);

    // Handle case where end time is the next day
    if (endMoment.isBefore(startMoment)) {
      endMoment = endMoment.add(1, 'day');
    }

    // Calculate fasting duration
    const durationMinutes = endMoment.diff(startMoment, 'minutes');
    const fastingHours = Math.floor(durationMinutes / 60);
    const fastingMinutes = durationMinutes % 60;
    setFastingDuration({hours: fastingHours, minutes: fastingMinutes});

    // Calculate eating window (24 hours - fasting duration)
    const totalMinutesInDay = 24 * 60;
    const eatingMinutes = totalMinutesInDay - durationMinutes;
    const eatingHours = Math.floor(eatingMinutes / 60);
    const eatingMins = eatingMinutes % 60;
    setEatingWindow({hours: eatingHours, minutes: eatingMins});
  };

  const handleSave = () => {
    console.log('Save pressed');
  };

  const handleDateChange = newDate => {
    setDate(newDate);
  };

  const handleStartTimeChange = newTime => {
    setStartTime(newTime);
  };

  const handleEndTimeChange = newTime => {
    setEndTime(newTime);
  };

  const formatDuration = (hours, minutes) => {
    if (hours === 0 && minutes === 0) return '0 hrs';

    let result = '';
    if (hours > 0) result += `${hours} hr${hours !== 1 ? 's' : ''}`;
    if (minutes > 0) {
      if (hours > 0) result += ' ';
      result += `${minutes} min${minutes !== 1 ? 's' : ''}`;
    }
    return result;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="New Fast" onPress={() => naigation.goBack()} />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        keyboardShouldPersistTaps="handled">
        {/* Date Picker */}
        <DatePicker
          title="Date"
          selectedDate={date}
          onDateChange={handleDateChange}
          containerStyle={styles.pickerContainer}
        />

        {/* Time Pickers */}
        <View style={styles.timeContainer}>
          <TimePicker
            title="Start Time"
            selectedTime={startTime}
            onTimeChange={handleStartTimeChange}
            containerStyle={styles.pickerContainer}
            width={WP('42')}
          />

          <TimePicker
            title="End Time"
            selectedTime={endTime}
            onTimeChange={handleEndTimeChange}
            containerStyle={styles.pickerContainer}
            width={WP('42')}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Fasting Duration</Text>
          <View style={styles.input}>
            <Text style={styles.durationText}>
              {formatDuration(fastingDuration.hours, fastingDuration.minutes)}
            </Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            You'll fast for{' '}
            {formatDuration(fastingDuration.hours, fastingDuration.minutes)} and
            have {formatDuration(eatingWindow.hours, eatingWindow.minutes)} for
            eating
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any notes here"
            multiline
            placeholderTextColor="#999"
          />
        </View>
      </KeyboardAwareScrollView>

      <View style={styles.buttonContainer}>
        <AppButton
          title="Save"
          onPress={handleSave}
          containerStyle={styles.saveButton}
          textStyle={styles.saveButtonText}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: WP('6'),
    paddingTop: WP('2'),
    paddingBottom: WP('10'),
  },
  pickerContainer: {
    marginBottom: WP('4'),
  },
  inputGroup: {
    marginBottom: WP('4'),
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#212529',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  durationText: {
    fontSize: 16,
    color: '#212529',
  },
  notesInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: WP('4'),
  },
  timeInput: {
    flex: 1,
    // marginRight: WP('2'),
  },
  infoBox: {
    backgroundColor: '#e7f5ff',
    borderRadius: 8,
    padding: 16,
    marginBottom: WP('4'),
  },
  infoText: {
    color: '#0a58ca',
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: WP('6'),
    paddingBottom: WP('4'),
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  saveButton: {
    backgroundColor: '#0d6efd',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CustomFast;
