export const colors = {
	//Screens bg colors
	bgColor: '#FFFFFF',
	b1: '#333333',
	b2: '#4D4D4D',
	b3: '#00000080',
	b4: '#242424',
	b5: '#383838',
	b6: '#13151763',
	b7: '#000000CC',
	b8: '#292139',

	//Primary Colours
	p1: '#1B2E42',
	p2: '#2165A2',
	p3: '#202F39',
	p4: '#1DA0F2',
	p5: '#39559F',
	p6: '#299AFF40',
	p7: '#2165A230',
	p8: '#288EBF',
	p9: '#299AFF',
	p10: '#243E58',
	p11: '#2165A24D',
	p12: '#CCE7F9',

	//Secondary Colours
	s1: '#E97A53',
	s2: '#EA8A40',
	s3: '#ED9C2A',
	s4: '#EFAC17',

	//GrayScale
	g1: '#969696',
	g2: '#A0A0A0',
	g3: '#787878',
	g4: '#D9D9D9',
	g5: '#605F5F',
	g6: '#B3B3B3',
	g7: '#C0C0C0',
	g8: '#B4B4B4',
	g9: '#888888',
	g10: '#A7A7A7',
	g11: '#CECECE',
	g12: '#ADADAD',
	g13: '#F5F5F5',
	g14: '#9D9D9D',
	g15: '#E0E0E0',
	g16: '#ADA4A5',
	g17: '#535353',

	//BorderWidthColors
	bw1: '#EBA023',
	bw2: '#8B10D1',
	bw3: '#2F9E38',
	bw4: '#EBA023',

	//Green
	gr1: '#038B21',

	//FontColor
	f1: '#6969B3',
	//******************- Gradients -*******************/

	//Primary Gradient
	p_gradient: ['#FF8F8E', '#E79069'],
	//Secondary Gradient
	s_gradient: ['#E79069', '#E7BB69'],
	//Anonymous Gradient
	a_gradient: ['#2713C4', '#1F026E'],
	//Distinct Gradient
	d_gradient: ['#F59695', '#1D00FF'],
	//Button Gradient
	btn_gradient: ['#ff9d9c', '#f99f9c'],
	//Groups Gradient
	g_gradient: ['#00A765', '#28D591'],
	//Pings Gradient
	pings_gradient: ['#E97A53', '#E04948'],
	//Groups Gradient
	pink_header_gradient: ['#E04948', '#F59695'],

	button_gradient: [
		'rgba(247, 128, 123, 0.701961)',
		'rgba(247, 128, 123, 0.901961)',
	],

	topic_button_gradient: ['#FF8A89', '#E79069'],
	//Buttons colors
	buttonColor: '#72BFBD',
	buttonColorLight: '#E7EAE2',
	//orange
	orange: '#F48874',
	skyOrange: '#EC9731',
	lightOrange: '#EE9D2A',
	//red
	red: '#D25053',
	r1: '#FF0000',
	r2: '#D10C0C',
	r3: '#FF6161',
	// Decorator color @
	skyBlue: '#64C0F9',
	magenta: 'rgb(18, 0,255)',
	lightGreen: '#63DAA1',
	green: '#20BF55',
	gr2: '#248A00',
	gr3: '#159600',

	//Black colors#F59695
	drakBlack: '#000000',
	black: '#353534', //#353534
	lightBlack: '#323232',
	blackTransparent: 'rgba(0,0,0,0.5)',
	//Grey colors
	darkGrey: '#4c4c4c',
	mediumGrey: '#999999',
	xmediumGrey: '#707070',
	lightGrey: '#919191',
	extraLight: 'rgb(177,177,177)',
	xlight: 'rgba(0,0,0,0.05)',
	xxlight: 'rgb(224,224,224)',
	progressBackgroundColor: 'rgba(0,0,0,0.032)',
	bottomSheetHeader: '#EDEFF1',
	//White colors
	white: '#ffffff',
	//Pink color
	lightPink: '#FFF5F5',
	placeholder: '#F1F1F1',

	loaderBg: 'rgba(0,0,0, 0.5)',
	bottomTabBg: '#ffffff00',
	black50: '#00000050',
};

export const getSWOTcolors = text => {
	switch (text) {
	case 'STRENGTHS':
		return colors.green;
	case 'THREATS':
		return colors.f1;
	default:
		return colors.green;
	}
};
