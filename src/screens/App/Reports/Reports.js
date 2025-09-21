import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
} from 'react-native';
import {ChartComponent, DatePicker} from '../../../components';
import {appIcons} from '../../../utilities';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('Today');
  const [showDateModal, setShowDateModal] = useState(false);
  const [startDate, setStartDate] = useState(new Date('2025-08-17'));
  const [endDate, setEndDate] = useState(new Date('2025-08-17'));

  const handleTabPress = tab => {
    if (tab === 'Custom') {
      setShowDateModal(true);
    } else {
      setActiveTab(tab);
    }
  };

  const handleApplyDates = () => {
    setActiveTab('Custom'); // This ensures Custom tab is selected after applying dates
    setShowDateModal(false);
    // Here you would typically fetch data for the selected date range
  };

  // Sample data for the chart - replace with your actual data
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [120, 145, 130, 160, 140, 155, 120],
      },
    ],
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusBar} />
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Reports</Text>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          {['Today', '1W', '1M'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => handleTabPress(tab)}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Custom Tab with Icon */}
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Custom' && styles.activeTab]}
            onPress={() => handleTabPress('Custom')}>
            <View style={styles.customTabContent}>
              {/* Replace this with your actual calendar icon image */}
              <Image
                source={appIcons.filter}
                style={styles.calendarIcon}
                resizeMode="contain"
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'Custom' && styles.activeTabText,
                ]}>
                Custom
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Blood Sugar Forecast */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Blood Sugar Forecast</Text>
          <Text style={styles.value}>120 mg/dL</Text>
          <Text style={styles.change}>Next 3 hours +15%</Text>

          {/* Your existing ChartComponent - it already includes day labels */}
          <ChartComponent data={chartData} />
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={[styles.card, styles.halfCard]}>
            <Text style={styles.cardTitle}>Average Fasting Time</Text>
            <Text style={styles.statValue}>14 hours</Text>
          </View>

          <View style={[styles.card, styles.halfCard]}>
            <Text style={styles.cardTitle}>Total Fasting Days</Text>
            <Text style={styles.statValue}>5 days</Text>
          </View>
        </View>

        {/* Download Button */}
        <TouchableOpacity style={styles.downloadButton}>
          <Image
            source={appIcons.download}
            style={styles.calendarIcon}
            resizeMode="contain"
          />
          <Text style={styles.downloadButtonText}>Download Report</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Date Picker Modal (Bottom Sheet) */}
      <Modal
        visible={showDateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDateModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Date Range</Text>

            <DatePicker
              title="Start Date"
              selectedDate={startDate}
              onDateChange={date => setStartDate(date)}
              containerStyle={styles.pickerContainer}
            />

            <DatePicker
              title="End Date"
              selectedDate={endDate}
              onDateChange={date => setEndDate(date)}
              containerStyle={styles.pickerContainer}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDateModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.applyButton]}
                onPress={handleApplyDates}>
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  statusBar: {
    height: 44,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#1a1a1a',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#4b66ea',
  },
  tabText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 14,
  },
  activeTabText: {
    color: '#fff',
  },
  customTabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  calendarIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
    tintColor: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  halfCard: {
    width: '48%',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  value: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  change: {
    fontSize: 14,
    color: '#4caf50',
    marginBottom: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  downloadButton: {
    backgroundColor: '#4b66ea',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    minHeight: '40%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  pickerContainer: {
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  applyButton: {
    backgroundColor: '#4b66ea',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Reports;
