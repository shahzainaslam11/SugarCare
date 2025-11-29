import React, {useState} from 'react';
import {View, Text, TextInput, StyleSheet, Platform} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  AppButton,
  DatePicker,
  Header,
  TimePicker,
} from '../../../../components';
import {colors, family, size, WP, HP} from '../../../../utilities';
import {useNavigation} from '@react-navigation/native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

const NewHbA1cReport = () => {
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());

  const [hbA1cValue, setHbA1cValue] = useState('5.5');
  const [notes, setNotes] = useState('from HCA Healthcare UK Laboratories');
  const navigation = useNavigation();

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
                selectedTime={startTime}
                onTimeChange={setStartTime}
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
          <AppButton title="Save" />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: WP(4),
  },
  scrollContent: {
    paddingBottom: HP(4),
  },
  formContainer: {
    borderRadius: 12,
    paddingVertical: HP(2.5),
    paddingHorizontal: WP(4),
    marginTop: HP(2),
    shadowColor: colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: HP(2),
  },
  pickerContainer: {
    flex: 1,
    marginRight: WP(2),
    width: '48%',
  },
  inputContainer: {
    marginBottom: HP(2),
  },
  label: {
    fontSize: size.medium,
    fontFamily: family.inter_bold,
    color: colors.b1,
    marginBottom: HP(0.5),
  },
  input: {
    fontSize: size.medium,
    fontFamily: family.inter_medium,
    color: colors.b1,
    borderWidth: 1,
    borderColor: colors.g14,
    borderRadius: 10,
    paddingVertical: HP(1.4),
    paddingHorizontal: WP(3),
    backgroundColor: colors.white,
  },
  notesInput: {
    height: HP(15),
    textAlignVertical: 'top',
  },
  buttonContainer: {
    paddingVertical: HP(2),
  },
});

export default NewHbA1cReport;
