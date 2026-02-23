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
        <View style={styles.headerRow}>
          <View style={styles.durationContainer}>
            <View style={styles.iconWrapper}>
              <Image
                source={iconSource}
                style={styles.icon}
                resizeMode="contain"
              />
            </View>
            <View>
              <Text style={styles.durationValue}>
                {durationHrs}
                <Text style={styles.durationUnit}> hrs</Text>
              </Text>
              <Text style={styles.durationLabel}>fast</Text>
            </View>
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

        <View style={styles.detailsRow}>
          <View style={styles.timeBlock}>
            <Text style={styles.timeLabel}>Started</Text>
            <Text style={styles.timeValue}>{displayStartDate}</Text>
            <Text style={styles.timeSub}>{displayStartTime}</Text>
          </View>
          <View style={styles.timeBlock}>
            <Text style={styles.timeLabel}>Ends at</Text>
            <Text style={styles.timeValue}>{displayEndDate}</Text>
            <Text style={styles.timeSub}>{displayEndTime}</Text>
          </View>
        </View>

        <View style={styles.notesRow}>
          <Text style={styles.notesLabel}>Notes</Text>
          <Text style={styles.notesText} numberOfLines={1}>
            {notes}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: HP(1.5),
    overflow: 'hidden',
    flexDirection: 'row',
    ...Platform.select({
      ios: {
        shadowColor: colors.p1,
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  cardContent: {
    flex: 1,
    paddingVertical: HP(1.5),
    paddingHorizontal: WP(4),
    paddingLeft: WP(4.5),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: WP(11),
    height: WP(11),
    borderRadius: WP(5.5),
    backgroundColor: colors.p6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: WP(2.5),
  },
  icon: {
    width: WP(5),
    height: HP(2.5),
    tintColor: colors.p1,
  },
  durationValue: {
    fontFamily: family.inter_bold,
    fontSize: size.h5,
    color: colors.b4,
    letterSpacing: -0.3,
  },
  durationUnit: {
    fontFamily: family.inter_medium,
    fontSize: size.normal,
    color: colors.g3,
  },
  durationLabel: {
    fontFamily: family.inter_regular,
    fontSize: size.xxsmall,
    color: colors.g3,
    marginTop: 1,
  },
  statusPill: {
    borderRadius: 12,
    paddingHorizontal: WP(2.5),
    paddingVertical: HP(0.5),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.12,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  completedPill: {
    backgroundColor: '#E5FFEE',
  },
  completedText: {
    color: '#00CC66',
    fontFamily: family.inter_bold,
    fontSize: size.xxsmall,
    letterSpacing: 0.2,
  },
  inProgressPill: {
    backgroundColor: colors.p1,
  },
  inProgressText: {
    color: colors.white,
    fontFamily: family.inter_bold,
    fontSize: size.xxsmall,
    letterSpacing: 0.2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.g15,
    marginVertical: HP(1),
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: WP(4),
  },
  timeBlock: {
    flex: 1,
  },
  timeLabel: {
    fontFamily: family.inter_medium,
    fontSize: size.xxsmall,
    color: colors.g3,
    marginBottom: 2,
  },
  timeValue: {
    fontFamily: family.inter_bold,
    fontSize: size.small,
    color: colors.b4,
  },
  timeSub: {
    fontFamily: family.inter_regular,
    fontSize: size.xxsmall,
    color: colors.g3,
    marginTop: 1,
  },
  notesRow: {
    marginTop: HP(0.8),
  },
  notesLabel: {
    fontFamily: family.inter_medium,
    fontSize: size.xxsmall,
    color: colors.g3,
    marginBottom: 2,
  },
  notesText: {
    fontFamily: family.inter_regular,
    fontSize: size.small,
    color: colors.b1,
  },
});

export {FastingRecordCard};
