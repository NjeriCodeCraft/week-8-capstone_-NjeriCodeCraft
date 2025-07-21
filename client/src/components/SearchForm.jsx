import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

const amenitiesList = [
  { name: 'water', label: 'Good Water' },
  { name: 'electricity', label: 'Good Power' },
  { name: 'wifi', label: 'WiFi' },
  { name: 'security', label: 'Security' },
  { name: 'parking', label: 'Parking' },
  { name: 'kitchen', label: 'Kitchen' },
  { name: 'balcony', label: 'Balcony' },
  { name: 'furnished', label: 'Furnished' },
];

const propertyTypes = [
  'apartment',
  'house',
  'condo',
  'townhouse',
  'studio',
  'bedsitter',
];

const SearchSchema = Yup.object().shape({
  location: Yup.string().required('Location is required'),
  minPrice: Yup.number().min(0, 'Min price must be positive').nullable(),
  maxPrice: Yup.number().min(0, 'Max price must be positive').nullable(),
  bedrooms: Yup.number().min(0, 'Bedrooms must be positive').nullable(),
  bathrooms: Yup.number().min(0, 'Bathrooms must be positive').nullable(),
});

const initialValues = {
  location: '',
  minPrice: '',
  maxPrice: '',
  propertyType: '',
  bedrooms: '',
  bathrooms: '',
  amenities: [],
};

const SearchForm = ({ onSearch }) => {
  return (
    <div className="bg-card shadow rounded-lg p-6 max-w-3xl mx-auto mt-8">
      <Formik
        initialValues={initialValues}
        validationSchema={SearchSchema}
        onSubmit={(values) => {
          if (onSearch) onSearch(values);
        }}
      >
        {({ values, errors, touched, handleChange, handleBlur }) => (
          <Form className="glass-panel p-4 flex items-center space-x-2">
            <Field
              name="location"
              placeholder="Enter location..."
              className="border border-blue rounded px-3 py-2 text-heading focus:outline-none focus:ring-2 focus:ring-blue"
            />
            <button type="submit" className="bg-accent-500 text-white hover:bg-blue px-4 py-2 rounded transition">Search</button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default SearchForm; 