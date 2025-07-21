import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const LoginSchema = Yup.object().shape({
  emailOrPhone: Yup.string().required('Email or phone is required'),
  password: Yup.string().required('Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F8FA] font-sans" style={{ fontFamily: 'Inter, Poppins, Rubik, sans-serif' }}>
      <div className="bg-white rounded-lg shadow-md p-10 w-full max-w-md" style={{ borderRadius: '12px' }}>
        <h2 className="text-3xl font-bold mb-6" style={{ color: '#1A73E8' }}>Login</h2>
        <Formik
          initialValues={{ emailOrPhone: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setError(null);
            setLoading(true);
            try {
              await login(values.emailOrPhone, values.password);
              setLoading(false);
              navigate('/app');
            } catch (err) {
              setError(err.response?.data?.message || 'Login failed');
              setLoading(false);
            }
            setSubmitting(false);
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Email or Phone</label>
                <Field name="emailOrPhone" className="mt-1 block w-full rounded border-gray-300" />
                {errors.emailOrPhone && touched.emailOrPhone && <div className="text-xs text-red-500">{errors.emailOrPhone}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium">Password</label>
                <Field name="password" type="password" className="mt-1 block w-full rounded border-gray-300" />
                {errors.password && touched.password && <div className="text-xs text-red-500">{errors.password}</div>}
              </div>
              {error && <p className="text-[#FF6B6B] mt-2">{error}</p>}
              <button
                type="submit"
                className="bg-[#FF6B6B] hover:bg-[#FF4D4D] text-white w-full py-3 mt-4 rounded-md shadow-md font-semibold transition-all duration-300"
                disabled={isSubmitting || loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
              <div className="text-center text-sm mt-2 text-[#5F6C7B]">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="text-[#1A73E8] hover:underline">Register</Link>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Login; 