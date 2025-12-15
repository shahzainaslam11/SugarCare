import React from 'react';
import {View, Text, Image, StyleSheet, FlatList} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {appIcons, colors, family, HP, size, WP} from '../../../utilities';
import {AppButton, Header} from '../../../components';
import {useNavigation} from '@react-navigation/native';

const AddHBA1CTest = () => {
  const navigation = useNavigation();

  const reportsData = [
    {
      id: '1',
      value: '2.5% HbA1c',
      status: 'Normal',
      date: '04:48 AM | 17 Aug 2025',
      notes: 'from HCA Healthcare UK Laboratories',
      statusStyle: styles.normalStatus,
    },
    {
      id: '2',
      value: '6.2% HbA1c',
      status: 'Prediabetes',
      date: '10:30 AM | 20 Sep 2025',
      notes: 'suggests further monitoring required',
      statusStyle: styles.prediabetesStatus,
    },
    {
      id: '3',
      value: '7.1% HbA1c',
      status: 'Type 1',
      date: '03:15 PM | 05 Nov 2025',
      notes: 'consider lifestyle changes and medic...',
      statusStyle: styles.type1Status,
    },
  ];

  const renderItem = ({item}) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.valueContainer}>
          <Image
            source={appIcons.hba1c}
            style={styles.icon}
            resizeMode="contain"
          />
          <Text style={styles.valueText}>{item.value}</Text>
        </View>
        <View style={[styles.statusContainer, item.statusStyle]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <Text style={styles.dateText}>{item.date}</Text>
      <Text style={styles.notesText}>
        <Text style={styles.notesLabel}>Notes: </Text>
        {item.notes}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="HbA1c Test Reports" onPress={() => navigation.goBack()} />

      <FlatList
        data={reportsData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <AppButton
        onPress={() => navigation.navigate('NewHbA1cReport')}
        title="Add Record"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgColor,
    paddingHorizontal: WP(4),
  },
  listContainer: {
    paddingVertical: HP(1.5),
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: HP(1.5),
    paddingVertical: HP(2),
    paddingHorizontal: WP(4),
    borderWidth: 1,
    borderColor: colors.g14,
    shadowColor: colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: WP(7),
    height: HP(3.5),
    marginRight: WP(2),
  },
  valueText: {
    fontFamily: family.inter_bold,
    fontSize: size.large,
    color: colors.black,
  },
  statusContainer: {
    paddingHorizontal: WP(3),
    paddingVertical: HP(0.5),
    borderRadius: 14,
  },
  statusText: {
    fontFamily: family.inter_medium,
    fontSize: size.xsmall,
    color: colors.white,
  },
  normalStatus: {
    backgroundColor: colors.gr1,
  },
  prediabetesStatus: {
    backgroundColor: colors.bw1,
  },
  type1Status: {
    backgroundColor: colors.r1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.g15,
    marginVertical: HP(1),
  },
  dateText: {
    fontFamily: family.inter_regular,
    fontSize: size.small,
    color: colors.g3,
    marginBottom: HP(0.5),
  },
  notesText: {
    fontFamily: family.inter_medium,
    fontSize: size.normal,
    color: colors.g2,
  },
  notesLabel: {
    fontFamily: family.inter_bold,
    color: colors.black,
  },
});

export default AddHBA1CTest;
