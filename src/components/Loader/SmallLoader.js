import React from 'react';
import {View, StyleSheet, ActivityIndicator} from 'react-native';
import {WP, HP, colors} from '../../utilities';
import {hasNotch} from 'react-native-device-info';
import PropTypes from 'prop-types';

export const SmallLoader = ({height, width = '80%'}) => {
	return (
		<View style={[styles.alert, {height, width: width}]}>
			<ActivityIndicator size={'small'} color={colors.p1} animating />
		</View>
	);
};

SmallLoader.propTypes = {
	height: PropTypes.string,
	width: PropTypes.string,
};

const styles = StyleSheet.create({
	alert: {
		backgroundColor: colors.white,
		justifyContent: 'center',
		alignItems: 'center',
		height: hasNotch() ? HP('12') : HP('15'),
		width: WP('80%'),
		flex: 1,
		marginHorizontal: WP('0'),
		borderRadius: 5,
	},
});
