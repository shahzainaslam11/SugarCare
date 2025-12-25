import React, {useEffect} from 'react';
import {View, Text, Image, FlatList} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {appIcons, colors, WP} from '../../../utilities';
import {AppButton, Header} from '../../../components';
import {useNavigation} from '@react-navigation/native';
import styles from './styles';

// Redux
import {useDispatch, useSelector} from 'react-redux';
import {fetchHbA1cRecords} from '../../../redux/slices/hba1cSlice';
import {showError} from '../../../utilities';

const AddHBA1CTest = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {user, accessToken} = useSelector(state => state.auth);
  const {records, loading, error} = useSelector(state => state.hba1c);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchHbA1cRecords({user_id: user.id, token: accessToken}))
        .unwrap()
        .catch(err => showError(err?.message || 'Failed to fetch records'));
    }
  }, [user?.id]);

  const getStatusStyle = status => {
    switch (status) {
      case 'Normal':
        return styles.normalStatus;
      case 'Prediabetes':
        return styles.prediabetesStatus;
      case 'Type 1':
      case 'Type 2':
        return styles.type1Status;
      default:
        return styles.normalStatus;
    }
  };

  const renderItem = ({item}) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.valueContainer}>
          <Image
            source={appIcons.hba1c}
            style={styles.icon}
            resizeMode="contain"
          />
          <Text style={styles.valueText}>{item.value}% HbA1c</Text>
        </View>
        <View style={[styles.statusContainer, getStatusStyle(item.status)]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <Text style={styles.dateText}>
        {item.time} | {item.date}
      </Text>
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
        data={records}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading && (
            <Text style={{textAlign: 'center', marginTop: 20}}>
              No HbA1c records found.
            </Text>
          )
        }
      />

      <AppButton
        onPress={() => navigation.navigate('NewHbA1cReport')}
        title="Add Record"
        loading={loading}
      />
    </SafeAreaView>
  );
};

export default AddHBA1CTest;
