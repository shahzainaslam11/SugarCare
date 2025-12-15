import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

const HbA1cReportScreen = () => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>HbA1c Test Reports</Text>
      </View>

      {/* Report Cards */}
      <View style={styles.reportsContainer}>
        {/* Report 1 */}
        <View style={styles.card}>
          <Text style={styles.value}>2.5% HbA1c</Text>
          <Text style={styles.status}>Normal</Text>
          <Text style={styles.date}>04:48 AM | 17 Aug 2025</Text>
          <Text style={styles.notes}>
            Notes: from HCA Healthcare UK Laboratories
          </Text>
        </View>

        {/* Report 2 */}
        <View style={styles.card}>
          <Text style={styles.value}>6.2% HbA1c</Text>
          <Text style={styles.status}>Prediabetes</Text>
          <Text style={styles.date}>10:30 AM | 20 Sep 2025</Text>
          <Text style={styles.notes}>
            Notes: suggests further monitoring required
          </Text>
        </View>

        {/* Report 3 */}
        <View style={styles.card}>
          <Text style={styles.value}>7.1% HbA1c</Text>
          <Text style={styles.status}>Type 1</Text>
          <Text style={styles.date}>03:15 PM | 05 Nov 2025</Text>
          <Text style={styles.notes}>
            Notes: consider lifestyle changes and medic...
          </Text>
        </View>
      </View>

      {/* Add Record Button */}
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>Add Record</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  header: {
    padding: 10,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  reportsContainer: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    elevation: 2,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  status: {
    fontSize: 14,
    color: '#fff',
    backgroundColor: '#4CAF50', // Normal: Green
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  notes: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginVertical: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HbA1cReportScreen;
