import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {TimePicker, DatePicker, Header} from '../../../components';
import {styles} from './styles';
import {appIcons, colors, WP, showSuccess, showError} from '../../../utilities';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {addSugarRecord} from '../../../redux/slices/sugarForecastSlice';
import dayjs from 'dayjs';

const NewSugarRecord = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {accessToken, user} = useSelector(state => state.auth);
  const {loading} = useSelector(state => state.sugarForecast);

  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [bloodSugarValue, setBloodSugarValue] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [notes, setNotes] = useState('');

  const handleDateChange = newDate => setDate(newDate);
  const handleStartTimeChange = newTime => setStartTime(newTime);

  const tags = ['Fasting', 'Meal', 'Bedtime'];

  const handleSave = async () => {
    if (!bloodSugarValue || !selectedTag) {
      return showError('Please enter value and select a tag.');
    }

    const payload = {
      user_id: user?.id,
      value: Number(bloodSugarValue),
      tag: selectedTag,
      date: dayjs(date).format('YYYY-MM-DD'),
      time: dayjs(startTime).format('HH:mm'),
      notes,
    };

    console.log('Sending payload to API:', JSON.stringify(payload)); // 👈 show payload in console

    try {
      const resultAction = await dispatch(
        addSugarRecord({payload, token: accessToken}),
      );

      if (addSugarRecord.fulfilled.match(resultAction)) {
        console.log('API Response:', resultAction.payload); // 👈 show API response
        showSuccess(
          resultAction.payload?.message || 'Record added successfully',
        );
        navigation.goBack();
      } else {
        console.log(
          'API Error Response:',
          JSON.stringify(resultAction.payload),
        ); // 👈 show error response
        showError(resultAction.payload?.message || 'Failed to add record');
      }
    } catch (err) {
      console.log('Exception:', err); // 👈 show any unexpected errors
      showError(err.message || 'Something went wrong');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="New Sugar Record" onPress={() => navigation.goBack()} />

      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
        <View style={styles.pickersRow}>
          <DatePicker
            title="Date"
            selectedDate={date}
            onDateChange={handleDateChange}
            containerStyle={styles.pickerContainer}
          />
          <TimePicker
            title="Time"
            selectedTime={startTime}
            onTimeChange={handleStartTimeChange}
            containerStyle={styles.pickerContainer}
            width={WP(42)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Blood Sugar Value</Text>
          <View style={styles.bloodSugarContainer}>
            <TextInput
              style={styles.bloodSugarInput}
              value={bloodSugarValue}
              onChangeText={setBloodSugarValue}
              keyboardType="numeric"
              maxLength={3}
              placeholder="0"
            />
            <Text style={styles.unitText}>mg/dL</Text>
          </View>
          <Text style={styles.unitNote}>ⓘ Unit can be changed in settings</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Tag</Text>
          <View style={styles.tagsContainer}>
            {tags.map(tag => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tagButton,
                  selectedTag === tag && styles.tagButtonSelected,
                ]}
                onPress={() => setSelectedTag(tag)}>
                <View style={styles.tagContent}>
                  {selectedTag === tag && (
                    <Image
                      source={appIcons.mark}
                      style={styles.iconStyle}
                      resizeMode="contain"
                    />
                  )}
                  <Text
                    style={[
                      styles.tagText,
                      selectedTag === tag && styles.tagTextSelected,
                    ]}>
                    {tag}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Optional: e.g. before lunch, after exercise"
            placeholderTextColor={colors.g9}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={100}
          />
          <Text style={styles.notesCounter}>{notes.length}/100</Text>
        </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.8}>
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default NewSugarRecord;
