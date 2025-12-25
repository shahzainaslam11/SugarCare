import React from 'react';
import {View, StyleSheet, ActivityIndicator, Modal} from 'react-native';
import {colors, HP, WP} from '../../utilities';
import PropTypes from 'prop-types';

export const SmallLoader = ({visible = true, size = 'large'}) => {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size={size} color={colors.p1} animating />
        </View>
      </View>
    </Modal>
  );
};

SmallLoader.propTypes = {
  visible: PropTypes.bool,
  size: PropTypes.string,
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)', // semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContainer: {
    backgroundColor: colors.white,
    padding: HP('3'),
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
