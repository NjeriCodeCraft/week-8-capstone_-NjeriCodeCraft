import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AgentRegisterSchema = Yup.object().shape({
  bio: Yup.string().min(50, 'Bio must be at least 50 characters').required('Bio is required'),
  experience: Yup.number().min(0, 'Experience must be positive').required('Experience is required'),
  baseRate: Yup.number().min(1000, 'Base rate must be at least 1000 KES').required('Base rate is required'),
  workingDays: Yup.array().min(1, 'Select at least one working day').required('Working days are required'),
  workingHours: Yup.object().shape({
    start: Yup.string().required('Start time is required'),
    end: Yup.string().required('End time is required'),
  }),
  languages: Yup.array().min(1, 'Select at least one language').required('Languages are required'),
  specializations: Yup.array().min(1, 'Select at least one specialization').required('Specializations are required'),
});

const workingDaysOptions = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

const languageOptions = [
  { value: 'english', label: 'English' },
  { value: 'swahili', label: 'Swahili' },
  { value: 'kikuyu', label: 'Kikuyu' },
  { value: 'luhya', label: 'Luhya' },
  { value: 'luo', label: 'Luo' },
  { value: 'kamba', label: 'Kamba' },
];

const specializationOptions = [
  { value: 'residential', label: 'Residential Properties' },
  { value: 'student_housing', label: 'Student Housing' },
  { value: 'luxury', label: 'Luxury Properties' },
  { value: 'budget', label: 'Budget Properties' },
  { value: 'family_homes', label: 'Family Homes' },
  { value: 'single_rooms', label: 'Single Rooms/Bedsitters' },
];

const AgentRegister = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F8FA] font-sans" style={{ fontFamily: 'Inter, Poppins, Rubik, sans-serif' }}>
      <div className="bg-white rounded-lg shadow-md p-10 w-full max-w-md" style={{ borderRadius: '12px' }}>
        <h2 className="text-3xl font-bold mb-6" style={{ color: '#1A73E8' }}>Agent Registration</h2>
        <p className="text-[#5F6C7B] mb-6 text-center">
          Help people find their perfect home and earn money doing what you love!
        </p>
        <Formik
          initialValues={{
            bio: '',
            experience: '',
            baseRate: '',
            workingDays: [],
            workingHours: { start: '09:00', end: '17:00' },
            languages: [],
            specializations: [],
          }}
          validationSchema={AgentRegisterSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setError(null);
            setLoading(true);
            try {
              await axios.post(`${API_BASE_URL}/api/agents/register`, values);
              setLoading(false);
              navigate('/agent/dashboard');
            } catch (err) {
              setError(err.response?.data?.message || 'Registration failed');
              setLoading(false);
            }
            setSubmitting(false);
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <Field
                  as="textarea"
                  name="bio"
                  rows={4}
                  placeholder="Tell us about your experience in real estate, why you want to be an agent, and what makes you great at helping people find homes..."
                  className="w-full rounded border-gray-300"
                />
                {errors.bio && touched.bio && <div className="text-xs text-red-500 mt-1">{errors.bio}</div>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Years of Experience</label>
                  <Field name="experience" type="number" min="0" className="w-full rounded border-gray-300" />
                  {errors.experience && touched.experience && <div className="text-xs text-red-500 mt-1">{errors.experience}</div>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Base Rate (KES)</label>
                  <Field name="baseRate" type="number" min="1000" className="w-full rounded border-gray-300" />
                  {errors.baseRate && touched.baseRate && <div className="text-xs text-red-500 mt-1">{errors.baseRate}</div>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Working Days</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {workingDaysOptions.map((day) => (
                    <label key={day.value} className="flex items-center">
                      <Field
                        type="checkbox"
                        name="workingDays"
                        value={day.value}
                        className="rounded border-gray-300"
                      />
                      <span className="ml-2 text-sm">{day.label}</span>
                    </label>
                  ))}
                </div>
                {errors.workingDays && touched.workingDays && <div className="text-xs text-red-500 mt-1">{errors.workingDays}</div>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Time</label>
                  <Field name="workingHours.start" type="time" className="w-full rounded border-gray-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Time</label>
                  <Field name="workingHours.end" type="time" className="w-full rounded border-gray-300" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Languages You Speak</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {languageOptions.map((lang) => (
                    <label key={lang.value} className="flex items-center">
                      <Field
                        type="checkbox"
                        name="languages"
                        value={lang.value}
                        className="rounded border-gray-300"
                      />
                      <span className="ml-2 text-sm">{lang.label}</span>
                    </label>
                  ))}
                </div>
                {errors.languages && touched.languages && <div className="text-xs text-red-500 mt-1">{errors.languages}</div>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Specializations</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {specializationOptions.map((spec) => (
                    <label key={spec.value} className="flex items-center">
                      <Field
                        type="checkbox"
                        name="specializations"
                        value={spec.value}
                        className="rounded border-gray-300"
                      />
                      <span className="ml-2 text-sm">{spec.label}</span>
                    </label>
                  ))}
                </div>
                {errors.specializations && touched.specializations && <div className="text-xs text-red-500 mt-1">{errors.specializations}</div>}
              </div>

              {error && <p className="text-[#FF6B6B] mt-2">{error}</p>}
              <button
                type="submit"
                className="bg-[#FF6B6B] hover:bg-[#FF4D4D] text-white w-full py-3 mt-4 rounded-md shadow-md font-semibold transition-all duration-300"
                disabled={loading}
              >
                {loading ? 'Submitting Application...' : 'Submit Application'}
              </button>
              <div className="text-center text-sm mt-4 text-[#5F6C7B]">
                <Link to="/app" className="text-[#1A73E8] hover:underline">
                  ← Back to Search
                </Link>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default AgentRegister; 