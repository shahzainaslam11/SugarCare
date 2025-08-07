import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import {appIcons, colors, family, size, WP} from '../../utilities';
import PropTypes from 'prop-types';

const DropDown = ({value, data, onSelect, title}) => {
	const [show, setShow] = useState(false);
	const onSelectedItem = item => {
		setShow(false);
		onSelect(item);
	};
	return (
		<View>
			<Text style={styles.titleStyle}>{title}</Text>
			<TouchableOpacity
				style={styles.mainContainer}
				onPress={() => setShow(!show)}>
				<Text>{''}</Text>
				<Text style={styles.textStyle}>
					{value ? value?.name : 'Select Item'}
				</Text>
				<Image source={appIcons.polygon} style={styles.iconStyle} />
			</TouchableOpacity>
			{show && (
				<View style={styles.dropbg}>
					{data.map((item, index) => {
						return (
							<TouchableOpacity
								key={String(index)}
								style={[
									styles.dropbg,
									{
										width: '100%',
										backgroundColor:
											value.id === item.id ? colors.p6 : colors.white,
									},
								]}
								onPress={() => onSelectedItem(item)}>
								<Text
									style={[
										styles.itemStyle,
										{color: value.id === item.id ? colors.p2 : colors.b1},
									]}>
									{' '}
									{item?.name}
								</Text>
							</TouchableOpacity>
						);
					})}
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	mainContainer: {
		padding: WP('4'),
		borderRadius: 14,
		borderWidth: 1,
		borderColor: colors.white,
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	textStyle: {
		color: colors.white,
		fontFamily: family.roboto_medium,
		fontSize: size.large,
	},
	iconStyle: {
		width: WP('5'),
		height: WP('5'),
		resizeMode: 'contain',
		transform: [{rotate: '-180deg'}],
	},
	dropbg: {
		width: '94%',
		alignSelf: 'center',
		borderBottomEndRadius: 4,
		borderBottomStartRadius: 4,
		backgroundColor: colors.white,
	},
	itemStyle: {
		color: colors.white,
		fontFamily: family.roboto_medium,
		fontSize: size.normal,
		marginVertical: WP('3'),
		marginLeft: WP('10'),
	},
	titleStyle: {
		color: colors.white,
		fontFamily: family.roboto_medium,
		marginVertical: WP('2'),
		marginTop: WP('7'),
		fontSize: size.large,
	},
});

DropDown.propTypes = {
	value: PropTypes.object || PropTypes.any,
	data: PropTypes.array,
	onSelect: PropTypes.func,
	title: PropTypes.string,
};

export {DropDown};
