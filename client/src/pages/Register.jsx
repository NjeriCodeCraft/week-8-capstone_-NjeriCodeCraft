import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const RegisterSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string().required('Phone is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm your password'),
});

const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F8FA] font-sans" style={{ fontFamily: 'Inter, Poppins, Rubik, sans-serif' }}>
      <div className="bg-white rounded-lg shadow-md p-10 w-full max-w-md" style={{ borderRadius: '12px' }}>
        <h2 className="text-3xl font-bold mb-6" style={{ color: '#1A73E8' }}>Register</h2>
        <Formik
          initialValues={{ name: '', email: '', phone: '', password: '', confirmPassword: '' }}
          validationSchema={RegisterSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setError(null);
            setLoading(true);
            try {
              const res = await axios.post(`${API_BASE_URL}/api/auth/register`, {
                name: values.name,
                email: values.email,
                phone: values.phone,
                password: values.password,
              });
              localStorage.setItem('token', res.data.token);
              setLoading(false);
              navigate('/app');
            } catch (err) {
              setError(err.response?.data?.message || 'Registration failed');
              setLoading(false);
            }
            setSubmitting(false);
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Name</label>
                <Field name="name" className="mt-1 block w-full rounded border-gray-300" />
                {errors.name && touched.name && <div className="text-xs text-red-500">{errors.name}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium">Email</label>
                <Field name="email" type="email" className="mt-1 block w-full rounded border-gray-300" />
                {errors.email && touched.email && <div className="text-xs text-red-500">{errors.email}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium">Phone</label>
                <Field name="phone" className="mt-1 block w-full rounded border-gray-300" />
                {errors.phone && touched.phone && <div className="text-xs text-red-500">{errors.phone}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium">Password</label>
                <Field name="password" type="password" className="mt-1 block w-full rounded border-gray-300" />
                {errors.password && touched.password && <div className="text-xs text-red-500">{errors.password}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium">Confirm Password</label>
                <Field name="confirmPassword" type="password" className="mt-1 block w-full rounded border-gray-300" />
                {errors.confirmPassword && touched.confirmPassword && <div className="text-xs text-red-500">{errors.confirmPassword}</div>}
              </div>
              {error && <p className="text-[#FF6B6B] mt-2">{error}</p>}
              <button
                type="submit"
                className="bg-[#FF6B6B] hover:bg-[#FF4D4D] text-white w-full py-3 mt-4 rounded-md shadow-md font-semibold transition-all duration-300"
                disabled={isSubmitting || loading}
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
              <div className="text-center text-sm mt-2 text-[#5F6C7B]">
                Already have an account?{' '}
                <Link to="/login" className="text-[#1A73E8] hover:underline">Login</Link>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Register; 