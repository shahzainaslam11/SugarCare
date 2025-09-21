import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import {TimePicker, DatePicker, Header} from '../../../components';
import {styles} from './styles';
import {appIcons, WP} from '../../../utilities';
import {useNavigation} from '@react-navigation/native';

const NewSugarRecord = () => {
  const navigation = useNavigation();
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [bloodSugarValue, setBloodSugarValue] = useState('100');
  const [selectedTag, setSelectedTag] = useState('Fasting');
  const [notes, setNotes] = useState('Checked Before Fasting');

  const handleDateChange = newDate => {
    setDate(newDate);
  };

  const handleStartTimeChange = newTime => {
    setStartTime(newTime);
  };

  const tags = ['Fasting', 'Meal', 'Bedtime'];

  return (
    <View style={styles.container}>
      <Header title="New Sugar Record" onPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Date + Time pickers */}
        <View style={styles.pickersRow}>
          <DatePicker
            title="Date"
            selectedDate={date}
            onDateChange={handleDateChange}
            containerStyle={styles.pickerContainer}
          />
          <TimePicker
            title="Start Time"
            selectedTime={startTime}
            onTimeChange={handleStartTimeChange}
            containerStyle={styles.pickerContainer}
            width={WP('42')}
          />
        </View>

        {/* Blood Sugar Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Blood Sugar Value</Text>
          <View style={styles.bloodSugarContainer}>
            <TextInput
              style={styles.bloodSugarInput}
              value={bloodSugarValue}
              onChangeText={setBloodSugarValue}
              keyboardType="numeric"
              maxLength={3}
            />
            <Text style={styles.unitText}>mg/dL</Text>
          </View>
          <Text style={styles.unitNote}>
            1️⃣ Unit can be changed in settings
          </Text>
        </View>

        {/* Tags */}
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

        <View style={styles.divider} />

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            maxLength={100}
          />
          <Text style={styles.notesCounter}>{notes.length}/100</Text>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default NewSugarRecord;
