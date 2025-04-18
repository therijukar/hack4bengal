import React from 'react';
import { Formik, Form, Field } from 'formik';
import { Button, Box, Typography, Paper } from '@mui/material';

const TestForm = () => {
  const handleSubmit = (values: any) => {
    console.log('Test form submitted:', values);
    alert('Form submitted successfully: ' + JSON.stringify(values));
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>Test Form</Typography>
      
      <Formik
        initialValues={{ name: '', email: '' }}
        onSubmit={handleSubmit}
      >
        {() => (
          <Form>
            <Box mb={2}>
              <label htmlFor="name">Name</label>
              <Field id="name" name="name" as="input" style={{ display: 'block', width: '100%', padding: '8px' }} />
            </Box>
            
            <Box mb={3}>
              <label htmlFor="email">Email</label>
              <Field id="email" name="email" as="input" style={{ display: 'block', width: '100%', padding: '8px' }} />
            </Box>
            
            <Button type="submit" variant="contained" color="primary">
              Submit Test Form
            </Button>
          </Form>
        )}
      </Formik>
    </Paper>
  );
};

export default TestForm; 