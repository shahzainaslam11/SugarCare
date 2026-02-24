import React, {useEffect} from 'react';
import {View, Text, Image, FlatList, Pressable} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import {appIcons, colors, family, HP, size, WP} from '../../../utilities';
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
        return styles.type1Status;
      case 'Type 2':
        return styles.type2Status;
      default:
        return styles.normalStatus;
    }
  };

  const renderItem = ({item}) => (
    <Pressable
      style={({pressed}) => [styles.cardWrapper, pressed && styles.cardPressed]}
      android_ripple={null}>
      <View style={styles.card}>
        <LinearGradient
          colors={[colors.p1, colors.p9]}
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}
          style={styles.cardAccent}
        />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.valueContainer}>
              <View style={styles.iconWrapper}>
                <Image
                  source={appIcons.hba1c}
                  style={styles.icon}
                  resizeMode="contain"
                />
              </View>
              <View>
                <Text style={styles.valueText}>{item.value}%</Text>
                <Text style={styles.valueLabel}>HbA1c</Text>
              </View>
            </View>
            <View style={[styles.statusPill, getStatusStyle(item.status)]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <Text style={styles.dateText}>
            {item.time} • {item.date}
          </Text>
          <Text style={styles.notesText} numberOfLines={2}>
            <Text style={styles.notesLabel}>Notes: </Text>
            {item.notes || '—'}
          </Text>
        </View>
      </View>
    </Pressable>
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
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBg}>
                <Image
                  source={appIcons.hba1c}
                  style={styles.emptyIcon}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.emptyTitle}>No reports yet</Text>
              <Text style={styles.emptySubtitle}>
                Tap "Add Record" to log your first HbA1c test
              </Text>
            </View>
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
