import React from 'react';
import MainAppNav from './src/navigation';
import FlashMessage from 'react-native-flash-message';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {store, persistor} from './src/redux/store'; // Updated import
import {ActivityIndicator, View} from 'react-native';

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        }
        persistor={persistor}>
        <MainAppNav />
        <FlashMessage position="top" />
      </PersistGate>
    </Provider>
  );
};

export default App;
