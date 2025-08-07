import React from 'react';
import {StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {appIcons, colors, family, size, WP} from '../../utilities';
import moment from 'moment';
import PropTypes from 'prop-types';

const TimePicker = ({
	selectedTime,
	showPicker,
	isVisible,
	title,
	handleConfirm,
	onCancel,
	disabled,
}) => {
	return (
		<View>
			<Text style={styles.titleStyle}>{title}</Text>
			<TouchableOpacity
				style={styles.innerContainer}
				onPress={showPicker}
				disabled={disabled}>
				<Text style={styles.textStyle}>
					{moment(selectedTime)?.format('hh:mm A') ||
						moment(new Date()).format('hh:mm A')}
				</Text>
				<Image
					source={appIcons.clockWhite}
					style={styles.iconStyle}
					resizeMode="contain"
				/>
				<DateTimePickerModal
					isVisible={isVisible}
					mode="time"
					onConfirm={handleConfirm}
					onCancel={onCancel}
				/>
			</TouchableOpacity>
		</View>
	);
};

TimePicker.propTypes = {
	selectedTime: PropTypes.string || PropTypes.any,
	showPicker: PropTypes.bool || PropTypes.any,
	isVisible: PropTypes.bool,
	title: PropTypes.string,
	handleConfirm: PropTypes.func,
	onCancel: PropTypes.func,
	disabled: PropTypes.bool,
};

const styles = StyleSheet.create({
	innerContainer: {
		alignItems: 'center',
		padding: WP('4'),
		borderRadius: 14,
		borderWidth: 1,
		borderColor: colors.white,
	},
	textStyle: {
		fontFamily: family.roboto_medium,
		color: colors.white,
		alignSelf: 'center',
		fontSize: size.xxlarge,
	},
	titleStyle: {
		color: colors.white,
		fontFamily: family.roboto_medium,
		marginVertical: WP('2'),
		marginTop: WP('7'),
		fontSize: size.large,
	},
	iconStyle: {
		width: WP('7'),
		height: WP('7'),
		position: 'absolute',
		right: WP('5'),
		top: WP('3'),
	},
});

export {TimePicker};
