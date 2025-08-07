import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {appIcons, colors, family, HP, size, WP} from '../../utilities';
import PropTypes from 'prop-types';

const Header = ({
	image,
	title,
	onPress,
	onPressRight,
	containerStyle,
	isBack = true,
	titleStyle,
	numberOfLines,
}) => {
	return (
		<View style={[styles.mainContainer, containerStyle]}>
			<TouchableOpacity onPress={onPress}>
				{isBack && (
					<Image
						source={appIcons.back_arrow}
						style={styles.iconStyle}
						resizeMode="contain"
					/>
				)}
			</TouchableOpacity>
			<Text
				numberOfLines={numberOfLines}
				style={[styles.textStyle, titleStyle]}>
				{title}
			</Text>
			{image ? (
				<TouchableOpacity onPress={onPressRight} style={styles.iconButton}>
					<Image source={image} style={styles.imgStyle} />
				</TouchableOpacity>
			) : (
				<View style={styles.viewStyle} />
			)}
		</View>
	);
};

Header.propTypes = {
	image: PropTypes.object || PropTypes.any,
	title: PropTypes.string,
	onPress: PropTypes.func,
	onPressRight: PropTypes.func,
	containerStyle: PropTypes.object,
	isBack: PropTypes.bool,
	titleStyle: PropTypes.object,
	numberOfLines: PropTypes.number,
};

const styles = StyleSheet.create({
	mainContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: colors.p2,
		paddingHorizontal: WP('3'),
		paddingVertical: WP('3'),
	},
	textStyle: {
		color: colors.white,
		fontFamily: family.roboto_medium,
		fontSize: size.h3,
		textAlign: 'center',
		width: '70%',
	},
	iconStyle: {
		width: WP('5'),
		height: HP('5'),
		marginLeft: WP('4'),
	},
	imgStyle: {
		width: WP('5'),
		height: WP('5'),
		resizeMode: 'contain',
		tintColor: colors.white,
	},
	viewStyle: {
		padding: WP('3'),
	},
	iconButton: {
		padding: WP('2'),
	},
});

export {Header};
