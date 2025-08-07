import React from 'react';
import {View, Text, StyleSheet, TextInput} from 'react-native';
import {colors, family, size, WP} from '../../utilities';
import PropTypes from 'prop-types';

const AppInput = ({
	title,
	placeholder,
	value,
	onChangeText,
	errorMessage,
	editable,
}) => {
	return (
		<View style={styles.mainContainer}>
			<Text style={styles.textStyle}>{title}</Text>
			<TextInput
				placeholder={placeholder}
				placeholderTextColor={colors.g3}
				value={value}
				style={styles.inputStyle}
				onChangeText={onChangeText}
				editable={editable}
			/>
			{errorMessage && <Text style={styles.errorTxtStyle}>{errorMessage}</Text>}
		</View>
	);
};

const styles = StyleSheet.create({
	mainContainer: {
		marginVertical: WP('3'),
	},
	inputStyle: {
		color: colors.black,
		backgroundColor: colors.g2,
		paddingVertical: WP('3'),
		paddingHorizontal: WP('3'),
	},
	textStyle: {
		color: colors.white,
		fontFamily: family.roboto_medium,
		fontSize: size.medium,
		marginBottom: WP('2'),
	},
	errorTxtStyle: {
		top: WP('1'),
		color: colors.r1,
		fontSize: size.tiny,
		fontFamily: family.roboto_regular,
	},
});

AppInput.propTypes = {
	title: PropTypes.string,
	placeholder: PropTypes.string,
	value: PropTypes.string,
	onChangeText: PropTypes.func,
	errorMessage: PropTypes.string,
	editable: PropTypes.bool,
};

export {AppInput};
