// CustomFast.js
import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, SafeAreaView} from 'react-native';
import moment from 'moment';
import {DatePicker, Header, TimePicker, AppButton} from '../../../components';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {showError, showSuccess, WP} from '../../../utilities';
import {useNavigation, useRoute} from '@react-navigation/native';
import styles from './styles';

// Redux
import {useDispatch, useSelector} from 'react-redux';
import {addFastingRecord} from '../../../redux/slices/fastingSlice';

const CustomFast = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const {user, accessToken} = useSelector(state => state.auth);

  // Check if this is an ongoing fast passed from Fasting screen
  const ongoingFast = route.params?.ongoingFast;

  const [date, setDate] = useState(
    ongoingFast ? new Date(ongoingFast.startTime) : new Date(),
  );
  const [startTime, setStartTime] = useState(
    ongoingFast ? new Date(ongoingFast.startTime) : new Date(),
  );
  const [endTime, setEndTime] = useState(
    ongoingFast ? new Date(ongoingFast.endTime) : new Date(),
  );
  const [fastingDuration, setFastingDuration] = useState({
    hours: ongoingFast?.durationHours || 0,
    minutes: 0,
  });
  const [eatingWindow, setEatingWindow] = useState({hours: 0, minutes: 0});
  const [notes, setNotes] = useState(ongoingFast?.notes || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    calculateDurations();
  }, [startTime, endTime]);

  const calculateDurations = () => {
    const startMoment = moment(startTime);
    let endMoment = moment(endTime);

    if (endMoment.isBefore(startMoment)) {
      endMoment = endMoment.add(1, 'day');
    }

    const durationMinutes = endMoment.diff(startMoment, 'minutes');
    const fastingHours = Math.floor(durationMinutes / 60);
    const fastingMinutes = durationMinutes % 60;
    setFastingDuration({hours: fastingHours, minutes: fastingMinutes});

    const totalMinutesInDay = 24 * 60;
    const eatingMinutes = totalMinutesInDay - durationMinutes;
    const eatingHours = Math.floor(eatingMinutes / 60);
    const eatingMins = eatingMinutes % 60;
    setEatingWindow({hours: eatingHours, minutes: eatingMins});
  };

  const handleSave = () => {
    if (!user?.id) {
      showError('User ID not found!');
      return;
    }

    setLoading(true);
    const durationString = `${fastingDuration.hours}:${fastingDuration.minutes
      .toString()
      .padStart(2, '0')}`;
    const payload = {
      user_id: user.id,
      date: moment(date).format('YYYY-MM-DD'),
      start_time: moment(startTime).format('HH:mm'),
      end_time: moment(endTime).format('HH:mm'),
      duration_hours: durationString,
      notes: notes || '',
      token: accessToken,
      // If editing ongoing fast, include its ID to update instead of creating new
      ...(ongoingFast?.id && {id: ongoingFast.id}),
    };

    console.log('📤 PAYLOAD FASTING RECORD:', JSON.stringify(payload));

    dispatch(addFastingRecord(payload))
      .unwrap()
      .then(res => {
        console.log('🎉 Record Added/Updated Successfully', res);
        showSuccess(res?.message || 'Fasting record saved successfully!');
        navigation.goBack();
      })
      .catch(err => {
        console.log('❌ Failed to Save Fasting Record:', JSON.stringify(err));
        showError(
          err?.message ||
            err?.error ||
            'Failed to save fasting record, please try again!',
        );
      })
      .finally(() => setLoading(false));
  };

  const formatDuration = (hours, minutes) => {
    if (hours === 0 && minutes === 0) return '0 hrs';
    return `${hours > 0 ? `${hours} hrs` : ''} ${
      minutes > 0 ? `${minutes} mins` : ''
    }`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={ongoingFast ? 'Update Fast' : 'New Fast'}
        onPress={() => navigation.goBack()}
      />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        keyboardShouldPersistTaps="handled">
        <DatePicker
          title="Date"
          selectedDate={date}
          onDateChange={setDate}
          containerStyle={styles.pickerContainer}
        />

        <View style={styles.timeContainer}>
          <TimePicker
            title="Start Time"
            selectedTime={startTime}
            onTimeChange={setStartTime}
            containerStyle={styles.pickerContainer}
            width={WP('42')}
          />

          <TimePicker
            title="End Time"
            selectedTime={endTime}
            onTimeChange={setEndTime}
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
            You’ll fast for{' '}
            {formatDuration(fastingDuration.hours, fastingDuration.minutes)} and
            have {formatDuration(eatingWindow.hours, eatingWindow.minutes)} for
            eating.
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
          title={ongoingFast ? 'Update Fast' : 'Save'}
          onPress={handleSave}
          loading={loading}
          disabled={loading}
        />
      </View>
    </SafeAreaView>
  );
};

export default CustomFast;
