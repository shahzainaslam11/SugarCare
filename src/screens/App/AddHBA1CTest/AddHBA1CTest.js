import {View, Text} from 'react-native';
import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Header} from '../../../components';
import {useNavigation} from '@react-navigation/native';

const AddHBA1CTest = () => {
  const navigation = useNavigation();
  return (
    <SafeAreaView>
      <Header title="AddHBA1CTest" onPress={() => navigation.goBack()} />

      <Text>AddHBA1CTest</Text>
    </SafeAreaView>
  );
};

export default AddHBA1CTest;
