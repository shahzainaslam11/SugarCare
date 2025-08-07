import React from 'react';
import {StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {appIcons, colors, family, WP} from '../../utilities';
import moment from 'moment';
import PropTypes from 'prop-types';

const DatePicker = ({
	show,
	selectedDate,
	showDatePicker,
	setDatePickerVisibility,
	isDatePickerVisible,
	setSelectedDate,
	setshow,
	title,
}) => {
	const hideDatePicker = () => {
		setDatePickerVisibility(false);
	};
	const handleConfirm = date => {
		setSelectedDate(moment(date).format('MM-DD-YYYY'));
		setshow(true);
		hideDatePicker();
	};
	return (
		<View>
			<Text style={styles.titleStyle}>{title}</Text>
			<TouchableOpacity style={styles.innerContainer} onPress={showDatePicker}>
				<Text style={styles.textStyle}>
					{show ? selectedDate : <Text>12/12/2022</Text>}
				</Text>
				<Image
					source={appIcons.clockWhite}
					style={styles.iconStyle}
					resizeMode="contain"
				/>
				<DateTimePickerModal
					isVisible={isDatePickerVisible}
					mode="date"
					onConfirm={handleConfirm}
					onCancel={hideDatePicker}
				/>
			</TouchableOpacity>
		</View>
	);
};

DatePicker.propTypes = {
	show: PropTypes.bool,
	selectedDate: PropTypes.string,
	showDatePicker: PropTypes.bool,
	setDatePickerVisibility: PropTypes.func,
	isDatePickerVisible: PropTypes.bool,
	setSelectedDate: PropTypes.func,
	setshow: PropTypes.bool,
	title: PropTypes.string,
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
		color: colors.g5,
		alignSelf: 'center',
	},
	titleStyle: {
		color: colors.white,
		fontFamily: family.roboto_medium,
		marginVertical: WP('2'),
		marginTop: WP('7'),
	},
	iconStyle: {
		width: WP('7'),
		height: WP('7'),
		position: 'absolute',
		right: WP('5'),
		top: WP('3'),
	},
});

export {DatePicker};
