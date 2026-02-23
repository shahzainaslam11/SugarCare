/**
 * ProtectedRoute - redirects to Auth if not authenticated
 * Used for screens that require login
 */

import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {CommonActions} from '@react-navigation/native';

export function ProtectedRoute({children}) {
  const navigation = useNavigation();
  const {accessToken, isInitialized} = useSelector(state => state.auth);
  const isAuthenticated = Boolean(accessToken);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{name: 'Auth'}],
        }),
      );
    }
  }, [isInitialized, isAuthenticated, navigation]);

  if (!isInitialized || !isAuthenticated) {
    return null;
  }

  return children;
}

export default ProtectedRoute;
