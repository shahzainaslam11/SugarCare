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
  name: '',
  gender: '',
  age: '',
  height: '',
  weight: '',
  diabetesType: '',
  cholesterol: '',
  usingInsulin: false,
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

  name: yup.string().required('Name Required').min(2, 'Name too short'),

  gender: yup
    .string()
    .required('Gender Required')
    .oneOf(['male', 'female', 'other'], 'Invalid gender'),

  age: yup
    .number()
    .typeError('Age must be a number')
    .min(1, 'Age must be at least 1')
    .max(120, 'Age seems invalid')
    .required('Age Required'),

  height: yup
    .number()
    .typeError('Height must be a number')
    .min(30, 'Height seems too low')
    .max(300, 'Height seems invalid')
    .required('Height Required'),

  weight: yup
    .number()
    .typeError('Weight must be a number')
    .min(2, 'Weight seems too low')
    .max(500, 'Weight seems invalid')
    .required('Weight Required'),

  diabetesType: yup
    .string()
    .required('Diabetes Type Required')
    .oneOf(
      ['Type 1', 'Type 2', 'Prediabetes', 'Gestational', 'None'],
      'Invalid diabetes type',
    ),

  cholesterol: yup
    .number()
    .typeError('Cholesterol must be a number')
    .min(50, 'Cholesterol too low')
    .max(600, 'Cholesterol too high')
    .required('Cholesterol Required'),

  usingInsulin: yup.boolean(),

  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password Required'),

  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords do not match')
    .required('Confirm Password Required'),
});
