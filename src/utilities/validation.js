import * as yup from 'yup';

export const loginFormFields = {
	email: '',
	password: '',
};


export const loginVS = yup.object().shape({
	email: yup
		.string()
		.required('Email Required')
		.email('Please provide a valid email address'),
	password: yup
		.string()
		.min(6, 'Password must be at least 6 characters')
		.required('Password Required'),
});





