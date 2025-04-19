import React, { useState, useContext } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';

const ComplaintForm = () => {
  const { currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    location: ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      // Get auth token from storage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('You must be logged in to submit a complaint');
      }
      
      const response = await fetch('http://localhost:3001/api/complaints/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit complaint');
      }
      
      // Reset form on success
      setFormData({
        title: '',
        description: '',
        category: 'general',
        location: ''
      });
      
      setSuccess(true);
    } catch (err) {
      console.error('Error submitting complaint:', err);
      setError(err.message || 'An error occurred while submitting your complaint');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Your complaint has been submitted successfully.
        </Alert>
      )}
      
      <TextField
        fullWidth
        label="Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        required
        margin="normal"
      />
      
      <FormControl fullWidth margin="normal">
        <InputLabel>Category</InputLabel>
        <Select
          name="category"
          value={formData.category}
          onChange={handleChange}
          label="Category"
        >
          <MenuItem value="general">General</MenuItem>
          <MenuItem value="safety">Safety</MenuItem>
          <MenuItem value="harassment">Harassment</MenuItem>
          <MenuItem value="property">Property</MenuItem>
          <MenuItem value="noise">Noise</MenuItem>
          <MenuItem value="other">Other</MenuItem>
        </Select>
      </FormControl>
      
      <TextField
        fullWidth
        label="Location"
        name="location"
        value={formData.location}
        onChange={handleChange}
        margin="normal"
        placeholder="Address or area description"
      />
      
      <TextField
        fullWidth
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        required
        margin="normal"
        multiline
        rows={4}
      />
      
      <Button
        type="submit"
        variant="contained"
        color="primary"
        size="large"
        disabled={loading}
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Submit Complaint'}
      </Button>
    </Box>
  );
};

export default ComplaintForm; 