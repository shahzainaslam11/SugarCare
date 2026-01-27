import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import dayjs from 'dayjs';
import {appIcons, colors, family, HP, size, WP} from '../../utilities';

const formatDate = isoDate => {
  if (!isoDate) return '';
  const date = dayjs(isoDate);
  return date.format('MMM DD');
};

const formatTime = time24hr => {
  if (!time24hr) return '';
  const dateTime = dayjs().format('YYYY-MM-DD') + ' ' + time24hr;
  return dayjs(dateTime, 'YYYY-MM-DD HH:mm').format('hh:mm A');
};

const getNextDayDate = isoDate => {
  if (!isoDate) return '';
  const date = dayjs(isoDate).add(1, 'day');
  return date.format('YYYY-MM-DD');
};

const PRIMARY_BLUE = '#4A4CFF';
const DURATION_TEXT_COLOR = '#333333';
const GRAY_TEXT = '#8C8C8C';
const COMPLETED_BG = '#E5FFEE';
const COMPLETED_TEXT_COLOR = '#00CC66';
const CARD_BG = '#FFFFFF';

const FastingRecordCard = ({record, iconSource = appIcons.fastIcon}) => {
  if (!record) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 120,
        }}>
        <Text
          style={{
            textAlign: 'center',
            color: '#888',
            fontSize: 16,
          }}>
          No fasting record available
        </Text>
      </View>
    );
  }

  const totalDuration = record.duration_hours || 0;
  const durationHours = Math.trunc(totalDuration).toString();
  const durationMinutes = Math.round(
    (totalDuration - durationHours) * 60,
  ).toString();

  const isOvernight = dayjs(record.start_time, 'HH:mm').isAfter(
    dayjs(record.end_time, 'HH:mm'),
  );
  const endDateISO = isOvernight ? getNextDayDate(record.date) : record.date;

  const displayStartDate = formatDate(record.date);
  const displayStartTime = formatTime(record.start_time);
  const displayEndDate = formatDate(endDateISO);
  const displayEndTime = formatTime(record.end_time);
  const isCompleted = record.status === 'Completed';
  const notes = record.notes || '---';

  return (
    <View style={styles.cardContainer}>
      <View style={styles.headerRow}>
        <View style={styles.durationContainer}>
          <Image source={iconSource} style={styles.icon} resizeMode="contain" />
          <Text style={styles.durationText}>
            <Text style={styles.timeValue}>{totalDuration}</Text>
          </Text>
        </View>

        <View
          style={[
            styles.statusPill,
            isCompleted ? styles.completedPill : styles.inProgressPill,
          ]}>
          <Text
            style={isCompleted ? styles.completedText : styles.inProgressText}>
            {isCompleted ? 'Completed' : 'In Progress'}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailsSection}>
        <View style={styles.timeDetail}>
          <Text style={styles.label}>Started:</Text>
          <Text
            style={
              styles.dateTime
            }>{`${displayStartDate}, ${displayStartTime}`}</Text>
        </View>

        <View style={styles.timeDetail}>
          <Text style={styles.label}>Ends at:</Text>
          <Text
            style={
              styles.dateTime
            }>{`${displayEndDate}, ${displayEndTime}`}</Text>
        </View>
      </View>

      <View style={styles.notesSection}>
        <Text style={styles.label}>
          Notes: <Text style={styles.noteContent}>{notes}</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: CARD_BG,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: WP('4'),
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: WP('5'),
    height: HP('3'),
    marginRight: 8,
    tintColor: PRIMARY_BLUE,
  },
  durationText: {
    fontSize: size.medium,
    fontFamily: family.inter_medium,
    color: DURATION_TEXT_COLOR,
  },
  timeValue: {
    fontWeight: '700',
    fontSize: size.medium,
    fontFamily: family.inter_medium,
    color: DURATION_TEXT_COLOR,
  },
  statusPill: {
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  completedPill: {
    backgroundColor: COMPLETED_BG,
  },
  completedText: {
    color: COMPLETED_TEXT_COLOR,
    fontWeight: '600',
    fontSize: size.xsmall,
    fontFamily: family.inter_regular,
  },
  inProgressPill: {
    backgroundColor: PRIMARY_BLUE,
  },
  inProgressText: {
    color: '#FFFFFF',
    fontSize: size.xsmall,
    fontFamily: family.inter_regular,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: WP('4'),
  },
  detailsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: WP('4'),
  },
  timeDetail: {},
  label: {
    fontSize: size.small,
    fontFamily: family.inter_regular,
    color: GRAY_TEXT,
    marginBottom: 4,
    fontWeight: '500',
  },
  dateTime: {
    fontSize: size.small,
    fontFamily: family.inter_regular,
    color: DURATION_TEXT_COLOR,
    fontWeight: '600',
  },
  notesSection: {},
  noteContent: {
    color: DURATION_TEXT_COLOR,
    fontWeight: '600',
    fontSize: size.small,
    fontFamily: family.inter_regular,
  },
});

export {FastingRecordCard};
