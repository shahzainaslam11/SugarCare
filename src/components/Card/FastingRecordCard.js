import React from 'react';
import {View, Text, StyleSheet, Image, Platform} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
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

  const rawDuration = record.duration_hours ?? 0;
  const totalDuration =
    typeof rawDuration === 'number'
      ? rawDuration
      : parseFloat(String(rawDuration).split(':')[0]) || 0;
  const durationHrs = Math.trunc(totalDuration);

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
    <View style={styles.cardWrapper}>
      <LinearGradient
        colors={[colors.p1, colors.p9]}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        style={styles.cardAccent}
      />
      <View style={styles.cardContent}>
        <View style={styles.topRow}>
          <View style={styles.durationBlock}>
            <View style={styles.iconWrapper}>
              <Image
                source={iconSource}
                style={styles.icon}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.durationValue}>
              {durationHrs}
              <Text style={styles.durationUnit}>h</Text>
            </Text>
          </View>
          <View
            style={[
              styles.statusPill,
              isCompleted ? styles.completedPill : styles.inProgressPill,
            ]}>
            <View style={[styles.pillDot, isCompleted && styles.pillDotCompleted]} />
            <Text
              style={isCompleted ? styles.completedText : styles.inProgressText}>
              {isCompleted ? 'Done' : 'Active'}
            </Text>
          </View>
        </View>
        <View style={styles.detailsRow}>
          <Text style={styles.timeChip}>
            {displayStartDate} · {displayStartTime}
          </Text>
          <Text style={styles.timeArrow}>→</Text>
          <Text style={styles.timeChip}>
            {displayEndDate} · {displayEndTime}
          </Text>
        </View>
        {notes !== '---' && (
          <Text style={styles.notesText} numberOfLines={1}>
            {notes}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: HP(1),
    overflow: 'hidden',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(66, 82, 255, 0.08)',
    ...Platform.select({
      ios: {
        shadowColor: colors.p1,
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {elevation: 3},
    }),
  },
  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  cardContent: {
    flex: 1,
    paddingVertical: HP(1),
    paddingHorizontal: WP(3),
    paddingLeft: WP(3.8),
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HP(0.5),
  },
  durationBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: WP(8),
    height: WP(8),
    borderRadius: WP(4),
    backgroundColor: colors.p6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: WP(1.8),
  },
  icon: {
    width: WP(3.5),
    height: HP(1.8),
    tintColor: colors.p1,
  },
  durationValue: {
    fontFamily: family.inter_bold,
    fontSize: size.medium,
    color: colors.b4,
    letterSpacing: -0.2,
  },
  durationUnit: {
    fontFamily: family.inter_medium,
    fontSize: size.xsmall,
    color: colors.g3,
    marginLeft: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: WP(2.2),
    paddingVertical: HP(0.35),
    gap: 5,
  },
  pillDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.white,
  },
  pillDotCompleted: {
    backgroundColor: '#00CC66',
  },
  completedPill: {
    backgroundColor: '#D4F5E3',
  },
  completedText: {
    color: '#00A65A',
    fontFamily: family.inter_bold,
    fontSize: size.xtiny,
    letterSpacing: 0.3,
  },
  inProgressPill: {
    backgroundColor: colors.p1,
  },
  inProgressText: {
    color: colors.white,
    fontFamily: family.inter_bold,
    fontSize: size.xtiny,
    letterSpacing: 0.3,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: HP(0.3),
    flexWrap: 'wrap',
    gap: 4,
  },
  timeChip: {
    fontFamily: family.inter_medium,
    fontSize: size.xtiny,
    color: colors.g3,
  },
  timeArrow: {
    fontFamily: family.inter_regular,
    fontSize: size.xtiny,
    color: colors.g9,
    marginHorizontal: 2,
  },
  notesText: {
    fontFamily: family.inter_regular,
    fontSize: size.xtiny,
    color: colors.g7,
    marginTop: HP(0.4),
    fontStyle: 'italic',
  },
});

export {FastingRecordCard};
