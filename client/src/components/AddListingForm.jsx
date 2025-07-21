import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AddListingSchema = Yup.object().shape({
  title: Yup.string().min(10, 'Title must be at least 10 characters').required('Title is required'),
  description: Yup.string().min(50, 'Description must be at least 50 characters').required('Description is required'),
  price: Yup.number().min(1000, 'Price must be at least 1000 KES').required('Price is required'),
  propertyType: Yup.string().required('Property type is required'),
  bedrooms: Yup.number().min(0, 'Bedrooms must be 0 or more').required('Number of bedrooms is required'),
  bathrooms: Yup.number().min(0, 'Bathrooms must be 0 or more').required('Number of bathrooms is required'),
  address: Yup.object().shape({
    street: Yup.string().required('Street address is required'),
    city: Yup.string().required('City is required'),
    state: Yup.string().required('State/County is required'),
    zipCode: Yup.string().required('Zip code is required'),
  }),
  amenities: Yup.array().min(1, 'Select at least one amenity'),
});

const propertyTypes = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'studio', label: 'Studio' },
  { value: 'bedsitter', label: 'Bedsitter' },
  { value: 'single_room', label: 'Single Room' },
  { value: 'shared_room', label: 'Shared Room' },
];

const amenitiesOptions = [
  { value: 'wifi', label: 'WiFi' },
  { value: 'parking', label: 'Parking' },
  { value: 'security', label: 'Security' },
  { value: 'water', label: 'Water' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'bathroom', label: 'Bathroom' },
  { value: 'balcony', label: 'Balcony' },
  { value: 'garden', label: 'Garden' },
  { value: 'furnished', label: 'Furnished' },
];

const AddListingForm = ({ onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 6);
    setImageFiles(files);
    setImagePreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleUploadImages = async () => {
    if (imageFiles.length === 0) return [];
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      imageFiles.forEach(f => formData.append('images', f));
      const res = await axios.post(`${API_BASE_URL}/api/listings/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploading(false);
      return res.data.urls;
    } catch (err) {
      setUploadError('Failed to upload images');
      setUploading(false);
      return [];
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">Add New Listing</h2>
      
      <Formik
        initialValues={{
          title: '',
          description: '',
          price: '',
          propertyType: '',
          bedrooms: '',
          bathrooms: '',
          address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
          },
          amenities: [],
          images: [],
        }}
        validationSchema={AddListingSchema}
        onSubmit={async (values, { setSubmitting, resetForm }) => {
          setError(null);
          setLoading(true);
          let imageUrls = [];
          if (imageFiles.length > 0) {
            imageUrls = await handleUploadImages();
            if (uploadError) {
              setLoading(false);
              return;
            }
          }
          try {
            await axios.post(`${API_BASE_URL}/api/listings`, {
              ...values,
              images: imageUrls.map(url => ({ url })),
            });
            setLoading(false);
            resetForm();
            setImageFiles([]);
            setImagePreviews([]);
            if (onSuccess) onSuccess();
          } catch (err) {
            setError(err.response?.data?.message || 'Failed to create listing');
            setLoading(false);
          }
          setSubmitting(false);
        }}
      >
        {({ errors, touched, values, setFieldValue }) => (
          <Form className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <Field
                name="title"
                placeholder="e.g., Beautiful 2-bedroom apartment in Westlands"
                className="w-full rounded border-gray-300"
              />
              {errors.title && touched.title && <div className="text-xs text-red-500 mt-1">{errors.title}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Field
                as="textarea"
                name="description"
                rows={4}
                placeholder="Describe the property, its features, location benefits, etc..."
                className="w-full rounded border-gray-300"
              />
              {errors.description && touched.description && <div className="text-xs text-red-500 mt-1">{errors.description}</div>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Price (KES)</label>
                <Field name="price" type="number" min="1000" className="w-full rounded border-gray-300" />
                {errors.price && touched.price && <div className="text-xs text-red-500 mt-1">{errors.price}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Property Type</label>
                <Field as="select" name="propertyType" className="w-full rounded border-gray-300">
                  <option value="">Select type</option>
                  {propertyTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </Field>
                {errors.propertyType && touched.propertyType && <div className="text-xs text-red-500 mt-1">{errors.propertyType}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Bedrooms</label>
                <Field name="bedrooms" type="number" min="0" className="w-full rounded border-gray-300" />
                {errors.bedrooms && touched.bedrooms && <div className="text-xs text-red-500 mt-1">{errors.bedrooms}</div>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bathrooms</label>
              <Field name="bathrooms" type="number" min="0" className="w-full rounded border-gray-300" />
              {errors.bathrooms && touched.bathrooms && <div className="text-xs text-red-500 mt-1">{errors.bathrooms}</div>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Street Address</label>
                <Field name="address.street" className="w-full rounded border-gray-300" />
                {errors.address?.street && touched.address?.street && <div className="text-xs text-red-500 mt-1">{errors.address.street}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <Field name="address.city" className="w-full rounded border-gray-300" />
                {errors.address?.city && touched.address?.city && <div className="text-xs text-red-500 mt-1">{errors.address.city}</div>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">State/County</label>
                <Field name="address.state" className="w-full rounded border-gray-300" />
                {errors.address?.state && touched.address?.state && <div className="text-xs text-red-500 mt-1">{errors.address.state}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Zip Code</label>
                <Field name="address.zipCode" className="w-full rounded border-gray-300" />
                {errors.address?.zipCode && touched.address?.zipCode && <div className="text-xs text-red-500 mt-1">{errors.address.zipCode}</div>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Amenities</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {amenitiesOptions.map((amenity) => (
                  <label key={amenity.value} className="flex items-center">
                    <Field
                      type="checkbox"
                      name="amenities"
                      value={amenity.value}
                      className="rounded border-gray-300"
                    />
                    <span className="ml-2 text-sm">{amenity.label}</span>
                  </label>
                ))}
              </div>
              {errors.amenities && touched.amenities && <div className="text-xs text-red-500 mt-1">{errors.amenities}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Images (up to 6)</label>
              <input type="file" accept="image/*" multiple onChange={handleImageChange} />
              <div className="flex gap-2 mt-2">
                {imagePreviews.map((src, i) => (
                  <img key={i} src={src} alt="preview" className="h-20 w-28 object-cover rounded" />
                ))}
              </div>
              {uploadError && <div className="text-red-600 text-sm">{uploadError}</div>}
            </div>

            {error && <div className="text-red-600 text-sm text-center">{error}</div>}
            
            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded shadow"
                disabled={loading || uploading}
              >
                {loading ? 'Creating Listing...' : 'Create Listing'}
              </button>
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 px-4 rounded shadow"
                >
                  Cancel
                </button>
              )}
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AddListingForm; 