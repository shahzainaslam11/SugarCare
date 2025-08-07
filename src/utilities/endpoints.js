//BASEURL
//TODO:
const isProduction = false;
const BASE_URL = isProduction
	? 'https://'
	: 'https://';

const ENDPOINTS = {
	LOGIN: 'login',
	SIGNUP: 'register',
	
};

export {BASE_URL, ENDPOINTS};
