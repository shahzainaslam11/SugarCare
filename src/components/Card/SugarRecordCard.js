import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {appIcons} from '../../utilities';

const SugarRecordCard = ({record}) => {
  if (!record) {
    return null; // Return null if no record is provided
  }

  const getStatusStyle = value => {
    if (value < 70) return styles.lowStatus;
    if (value > 180) return styles.highStatus;
    return styles.normalStatus;
  };

  const getStatusText = value => {
    if (value < 70) return 'Low';
    if (value > 180) return 'High';
    return 'Normal';
  };

  return (
    <View style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <View style={styles.valueContainer}>
          <Image source={appIcons.bloodIcon} style={styles.image} />
          <Text style={styles.recordValue}>{record.value} mg/dL</Text>
        </View>
        <View style={[styles.status, getStatusStyle(record.value)]}>
          <Text style={styles.statusText}>{getStatusText(record.value)}</Text>
        </View>
      </View>
      <Text style={styles.recordType}>{record.type}</Text>
      <Text style={styles.recordTime}>{record.time}</Text>
      {record.notes && <Text style={styles.notes}>Notes: {record.notes}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  recordCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  recordValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
  },
  normalStatus: {
    backgroundColor: '#2ecc71',
  },
  highStatus: {
    backgroundColor: '#e74c3c',
  },
  lowStatus: {
    backgroundColor: '#f39c12',
  },
  recordType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  recordTime: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
  },
  notes: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
  },
});

export {SugarRecordCard};
