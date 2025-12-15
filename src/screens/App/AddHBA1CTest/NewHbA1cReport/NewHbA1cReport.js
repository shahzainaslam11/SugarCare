import React, {useState} from 'react';
import {View, Text, TextInput, Platform} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  AppButton,
  DatePicker,
  Header,
  TimePicker,
} from '../../../../components';
import {colors, WP} from '../../../../utilities';
import {useNavigation} from '@react-navigation/native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import styles from './styles';

// Redux
import {useDispatch, useSelector} from 'react-redux';
import {addHbA1cRecord} from '../../../../redux/slices/hba1cSlice';
import {showError, showSuccess} from '../../../../utilities';
import moment from 'moment';

const NewHbA1cReport = () => {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [hbA1cValue, setHbA1cValue] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {user, accessToken} = useSelector(state => state.auth);

  const handleSave = () => {
    if (!user?.id) {
      showError('User ID not found!');
      return;
    }

    if (!hbA1cValue) {
      showError('Please enter a valid HbA1c value');
      return;
    }

    const payload = {
      user_id: user.id,
      date: moment(date).format('YYYY-MM-DD'),
      time: moment(time).format('HH:mm'),
      value: parseFloat(hbA1cValue),
      notes,
      token: accessToken,
    };

    setLoading(true);

    dispatch(addHbA1cRecord(payload))
      .unwrap()
      .then(res => {
        showSuccess(res?.message || 'HbA1C record added successfully!');
        navigation.goBack();
      })
      .catch(err => {
        console.log('err0000>', JSON.stringify(err));
        showError(err?.message || 'Failed to add HbA1C record');
      })
      .finally(() => setLoading(false));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="New HbA1c Report" onPress={() => navigation.goBack()} />

      <View style={{flex: 1}}>
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          enableOnAndroid={true}
          contentContainerStyle={styles.scrollContent}
          extraScrollHeight={Platform.OS === 'ios' ? 20 : 100}>
          <View style={styles.formContainer}>
            <View style={styles.dateTimeRow}>
              <DatePicker
                title="Test Date"
                selectedDate={date}
                onDateChange={setDate}
                containerStyle={styles.pickerContainer}
              />
              <TimePicker
                title="Test Time"
                selectedTime={time}
                onTimeChange={setTime}
                containerStyle={[styles.pickerContainer, {marginRight: 0}]}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>HbA1c Value (%)</Text>
              <TextInput
                style={styles.input}
                value={hbA1cValue}
                onChangeText={setHbA1cValue}
                keyboardType="numeric"
                placeholder="Enter HbA1c value"
                placeholderTextColor={colors.g9}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.notesInput]}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                placeholder="Add any additional notes"
                placeholderTextColor={colors.g9}
              />
            </View>
          </View>
        </KeyboardAwareScrollView>

        <View style={styles.buttonContainer}>
          <AppButton title="Save" loading={loading} onPress={handleSave} />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default NewHbA1cReport;
