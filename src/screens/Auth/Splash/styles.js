import {StyleSheet} from 'react-native';
import {colors, HP, WP} from '../../../utilities';

const styles = StyleSheet.create({
	main: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: colors.p1,
	},
	imageStyles: {
		width: WP('60'),
		height: HP('20'),
		alignSelf: 'center',
	},
});

export default styles;
