import React from 'react';
import MainAppNav from './src/navigation';
import FlashMessage from 'react-native-flash-message';

const App = () => {
  return (
    <>
      <MainAppNav />
      <FlashMessage position="top" />
    </>
  );
};

export default App;
