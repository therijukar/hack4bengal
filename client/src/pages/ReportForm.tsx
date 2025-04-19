import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Stepper, 
  Step, 
  StepLabel, 
  Button, 
  Typography, 
  Paper, 
  Grid,
  TextField,
  FormControlLabel,
  Switch,
  MenuItem,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import { Formik, Form, FormikProps } from 'formik';
import * as Yup from 'yup';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Define the steps for the multi-page form
const steps = ['Incident Details', 'Location', 'Media Upload', 'Review & Submit'];

// Define the form initial values
interface ReportFormValues {
  incidentType: 'physical' | 'cyber' | 'harassment' | 'other';
  incidentDescription: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  mediaFiles: File[];
  isAnonymous: boolean;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
}

const initialValues: ReportFormValues = {
  incidentType: 'physical',
  incidentDescription: '',
  location: {
    lat: 22.572645,  // Default location (Kolkata)
    lng: 88.363892,
    address: '',
  },
  mediaFiles: [],
  isAnonymous: false,
  contactInfo: {
    name: '',
    email: '',
    phone: '',
  },
};

// Location Marker component for the map
interface LocationMarkerProps {
  setFieldValue: (field: string, value: any) => void;
  currentLocation: { lat: number; lng: number };
}

const LocationMarker: React.FC<LocationMarkerProps> = ({ setFieldValue, currentLocation }) => {
  const [position, setPosition] = useState(currentLocation);
  
  const map = useMapEvents({
    click(e: any) {
      const { lat, lng } = e.latlng;
      setPosition({ lat, lng });
      setFieldValue('location.lat', lat);
      setFieldValue('location.lng', lng);
      
      // Attempt to get address from coordinates using reverse geocoding
      fetchAddress(lat, lng, setFieldValue);
    },
  });

  return <Marker position={position} />;
};

// Fetch address from coordinates using reverse geocoding
const fetchAddress = async (lat: number, lng: number, setFieldValue: (field: string, value: any) => void) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    
    if (response.data && response.data.display_name) {
      setFieldValue('location.address', response.data.display_name);
    }
  } catch (error) {
    console.error('Error fetching address:', error);
  }
};

// File preview component
interface FilePreviewProps {
  file: File;
  onRemove: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, onRemove }) => {
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={9}>
            <Typography variant="subtitle1">{file.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {(file.size / 1024 / 1024).toFixed(2)} MB | {file.type}
            </Typography>
          </Grid>
          <Grid item xs={3} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Button color="error" onClick={onRemove}>
              Remove
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const ReportForm: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const navigate = useNavigate();
  
  // Handle moving to the next step
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  // Handle moving to the previous step
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Handle form submission
  const handleSubmit = async (values: ReportFormValues) => {
    console.log('Submit function called!', values);
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Use FormData to handle file uploads
      const formData = new FormData();
      
      // Add text data
      formData.append('incidentType', values.incidentType);
      formData.append('description', values.incidentDescription);
      formData.append('location', JSON.stringify(values.location));
      formData.append('isAnonymous', String(values.isAnonymous));
      
      if (!values.isAnonymous) {
        formData.append('contactInfo', JSON.stringify(values.contactInfo));
      }
      
      // Add media files
      values.mediaFiles.forEach((file, index) => {
        formData.append(`media`, file);
      });
      
      // Get auth token if available
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {};
      
      // Only add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Real API call to the backend with FormData
      const response = await fetch('http://localhost:3001/api/reports', {
        method: 'POST',
        headers,
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit report');
      }
      
      // Form submitted successfully
      setSubmitSuccess(true);
      console.log('Submit success set to true');
      
      // Redirect to success page or home after a delay
      setTimeout(() => {
        console.log('Navigating to home');
        navigate('/');
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting report:', error);
      setSubmitError('An error occurred while submitting your report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render step content based on the active step
  const renderStepContent = (step: number, formikProps: FormikProps<ReportFormValues>) => {
    const { values, errors, touched, handleChange, setFieldValue } = formikProps;
    
    switch (step) {
      case 0: // Incident Details
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Incident Details
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  name="incidentType"
                  label="Incident Type"
                  value={values.incidentType}
                  onChange={handleChange}
                  error={touched.incidentType && Boolean(errors.incidentType)}
                  helperText={touched.incidentType && errors.incidentType}
                >
                  <MenuItem value="physical">Physical Violence</MenuItem>
                  <MenuItem value="cyber">Cyber Violence/Harassment</MenuItem>
                  <MenuItem value="harassment">Harassment/Stalking</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="incidentDescription"
                  label="Describe what happened"
                  multiline
                  rows={6}
                  value={values.incidentDescription}
                  onChange={handleChange}
                  error={touched.incidentDescription && Boolean(errors.incidentDescription)}
                  helperText={touched.incidentDescription && errors.incidentDescription}
                  placeholder="Please provide details about the incident. What happened? When did it occur? Were there any witnesses?"
                />
              </Grid>
            </Grid>
          </Box>
        );
        
      case 1: // Location
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Incident Location
            </Typography>
            <Typography variant="body2" gutterBottom color="text.secondary">
              Click on the map to set the location where the incident occurred
            </Typography>
            
            <Box sx={{ height: 400, width: '100%', mb: 2 }}>
              <MapContainer 
                center={[values.location.lat, values.location.lng]} 
                zoom={13} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker 
                  setFieldValue={setFieldValue} 
                  currentLocation={{ lat: values.location.lat, lng: values.location.lng }}
                />
              </MapContainer>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="location.lat"
                  label="Latitude"
                  value={values.location.lat}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="location.lng"
                  label="Longitude"
                  value={values.location.lng}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="location.address"
                  label="Address"
                  value={values.location.address}
                  onChange={handleChange}
                  placeholder="Address will be automatically filled when you select a location on the map"
                />
              </Grid>
            </Grid>
          </Box>
        );
        
      case 2: // Media Upload
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Upload Evidence
            </Typography>
            <Typography variant="body2" gutterBottom color="text.secondary">
              Upload photos, videos, or documents related to the incident (maximum 5 files, 20MB each)
            </Typography>
            
            <Box sx={{ my: 3 }}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ py: 5 }}
              >
                Click to select files
                <input
                  type="file"
                  multiple
                  hidden
                  accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(event) => {
                    const fileList = event.currentTarget.files;
                    if (fileList) {
                      const newFiles = Array.from(fileList);
                      
                      // Check if total files would exceed limit
                      if (values.mediaFiles.length + newFiles.length > 5) {
                        alert('You can upload a maximum of 5 files');
                        return;
                      }
                      
                      // Check file sizes
                      const oversizedFiles = newFiles.filter(file => file.size > 20 * 1024 * 1024);
                      if (oversizedFiles.length > 0) {
                        alert('Some files exceed the 20MB size limit');
                        return;
                      }
                      
                      setFieldValue('mediaFiles', [...values.mediaFiles, ...newFiles]);
                    }
                  }}
                />
              </Button>
            </Box>
            
            {values.mediaFiles.length > 0 ? (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  {values.mediaFiles.length} file(s) selected
                </Typography>
                
                {values.mediaFiles.map((file, index) => (
                  <FilePreview
                    key={index}
                    file={file}
                    onRemove={() => {
                      const newFiles = [...values.mediaFiles];
                      newFiles.splice(index, 1);
                      setFieldValue('mediaFiles', newFiles);
                    }}
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center">
                No files selected
              </Typography>
            )}
          </Box>
        );
        
      case 3: // Review & Submit
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review and Submit
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={values.isAnonymous}
                  onChange={(e) => {
                    setFieldValue('isAnonymous', e.target.checked);
                  }}
                  name="isAnonymous"
                />
              }
              label="Submit report anonymously"
            />
            
            {!values.isAnonymous && (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">
                    Contact Information
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Your contact information will be kept confidential and only used for follow-up purposes
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="contactInfo.name"
                    label="Your Name"
                    value={values.contactInfo.name}
                    onChange={handleChange}
                    error={touched.contactInfo?.name && Boolean(errors.contactInfo?.name)}
                    helperText={touched.contactInfo?.name && errors.contactInfo?.name}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="contactInfo.phone"
                    label="Phone Number"
                    value={values.contactInfo.phone}
                    onChange={handleChange}
                    error={touched.contactInfo?.phone && Boolean(errors.contactInfo?.phone)}
                    helperText={touched.contactInfo?.phone && errors.contactInfo?.phone}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="contactInfo.email"
                    label="Email Address"
                    value={values.contactInfo.email}
                    onChange={handleChange}
                    error={touched.contactInfo?.email && Boolean(errors.contactInfo?.email)}
                    helperText={touched.contactInfo?.email && errors.contactInfo?.email}
                  />
                </Grid>
              </Grid>
            )}
            
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Report Summary
              </Typography>
              
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Incident Type</Typography>
                      <Typography variant="body2">
                        {values.incidentType === 'physical' ? 'Physical Violence' :
                         values.incidentType === 'cyber' ? 'Cyber Violence/Harassment' :
                         values.incidentType === 'harassment' ? 'Harassment/Stalking' : 'Other'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Location</Typography>
                      <Typography variant="body2" noWrap>
                        {values.location.address || `Lat: ${values.location.lat.toFixed(6)}, Lng: ${values.location.lng.toFixed(6)}`}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle2">Description</Typography>
                      <Typography variant="body2">
                        {values.incidentDescription.substring(0, 150)}
                        {values.incidentDescription.length > 150 ? '...' : ''}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle2">Media Files</Typography>
                      <Typography variant="body2">
                        {values.mediaFiles.length} file(s) attached
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle2">Report Type</Typography>
                      <Typography variant="body2">
                        {values.isAnonymous ? 'Anonymous Report' : 'Identified Report'}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          </Box>
        );
        
      default:
        return null;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4 }}>
        Report an Incident
      </Typography>
      
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {submitSuccess ? (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Alert severity="success" sx={{ mb: 3 }}>
            Your report has been submitted successfully. Thank you for helping to make our community safer.
          </Alert>
          <Typography variant="body1" paragraph>
            Your report will be reviewed and prioritized by our team. If you provided contact information, you may be contacted for additional details.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Return to Home
          </Button>
        </Box>
      ) : (
        <Formik
          initialValues={initialValues}
          validationSchema={Yup.object().shape({
            incidentType: Yup.string().required('Incident type is required'),
            incidentDescription: Yup.string().required('Description is required').min(20, 'Description is too short'),
            location: Yup.object({
              lat: Yup.number().required('Latitude is required'),
              lng: Yup.number().required('Longitude is required'),
              address: Yup.string(),
            }),
            mediaFiles: Yup.array().max(5, 'Maximum 5 files allowed'),
            isAnonymous: Yup.boolean(),
            contactInfo: Yup.object({
              name: Yup.string().when(['isAnonymous'], {
                is: (isAnon: boolean) => !isAnon,
                then: (schema: any) => schema.required('Name is required'),
                otherwise: (schema: any) => schema,
              }),
              email: Yup.string().when(['isAnonymous'], {
                is: (isAnon: boolean) => !isAnon,
                then: (schema: any) => schema.email('Invalid email').required('Email is required'),
                otherwise: (schema: any) => schema.email('Invalid email'),
              }),
              phone: Yup.string().when(['isAnonymous'], {
                is: (isAnon: boolean) => !isAnon,
                then: (schema: any) => schema.matches(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
                otherwise: (schema: any) => schema,
              }),
            }),
          })}
          onSubmit={(values, actions) => {
            console.log('Form is being submitted with values:', values);
            console.log('Form submission actions:', actions);
            handleSubmit(values);
          }}
          validateOnChange={true}
          validateOnBlur={true}
        >
          {(formikProps) => {
            console.log('Formik errors:', formikProps.errors);
            return (
            <Form>
              {renderStepContent(activeStep, formikProps)}
              
              {submitError && (
                <Alert severity="error" sx={{ mt: 3, mb: 2 }}>
                  {submitError}
                </Alert>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  disabled={activeStep === 0 || isSubmitting}
                  onClick={handleBack}
                >
                  Back
                </Button>
                
                <Box>
                  {activeStep === steps.length - 1 ? (
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Report'}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={() => {
                        formikProps.validateForm().then((errors) => {
                          // Check if current step has any errors
                          let currentStepFields: string[] = [];
                          
                          switch(activeStep) {
                            case 0:
                              currentStepFields = ['incidentType', 'incidentDescription'];
                              break;
                            case 1:
                              currentStepFields = ['location.lat', 'location.lng', 'location.address'];
                              break;
                            case 2:
                              currentStepFields = ['mediaFiles'];
                              break;
                            case 3:
                              currentStepFields = ['isAnonymous', 'contactInfo.name', 'contactInfo.email', 'contactInfo.phone'];
                              break;
                          }
                          
                          const hasErrors = currentStepFields.some((field) => {
                            return field.split('.').reduce((obj: any, path: string) => obj && obj[path], errors);
                          });
                          
                          if (!hasErrors) {
                            handleNext();
                          } else {
                            // Trigger validation for all fields in the current step
                            formikProps.validateForm();
                            formikProps.setTouched(
                              currentStepFields.reduce((touched, field) => {
                                touched[field] = true;
                                return touched;
                              }, {} as any)
                            );
                          }
                        });
                      }}
                    >
                      Next
                    </Button>
                  )}
                </Box>
              </Box>
            </Form>
            );
          }}
        </Formik>
      )}
    </Paper>
  );
};

export default ReportForm; 