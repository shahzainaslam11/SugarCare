import * as yup from 'yup';

export const loginFormFields = {
  email: '',
  password: '',
  rememberMe: false,
};

export const loginVS = yup.object().shape({
  email: yup
    .string()
    .required('Email Required')
    .matches(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address',
    ),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password Required'),
});

// SignUp form fields
export const signUpFormFields = {
  email: '',
  password: '',
  confirmPassword: '',
};

// SignUp validation schema
export const signUpVS = yup.object().shape({
  email: yup
    .string()
    .required('Email Required')
    .matches(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address',
    ),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password Required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords do not match')
    .required('Confirm Password Required'),
});
