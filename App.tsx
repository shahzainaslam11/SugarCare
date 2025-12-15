import React from 'react';
import MainAppNav from './src/navigation';
import FlashMessage from 'react-native-flash-message';
import {Provider} from 'react-redux';
import store from './src/redux/store';

const App = () => {
  return (
    <>
      <Provider store={store}>
        <MainAppNav />
        <FlashMessage position="top" />
      </Provider>
    </>
  );
};

export default App;
