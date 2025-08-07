import {
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	Platform,
	ActivityIndicator,
} from 'react-native';
import React, {Fragment} from 'react';
import {colors, family, HP, size, WP} from '../../utilities';
import PropTypes from 'prop-types';

const AppButton = ({
	title,
	backgroundColor = colors.p2,
	icon,
	onPress,
	containerStyle,
	titleStyle,
	loading,
	loaderColor = colors.white,
	disabled,
}) => {
	return (
		<TouchableOpacity
			onPress={onPress}
			disabled={disabled}
			style={[
				styles.mainContainer,
				containerStyle,
				{backgroundColor: backgroundColor},
			]}>
			{loading ? (
				<ActivityIndicator size={'small'} color={loaderColor} />
			) : (
				<Fragment>
					{icon && <Image source={icon} style={styles.iconStyle} />}
					<Text style={[styles.textStyle, titleStyle]}>{title}</Text>
				</Fragment>
			)}
		</TouchableOpacity>
	);
};

AppButton.propTypes = {
	title: PropTypes.string,
	backgroundColor: PropTypes.string,
	icon: PropTypes.any,
	onPress: PropTypes.func,
	containerStyle: PropTypes.object,
	titleStyle: PropTypes.object,
	loading: PropTypes.bool,
	loaderColor: PropTypes.string,
	disabled: PropTypes.bool,
};

export {AppButton};

const styles = StyleSheet.create({
	mainContainer: {
		flexDirection: 'row',
		backgroundColor: colors.p2,
		width: '100%',
		padding: 10,
		borderRadius: 7,
		marginVertical: WP('1.5'),
		alignItems: 'center',
		justifyContent: 'center',
	},
	textStyle: {
		color: colors.white,
		textAlign: 'center',
		fontFamily: family.roboto_bold,
		marginLeft: WP('2'),
		fontSize: Platform.OS == 'ios' ? size.large : size.normal,
	},
	iconStyle: {
		width: WP('6'),
		height: HP('3'),
		resizeMode: 'contain',
	},
});
