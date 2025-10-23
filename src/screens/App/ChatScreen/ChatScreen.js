import {View, Text} from 'react-native';
import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Header} from '../../../components';

const ChatScreen = () => {
  const navigation = useNavigation();
  return (
    <SafeAreaView>
      <Header title="Chat With SugaBuddy" onPress={() => navigation.goBack()} />

      <Text>ChatScreen</Text>
    </SafeAreaView>
  );
};

export default ChatScreen;
