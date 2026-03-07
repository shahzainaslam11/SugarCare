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
    .required('Password Required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter'),
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
  diet_type: '',
  activity_level: '',
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

  name: yup
    .string()
    .required('Name Required')
    .min(2, 'Name too short')
    .matches(/^[a-zA-Z\s]*$/, 'Name should only contain letters'),

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

  diet_type: yup
    .string()
    .required('Diet Type Required')
    .oneOf(['balanced', 'high_carb', 'low_carb'], 'Invalid diet type'),

  activity_level: yup
    .string()
    .required('Activity Level Required')
    .oneOf(['low', 'moderate', 'high'], 'Invalid activity level'),

  cholesterol: yup
    .number()
    .typeError('Cholesterol must be a number')
    .min(50, 'Cholesterol too low')
    .max(600, 'Cholesterol too high')
    .required('Cholesterol Required'),

  hba1c: yup
    .number()
    .typeError('HbA1c must be a number')
    .min(2.0, 'HbA1c too low (normal range starts at ~4.0)')
    .max(20.0, 'HbA1c too high (maximum realistic value is ~20)')
    .required('HbA1c Required'),

  usingInsulin: yup.boolean(),

  password: yup
    .string()
    .required('Password Required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter'),

  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords do not match')
    .required('Confirm Password Required'),
});

export const normalizeEmail = email => email?.trim().toLowerCase();
